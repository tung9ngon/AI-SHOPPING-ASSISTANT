import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  GoogleGenerativeAI,
  SchemaType,
  type FunctionDeclaration,
} from '@google/generative-ai';
import { ProductService } from '../product/product.service';
import { CartService } from '../cart/cart.service';
import { ChatDto } from './chat.dto';

// Khai báo công cụ để Gemini tự gọi khi cần tra sản phẩm thật.
const SEARCH_PRODUCTS: FunctionDeclaration = {
  name: 'search_products',
  description:
    'Tìm sản phẩm trong cửa hàng. Từ khoá được tra trên tên, hãng, mô tả, danh mục và tag. Dùng khi khách hỏi về sản phẩm, nhu cầu, hoặc giá.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      query: {
        type: SchemaType.STRING,
        description:
          'Từ khoá ngắn gọn mô tả thứ khách cần, ví dụ: "laptop sinh viên", "điện thoại pin trâu". Đưa từ khoá, không đưa nguyên câu hỏi của khách.',
      },
      brand: { type: SchemaType.STRING, description: 'Hãng, ví dụ: "Dell", "Asus"' },
      minPrice: { type: SchemaType.NUMBER, description: 'Giá tối thiểu (VNĐ)' },
      maxPrice: { type: SchemaType.NUMBER, description: 'Giá tối đa (VNĐ)' },
    },
  },
};

// Hai công cụ dưới chỉ được đưa cho Gemini khi khách đã đăng nhập.
// Không có tham số nên bỏ hẳn 'parameters' (Gemini không nhận properties rỗng).
const GET_MY_CART: FunctionDeclaration = {
  name: 'get_my_cart',
  description:
    'Xem giỏ hàng hiện tại của khách. Dùng khi khách hỏi về giỏ hàng, muốn tư vấn phụ kiện đi kèm, hoặc muốn so sánh với thứ đang định mua.',
};

