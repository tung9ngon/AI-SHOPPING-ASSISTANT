import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import type {
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from 'openai/resources/chat/completions';
import { ProductService } from '../product/product.service';
import { CartService } from '../cart/cart.service';
import { ChatDto } from './chat.dto';

// FPT AI Marketplace dùng API tương thích chuẩn OpenAI (https://github.com/fpt-corp/ai-marketplace).
const FPT_BASE_URL = 'https://mkp-api.fptcloud.com';

// Khai báo công cụ để model tự gọi khi cần tra sản phẩm thật.
const SEARCH_PRODUCTS: ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'search_products',
    description:
      'Tìm sản phẩm trong cửa hàng. Từ khoá được tra trên tên, hãng, mô tả, danh mục và tag. Dùng khi khách hỏi về sản phẩm, nhu cầu, hoặc giá.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description:
            'Từ khoá ngắn gọn mô tả thứ khách cần, ví dụ: "laptop sinh viên", "điện thoại pin trâu". Đưa từ khoá, không đưa nguyên câu hỏi của khách.',
        },
        brand: { type: 'string', description: 'Hãng, ví dụ: "Dell", "Asus"' },
        minPrice: { type: 'number', description: 'Giá tối thiểu (VNĐ)' },
        maxPrice: { type: 'number', description: 'Giá tối đa (VNĐ)' },
      },
    },
  },
};

// Hai công cụ dưới chỉ được đưa cho model khi khách đã đăng nhập.
const GET_MY_CART: ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'get_my_cart',
    description:
      'Xem giỏ hàng hiện tại của khách. Dùng khi khách hỏi về giỏ hàng, muốn tư vấn phụ kiện đi kèm, hoặc muốn so sánh với thứ đang định mua.',
  },
};

const GET_MY_ORDERS: ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'get_my_orders',
    description:
      'Xem các sản phẩm khách đã mua trước đây (đơn đã thanh toán). Dùng khi khách hỏi từng mua gì, muốn mua lại, hoặc khi cần gợi ý hợp với hãng/dòng sản phẩm khách quen dùng.',
  },
};

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly client: OpenAI;
  private readonly modelName: string;

  constructor(
    private readonly config: ConfigService,
    private readonly productService: ProductService,
    private readonly cartService: CartService,
  ) {
    this.client = new OpenAI({
      apiKey: this.config.get<string>('fpt.apiKey') ?? '',
      baseURL: FPT_BASE_URL,
    });
    this.modelName =
      this.config.get<string>('fpt.model') ?? 'DeepSeek-V4-Flash';
  }

  async chat(dto: ChatDto, userId?: string) {
    if (!this.config.get<string>('fpt.apiKey')) {
      throw new ServiceUnavailableException(
        'Chưa cấu hình FPT_API_KEY trong .env của backend',
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

    // Lịch sử FE gửi lên dùng role 'user' | 'model' (kiểu Gemini cũ) -> đổi
    // 'model' thành 'assistant' theo chuẩn OpenAI, chỉ giữ tin có text.
    const messages: ChatCompletionMessageParam[] = [
      { role: 'system', content: systemInstruction },
      ...(dto.history ?? [])
        .filter((h) => h && (h.role === 'user' || h.role === 'model') && h.text)
        .map(
          (h): ChatCompletionMessageParam => ({
            role: h.role === 'model' ? 'assistant' : 'user',
            content: h.text,
          }),
        ),
      { role: 'user', content: dto.message },
    ];

    const tools = userId
      ? [SEARCH_PRODUCTS, GET_MY_CART, GET_MY_ORDERS]
      : [SEARCH_PRODUCTS];

    try {
      let products: any[] = [];
      let reply = '';

      // Vòng lặp function-calling: 1 lượt hỏi + tối đa 3 lượt trả kết quả công cụ.
      for (let i = 0; i < 4; i++) {
        const res = await this.client.chat.completions.create({
          model: this.modelName,
          messages,
          tools,
        });
        const msg = res.choices[0]?.message;
        reply = msg?.content ?? '';

        const calls = (msg?.tool_calls ?? []).filter(
          (c) => c.type === 'function',
        );
        if (!msg || calls.length === 0) break;

        messages.push({
          role: 'assistant',
          content: msg.content ?? '',
          tool_calls: calls,
        });

        for (const call of calls) {
          const args = call.function.arguments
            ? (JSON.parse(call.function.arguments) as Record<string, unknown>)
            : {};
          let response: unknown;

          if (call.function.name === 'search_products') {
            const found = await this.searchProducts(args as any);
            products = found;
            response = { products: found };
          } else if (call.function.name === 'get_my_cart') {
            response = userId
              ? await this.myCart(userId)
              : { error: 'Khách chưa đăng nhập' };
          } else if (call.function.name === 'get_my_orders') {
            response = userId
              ? { purchased: await this.productService.findPurchasedByUser(userId) }
              : { error: 'Khách chưa đăng nhập' };
          } else {
            response = { error: 'Công cụ không hỗ trợ' };
          }

          messages.push({
            role: 'tool',
            tool_call_id: call.id,
            content: JSON.stringify(response),
          });
        }
      }

      return { reply, products };
    } catch (err) {
      const msg = (err as Error).message ?? String(err);
      this.logger.error(`FPT AI lỗi (model=${this.modelName}): ${msg}`);
      // Trả message dễ hiểu thay vì 500 thô.
      throw new ServiceUnavailableException(
        `Trợ lý AI tạm thời không phản hồi được (model "${this.modelName}"). ` +
          `Kiểm tra FPT_MODEL/FPT_API_KEY trong .env. Chi tiết: ${msg}`,
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

  // Rút gọn giỏ hàng trước khi đưa cho model - bỏ ảnh và id cho đỡ tốn token.
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
