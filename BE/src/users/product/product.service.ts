import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../database/product.entity';
import { ProductReview } from '../../database/product-review.entity';
import { OrderItem } from '../../database/order-item.entity';
import {
  CreateProductReviewDto,
  QueryProductDto,
  QueryProductReviewDto,
} from './product.dto';
import { OrderStatus } from '../../database/order.entity';
import { User } from '../../database/user.entity';


const COMPLETED_ORDER_STATUS: OrderStatus = 'paid';

// Từ vô nghĩa trong câu hỏi mua sắm - bỏ đi trước khi tra cứu cho trợ lý AI.
// Gồm cả đơn vị tiền vì khoảng giá đã đi theo tham số minPrice/maxPrice riêng.
// Cố ý KHÔNG bỏ 'đồng': 'đồng hồ' là một danh mục hàng thật của shop.
const ASSISTANT_STOPWORDS = new Set([
  'cho', 'của', 'và', 'có', 'là', 'ở', 'với', 'thì', 'mà', 'những', 'các',
  'một', 'cái', 'gì', 'nào', 'không', 'được', 'khoảng', 'tầm', 'dưới', 'trên',
  'giá', 'mua', 'tìm', 'cần', 'muốn', 'giúp', 'tôi', 'mình', 'bạn', 'em',
  'anh', 'chị', 'hãng', 'loại', 'sản', 'phẩm', 'nhu', 'cầu', 'ạ', 'nhé',
  'xin', 'chào', 'về', 'để', 'khi', 'nếu', 'hơn', 'nhất', 'rất', 'hay',
  'hoặc', 'trong', 'ngoài', 'này', 'kia', 'đó', 'nữa', 'thêm', 'làm',
  'triệu', 'nghìn', 'ngàn', 'vnđ', 'vnd',
]);

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(ProductReview)
    private readonly reviewRepo: Repository<ProductReview>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
  ) {}

  // ---------- GET /api/products ----------
  async findAll(query: QueryProductDto) {
    const {
      search,
      categoryId,
      brand,
      tag,
      minPrice,
      maxPrice,
      sort,
      page = 1,
      limit = 20,
    } = query;

    const qb = this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.tags', 'tags')
      .leftJoinAndSelect(
        'product.images',
        'primaryImage',
        'primaryImage.is_primary = true',
      )
      .where('product.is_active = true');

    if (search) {
      qb.andWhere('product.name ILIKE :search', { search: `%${search}%` });
    }
    if (categoryId) {
      qb.andWhere('product.category_id = :categoryId', { categoryId });
    }
    if (brand) {
      qb.andWhere('product.brand ILIKE :brand', { brand: `%${brand}%` });
    }
    if (tag) {
      qb.andWhere('tags.name ILIKE :tag', { tag: `%${tag}%` });
    }
    if (minPrice !== undefined) {
      qb.andWhere('product.price >= :minPrice', { minPrice });
    }
    if (maxPrice !== undefined) {
      qb.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    switch (sort) {
      case 'price_asc':
        qb.orderBy('product.price', 'ASC');
        break;
      case 'price_desc':
        qb.orderBy('product.price', 'DESC');
        break;
      case 'rating_desc':
        qb.orderBy('product.rating', 'DESC');
        break;
      case 'newest':
      default:
        qb.orderBy('product.created_at', 'DESC');
    }

    qb.skip((page - 1) * limit).take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      items: items.map((p) => this.toListItem(p)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  private toListItem(p: Product) {
    return {
      id: p.id,
      name: p.name,
      brand: p.brand,
      price: p.price,
      rating: p.rating,
      primary_image: p.images?.[0]?.image_url ?? null,
      category_name: p.category?.name ?? null,
      tags: p.tags?.map((t) => t.name) ?? [],
    };
  }

  // ---------- GET /api/products/brands ----------
  /** Danh sách các hãng (brand) đang có sản phẩm active - phục vụ filter UI */
  async findAllBrands(): Promise<string[]> {
    const rows = await this.productRepo
      .createQueryBuilder('product')
      .select('DISTINCT product.brand', 'brand')
      .where('product.is_active = true')
      .andWhere('product.brand IS NOT NULL')
      .orderBy('product.brand', 'ASC')
      .getRawMany<{ brand: string }>();
    return rows.map((r) => r.brand);
  }

  // ---------- Tra cứu riêng cho trợ lý AI ----------
  /**
   * Tìm sản phẩm cho trợ lý AI. Khác findAll ở ba điểm:
   * - Tách câu hỏi thành từ khoá và bỏ từ vô nghĩa. AI hay truyền nguyên cụm
   *   ("laptop cho sinh viên"); ILIKE nguyên cụm trên tên thì gần như luôn rỗng.
   * - Mỗi từ khoá dò trên tên, hãng, mô tả, tên danh mục và tag.
   * - Khớp-tất-cả ra rỗng thì nới thành khớp-bất-kỳ, để còn thứ mà tư vấn.
   */
  async searchForAssistant(args: {
    query?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    limit?: number;
  }) {
    const tokens = this.tokenizeQuery(args.query);
    const items = await this.runAssistantSearch(tokens, args, 'all');
    if (items.length > 0 || tokens.length < 2) return items;
    return this.runAssistantSearch(tokens, args, 'any');
  }

  private tokenizeQuery(query?: string): string[] {
    if (!query) return [];
    const words = query
      .toLowerCase()
      .split(/[^\p{L}\p{N}]+/u)
      .filter(
        (w) =>
          w.length > 1 && !/^\d+$/.test(w) && !ASSISTANT_STOPWORDS.has(w),
      );
    return [...new Set(words)];
  }

  private async runAssistantSearch(
    tokens: string[],
    args: {
      brand?: string;
      minPrice?: number;
      maxPrice?: number;
      limit?: number;
    },
    mode: 'all' | 'any',
  ) {
    const qb = this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.tags', 'tags')
      .leftJoinAndSelect(
        'product.images',
        'primaryImage',
        'primaryImage.is_primary = true',
      )
      .where('product.is_active = true');

    if (tokens.length) {
      // Tag dò bằng EXISTS chứ không join: join kèm điều kiện sẽ cắt mất các
      // tag không khớp từ khoá, làm 'tags' trả về bị thiếu.
      const clauses = tokens.map(
        (_, i) =>
          `(product.name ILIKE :kw${i} OR product.brand ILIKE :kw${i}` +
          ` OR product.description ILIKE :kw${i} OR category.name ILIKE :kw${i}` +
          ` OR EXISTS (SELECT 1 FROM product_tag_map map` +
          ` JOIN tags tag ON tag.id = map.tag_id` +
          ` WHERE map.product_id = product.id AND tag.name ILIKE :kw${i}))`,
      );
      const params = Object.fromEntries(
        tokens.map((t, i) => [`kw${i}`, `%${t}%`]),
      );
      qb.andWhere(`(${clauses.join(mode === 'all' ? ' AND ' : ' OR ')})`, params);
    }

    if (args.brand) {
      qb.andWhere('product.brand ILIKE :brand', { brand: `%${args.brand}%` });
    }
    if (args.minPrice !== undefined) {
      qb.andWhere('product.price >= :minPrice', { minPrice: args.minPrice });
    }
    if (args.maxPrice !== undefined) {
      qb.andWhere('product.price <= :maxPrice', { maxPrice: args.maxPrice });
    }

    const limit = args.limit ?? 6;
    const products = await qb
      .orderBy('product.rating', 'DESC', 'NULLS LAST')
      // Chế độ nới lỏng lấy rộng hơn rồi mới xếp lại theo độ khớp.
      .take(mode === 'all' ? limit : limit * 10)
      .getMany();

    if (mode === 'any') {
      // Khớp-bất-kỳ mà chỉ xếp theo rating thì "đồng hồ thông minh" sẽ ra
      // laptop, chỉ vì mô tả laptop có chữ "thông". Ưu tiên khớp nhiều từ hơn.
      products.sort(
        (a, b) => this.matchScore(b, tokens) - this.matchScore(a, tokens),
      );
    }

    return products.slice(0, limit).map((p) => this.toListItem(p));
  }

  /**
   * Điểm khớp của một sản phẩm với bộ từ khoá.
   * Khớp ở tên/hãng/danh mục/tag tính gấp đôi khớp trong mô tả: mô tả là văn bản
   * dài nên hay khớp nhầm ("đồng thời", "thông minh" trong mô tả một cái laptop
   * đủ để nó đè cả cái đồng hồ thật khi khách hỏi "đồng hồ thông minh").
   */
  private matchScore(p: Product, tokens: string[]): number {
    const strong = [
      p.name,
      p.brand,
      p.category?.name,
      ...(p.tags?.map((t) => t.name) ?? []),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    const description = (p.description ?? '').toLowerCase();

    return tokens.reduce(
      (score, t) =>
        score + (strong.includes(t) ? 2 : 0) + (description.includes(t) ? 1 : 0),
      0,
    );
  }

  /** Sản phẩm khách đã mua (đơn đã thanh toán) - để trợ lý AI tư vấn theo lịch sử. */
  async findPurchasedByUser(userId: string, limit = 10) {
    const rows = await this.orderItemRepo
      .createQueryBuilder('item')
      .innerJoinAndSelect('item.order', 'order')
      .innerJoinAndSelect('item.product', 'product')
      .leftJoinAndSelect('product.category', 'category')
      .where('order.user_id = :userId', { userId })
      .andWhere('order.status = :status', { status: COMPLETED_ORDER_STATUS })
      .orderBy('order.created_at', 'DESC')
      .take(limit * 3)
      .getMany();

    // Một sản phẩm có thể nằm trong nhiều đơn - chỉ giữ lần mua gần nhất.
    const seen = new Set<string>();
    const purchased: {
      id: string;
      name: string;
      brand: string | null;
      price: number;
      category_name: string | null;
      quantity: number;
    }[] = [];

    for (const row of rows) {
      if (seen.has(row.product_id)) continue;
      seen.add(row.product_id);
      purchased.push({
        id: row.product.id,
        name: row.product.name,
        brand: row.product.brand,
        price: row.product.price,
        category_name: row.product.category?.name ?? null,
        quantity: row.quantity,
      });
      if (purchased.length >= limit) break;
    }
    return purchased;
  }

  // ---------- GET /api/products/:id ----------
  async findOne(id: string) {
    const product = await this.productRepo.findOne({
      where: { id, is_active: true },
      relations: { category: true, images: true, specs: true, tags: true },
    });
    if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');

    const reviewCount = await this.reviewRepo.count({ where: { product_id: id } });

    return { ...product, review_count: reviewCount };
  }

  // ---------- GET /api/products/:id/specs ----------
  async findSpecs(id: string) {
    const product = await this.productRepo.findOne({
      where: { id, is_active: true },
      relations: { specs: true },
    });
    if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');

    return product.specs.map((s) => ({
      spec_key: s.spec_key,
      spec_value: s.spec_value,
      spec_unit: s.spec_unit,
    }));
  }

  // ---------- GET /api/products/:id/reviews ----------
  async findReviews(id: string, query: QueryProductReviewDto) {
    const { page = 1, limit = 20 } = query;

    const [items, total] = await this.reviewRepo.findAndCount({
      where: { product_id: id },
      relations: { user: true },
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items: items.map((r) => ({
        id: r.id,
        user_name: (r.user as User)?.full_name ?? 'Ẩn danh',
        avatar_url: (r.user as User)?.avatar_url ?? null,
        rating: r.rating,
        title: r.title,
        content: r.content,
        created_at: r.created_at,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ---------- POST /api/products/:id/reviews ----------
  async createReview(
    productId: string,
    userId: string,
    dto: CreateProductReviewDto,
  ): Promise<ProductReview> {
    const product = await this.productRepo.findOne({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');

    const purchasedItem = await this.orderItemRepo
      .createQueryBuilder('orderItem')
      .innerJoin('orderItem.order', 'order')
      .where('orderItem.product_id = :productId', { productId })
      .andWhere('order.user_id = :userId', { userId })
      .andWhere('order.status = :status', { status: COMPLETED_ORDER_STATUS })
      .getOne();

    if (!purchasedItem) {
      throw new ForbiddenException(
        'Bạn cần mua sản phẩm này (đơn hàng đã hoàn tất) trước khi đánh giá',
      );
    }

    const existed = await this.reviewRepo.findOne({
      where: { product_id: productId, user_id: userId },
    });
    if (existed) {
      throw new ForbiddenException('Bạn đã đánh giá sản phẩm này rồi');
    }

    const review = this.reviewRepo.create({
      product_id: productId,
      user_id: userId,
      rating: String(dto.rating),
      title: dto.title ?? null,
      content: dto.content ?? null,
    });
    return this.reviewRepo.save(review);
  }
}