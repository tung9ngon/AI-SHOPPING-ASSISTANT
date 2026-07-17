import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Order, OrderStatus } from '../../database/order.entity';
import { OrderItem } from '../../database/order-item.entity';
import { Cart } from '../../database/cart.entity';
import { CartItem } from '../../database/cart-item.entity';
import { DiscountCode } from '../../database/discount-code.entity';
import { ProductImage } from '../../database/product-image.entity';
import { CreateOrderDto, QueryOrderDto } from './order.dto';

// Giả định phí ship: 30k, miễn phí nếu đơn từ 500k trở lên.
// Chỉnh 2 hằng số này nếu business logic thực tế khác.
const SHIPPING_FEE = 30_000;
const FREE_SHIPPING_THRESHOLD = 500_000;

// Chỉ cho phép huỷ khi đơn chưa được xử lý (chưa paid/shipped, chưa cancelled)
const CANCELABLE_STATUSES: OrderStatus[] = ['pending', 'simulated_success'];

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    @InjectRepository(ProductImage)
    private readonly imageRepo: Repository<ProductImage>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  // POST /api/orders - checkout từ giỏ hàng hiện tại
  async checkout(userId: string, dto: CreateOrderDto) {
    return this.dataSource.transaction(async (manager) => {
      const cartRepo = manager.getRepository(Cart);
      const cartItemRepo = manager.getRepository(CartItem);
      const discountRepo = manager.getRepository(DiscountCode);
      const orderRepo = manager.getRepository(Order);
      const orderItemRepo = manager.getRepository(OrderItem);

      const cart = await cartRepo.findOne({ where: { user_id: userId } });
      if (!cart) throw new BadRequestException('Giỏ hàng trống');

      const cartItems = await cartItemRepo.find({
        where: { cart_id: cart.id },
        relations: { product: true },
      });
      if (!cartItems.length) throw new BadRequestException('Giỏ hàng trống');

      for (const item of cartItems) {
        if (!item.product || !item.product.is_active) {
          throw new BadRequestException(
            `Sản phẩm "${item.product?.name ?? item.product_id}" hiện không khả dụng`,
          );
        }
      }

      const subtotal = cartItems.reduce(
        (sum, item) => sum + Number(item.product.price) * item.quantity,
        0,
      );

      const shippingFee =
        subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;

      let discount: DiscountCode | null = null;
      let discountAmount = 0;

      if (dto.discount_code) {
        discount = await discountRepo.findOne({
          where: { code: dto.discount_code },
        });
        if (!discount) throw new BadRequestException('Mã giảm giá không tồn tại');

        const now = new Date();
        if (!discount.is_active)
          throw new BadRequestException('Mã giảm giá đã bị vô hiệu hoá');
        if (discount.valid_until && now > new Date(discount.valid_until))
          throw new BadRequestException('Mã giảm giá đã hết hạn');
        if (discount.valid_from && now < new Date(discount.valid_from))
          throw new BadRequestException('Mã giảm giá chưa có hiệu lực');
        if (
          discount.usage_limit !== null &&
          discount.used_count >= discount.usage_limit
        )
          throw new BadRequestException('Mã giảm giá đã hết lượt sử dụng');
        if (
          discount.min_order_value !== null &&
          subtotal < Number(discount.min_order_value)
        ) {
          throw new BadRequestException(
            `Đơn hàng tối thiểu ${Number(discount.min_order_value).toLocaleString('vi-VN')}đ để áp dụng mã này`,
          );
        }

        if (discount.discount_type === 'percent') {
          discountAmount =
            (subtotal * Number(discount.discount_value)) / 100;
          if (discount.max_discount !== null) {
            discountAmount = Math.min(
              discountAmount,
              Number(discount.max_discount),
            );
          }
        } else {
          discountAmount = Number(discount.discount_value);
        }
        discountAmount = Math.round(Math.min(discountAmount, subtotal));
      }

      const total = subtotal + shippingFee - discountAmount;

      const order = orderRepo.create({
        user_id: userId,
        cart_id: cart.id,
        discount_code_id: discount?.id ?? null,
        subtotal,
        shipping_fee: shippingFee,
        discount_amount: discountAmount,
        total,
        // 'pending' = chờ thanh toán, để bước tạo giao dịch (POST /payments) hoạt động.
        status: 'pending',
        note: dto.note ?? null,
      });
      const savedOrder = await orderRepo.save(order);

      const orderItems = cartItems.map((item) =>
        orderItemRepo.create({
          order_id: savedOrder.id,
          product_id: item.product_id,
          quantity: item.quantity,
        }),
      );
      await orderItemRepo.save(orderItems);

      if (discount) {
        discount.used_count += 1;
        await discountRepo.save(discount);
      }

      // Checkout xong thì clear giỏ hàng
      await cartItemRepo.delete({ cart_id: cart.id });

      return {
        id: savedOrder.id,
        subtotal: savedOrder.subtotal,
        shipping_fee: savedOrder.shipping_fee,
        discount_amount: savedOrder.discount_amount,
        total: savedOrder.total,
        status: savedOrder.status,
        created_at: savedOrder.created_at,
      };
    });
  }

  // GET /api/orders
  async findMine(userId: string, query: QueryOrderDto) {
    const { status, page = 1, limit = 20 } = query;

    const [items, total] = await this.orderRepo.findAndCount({
      where: {
        user_id: userId,
        ...(status ? { status } : {}),
      },
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const orderIds = items.map((o) => o.id);
    const counts = orderIds.length
      ? await this.orderItemRepo
          .createQueryBuilder('item')
          .select('item.order_id', 'order_id')
          .addSelect('COUNT(*)', 'item_count')
          .where('item.order_id IN (:...orderIds)', { orderIds })
          .groupBy('item.order_id')
          .getRawMany()
      : [];
    const countMap = new Map(
      counts.map((c) => [c.order_id, Number(c.item_count)]),
    );

    return {
      items: items.map((o) => ({
        id: o.id,
        total: o.total,
        status: o.status,
        created_at: o.created_at,
        item_count: countMap.get(o.id) ?? 0,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // GET /api/orders/:id
  async findOneMine(userId: string, id: string) {
    const order = await this.orderRepo.findOne({
      where: { id, user_id: userId },
      relations: { items: { product: true } },
    });
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');

    const productIds = order.items.map((i) => i.product_id);
    const primaryImages = productIds.length
      ? await this.imageRepo.find({
          where: { product_id: In(productIds), is_primary: true },
        })
      : [];
    const imageMap = new Map(
      primaryImages.map((img) => [img.product_id, img.image_url]),
    );

    return {
      id: order.id,
      items: order.items.map((item) => ({
        product: {
          id: item.product?.id,
          name: item.product?.name,
          price: item.product?.price,
          image: imageMap.get(item.product_id) ?? null,
        },
        quantity: item.quantity,
      })),
      subtotal: order.subtotal,
      shipping_fee: order.shipping_fee,
      discount_amount: order.discount_amount,
      total: order.total,
      status: order.status,
      note: order.note,
      created_at: order.created_at,
    };
  }

  // PUT /api/orders/:id/cancel
  async cancel(userId: string, id: string) {
    const order = await this.orderRepo.findOne({
      where: { id, user_id: userId },
    });
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');

    if (!CANCELABLE_STATUSES.includes(order.status)) {
      throw new BadRequestException(
        'Đơn hàng đã được xử lý, không thể huỷ',
      );
    }

    order.status = 'cancelled';
    const saved = await this.orderRepo.save(order);

    return {
      id: saved.id,
      status: saved.status,
      updated_at: saved.updated_at,
    };
  }
}