import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../../database/order.entity';
import { QueryAdminOrderDto, UpdateOrderStatusDto } from './order.admin.dto';

@Injectable()
export class AdminOrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {}

  // GET /api/admin/orders
  async findAll(query: QueryAdminOrderDto) {
    const { search, status, from, to, page = 1, limit = 20 } = query;

    const qb = this.orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user');

    if (search) {
      qb.andWhere('user.full_name ILIKE :search', { search: `%${search}%` });
    }
    if (status) {
      qb.andWhere('order.status = :status', { status });
    }
    if (from) {
      qb.andWhere('order.created_at >= :from', { from: new Date(from) });
    }
    if (to) {
      qb.andWhere('order.created_at <= :to', { to: new Date(to) });
    }

    qb.orderBy('order.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      items: items.map((o) => ({
        id: o.id,
        user_name: o.user?.full_name ?? null,
        total: o.total,
        status: o.status,
        created_at: o.created_at,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // GET /api/admin/orders/:id
  async findOne(id: string) {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: { user: true, items: { product: true }, payment: true },
    });
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');

    return {
      id: order.id,
      user: {
        id: order.user?.id,
        full_name: order.user?.full_name,
        email: order.user?.email,
        phone_number: order.user?.phone_number,
      },
      items: order.items.map((item) => ({
        product: {
          id: item.product?.id,
          name: item.product?.name,
          price: item.product?.price,
        },
        quantity: item.quantity,
      })),
      subtotal: order.subtotal,
      shipping_fee: order.shipping_fee,
      discount_amount: order.discount_amount,
      total: order.total,
      status: order.status,
      note: order.note,
      // Chưa có Payment entity trong context, trả nguyên relation.
      // Gửi payment.entity.ts nếu cần format field cụ thể.
      payment: order.payment ?? null,
      created_at: order.created_at,
    };
  }

  // PUT /api/admin/orders/:id/status
  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');

    order.status = dto.status;
    const saved = await this.orderRepo.save(order);

    return {
      id: saved.id,
      status: saved.status,
      updated_at: saved.updated_at,
    };
  }
}