const GET_MY_ORDERS: FunctionDeclaration = {
  name: 'get_my_orders',
  description:
    'Xem các sản phẩm khách đã mua trước đây (đơn đã thanh toán). Dùng khi khách hỏi từng mua gì, muốn mua lại, hoặc khi cần gợi ý hợp với hãng/dòng sản phẩm khách quen dùng.',
};

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly genAI: GoogleGenerativeAI;
  private readonly modelName: string;

  constructor(
    private readonly config: ConfigService,
    private readonly productService: ProductService,
    private readonly cartService: CartService,
  ) {
    this.genAI = new GoogleGenerativeAI(
      this.config.get<string>('gemini.apiKey') ?? '',
    );
    this.modelName =
      this.config.get<string>('gemini.model') ?? 'gemini-1.5-flash';
  }

  async chat(dto: ChatDto, userId?: string) {
    if (!this.config.get<string>('gemini.apiKey')) {
      throw new ServiceUnavailableException(
        'Chưa cấu hình GEMINI_API_KEY trong .env của backend',
      );
    }

    const brands = await this.productService.findAllBrands();
    const systemInstruction = `Bạn là trợ lý mua sắm của "AI Shop" - cửa hàng bán đồ điện tử (laptop, điện thoại, đồng hồ thông minh, phụ kiện...).
Nhiệm vụ: tư vấn và gợi ý sản phẩm phù hợp nhu cầu của khách.
Các hãng đang có: ${brands.length ? brands.join(', ') : 'đang cập nhật'}.
QUY TẮC:
- Khi khách hỏi về sản phẩm, nhu cầu, hoặc giá: LUÔN dùng công cụ search_products để tra sản phẩm THẬT rồi tư vấn dựa trên kết quả.
- KHÔNG bịa ra sản phẩm không có trong kết quả tra cứu.
- Trả lời NGẮN GỌN, thân thiện, bằng tiếng Việt. Giá tính bằng VNĐ.
- Nếu không tìm thấy sản phẩm phù hợp, gợi ý khách thử từ khoá/khoảng giá khác.
${
  userId
    ? `- Khách ĐÃ ĐĂNG NHẬP: dùng get_my_cart để xem giỏ hàng, get_my_orders để xem sản phẩm khách đã mua.
- Khi tư vấn, ưu tiên thứ hợp với hãng/dòng khách từng mua. Đừng gợi lại đúng sản phẩm khách đã có trong giỏ.
- Chỉ gọi hai công cụ này khi câu hỏi thật sự cần, không gọi ở mọi lượt.`
    : `- Khách CHƯA ĐĂNG NHẬP: không có dữ liệu giỏ hàng hay lịch sử mua. Nếu khách hỏi về giỏ hàng/đơn hàng của họ, mời khách đăng nhập.`
}`;

    const model = this.genAI.getGenerativeModel({
      model: this.modelName,
      systemInstruction,
      tools: [
        {
          functionDeclarations: userId
            ? [SEARCH_PRODUCTS, GET_MY_CART, GET_MY_ORDERS]
            : [SEARCH_PRODUCTS],
        },
      ],
    });

    // Lịch sử: chỉ giữ text, đúng role Gemini ('user' | 'model').
    const history = (dto.history ?? [])
      .filter((h) => h && (h.role === 'user' || h.role === 'model') && h.text)
      .map((h) => ({ role: h.role, parts: [{ text: h.text }] }));
    // Gemini YÊU CẦU history bắt đầu bằng role 'user' -> bỏ các tin 'model' ở đầu
    // (vd tin chào của bot). Nếu không sẽ lỗi "First content should be with role 'user'".
    while (history.length && history[0].role !== 'user') history.shift();

    const chat = model.startChat({ history });

    try {
      let result = await chat.sendMessage(dto.message);
      let products: any[] = [];

      // Vòng lặp function-calling (giới hạn để tránh lặp vô hạn).
      for (let i = 0; i < 3; i++) {
        const calls = result.response.functionCalls();
        if (!calls || calls.length === 0) break;

        const functionResponses = [];
        for (const call of calls) {
          if (call.name === 'search_products') {
            const found = await this.searchProducts(call.args as any);
            products = found;
            functionResponses.push({
              functionResponse: {
                name: call.name,
                response: { products: found },
              },
            });
          } else if (call.name === 'get_my_cart') {
            functionResponses.push({
              functionResponse: {
                name: call.name,
                response: userId
                  ? await this.myCart(userId)
                  : { error: 'Khách chưa đăng nhập' },
              },
            });
          } else if (call.name === 'get_my_orders') {
            functionResponses.push({
              functionResponse: {
                name: call.name,
                response: userId
                  ? {
                      purchased:
                        await this.productService.findPurchasedByUser(userId),
                    }
                  : { error: 'Khách chưa đăng nhập' },
              },
            });
          } else {
            functionResponses.push({
              functionResponse: {
                name: call.name,
                response: { error: 'Công cụ không hỗ trợ' },
              },
            });
          }
        }
        result = await chat.sendMessage(functionResponses);
      }

      return { reply: result.response.text(), products };
    } catch (err) {
      const msg = (err as Error).message ?? String(err);
      this.logger.error(`Gemini lỗi (model=${this.modelName}): ${msg}`);
      // Trả message dễ hiểu thay vì 500 thô.
      throw new ServiceUnavailableException(
        `Trợ lý AI tạm thời không phản hồi được (model "${this.modelName}"). ` +
          `Kiểm tra GEMINI_MODEL/GEMINI_API_KEY trong .env. Chi tiết: ${msg}`,
      );
    }
  }

  private async searchProducts(args: {
    query?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
  }) {
    // searchForAssistant (không phải findAll): tách từ khoá và tra trên nhiều
    // trường, vì AI thường truyền cả cụm chứ không phải đúng tên sản phẩm.
    // items: { id, name, brand, price, rating, primary_image, category_name, tags }
    return this.productService.searchForAssistant({
      query: args.query,
      brand: args.brand,
      minPrice: args.minPrice,
      maxPrice: args.maxPrice,
      limit: 6,
    });
  }

  // Rút gọn giỏ hàng trước khi đưa cho Gemini - bỏ ảnh và id cho đỡ tốn token.
  private async myCart(userId: string) {
    const cart = await this.cartService.getMyCart(userId);
    return {
      items: cart.items.map((i) => ({
        name: i.product.name,
        price: i.product.price,
        quantity: i.quantity,
      })),
      subtotal: cart.subtotal,
    };
  }
}
