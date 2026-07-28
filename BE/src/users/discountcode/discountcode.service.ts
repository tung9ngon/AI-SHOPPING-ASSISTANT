import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiscountCode } from '../../database/discount-code.entity';
import { ListDiscountCodeDto, ValidateDiscountCodeDto } from './discountcode.dto';

@Injectable()
export class DiscountCodeService {
  constructor(
    @InjectRepository(DiscountCode)
    private readonly discountRepo: Repository<DiscountCode>,
  ) {}

  // Helper dùng chung cho 2 API list bên dưới
  private async listActiveCodes(
    discountType: ('percent' | 'fixed_amount')[] | ['free_shipping'],
    dto: ListDiscountCodeDto,
  ) {
    const { order_value, page = 1, limit = 20 } = dto;
    const now = new Date();

    const qb = this.discountRepo
      .createQueryBuilder('d')
      .where('d.is_active = :active', { active: true })
      .andWhere('d.discount_type IN (:...types)', { types: discountType })
      .andWhere('(d.valid_from IS NULL OR d.valid_from <= :now)', { now })
      .andWhere('(d.valid_until IS NULL OR d.valid_until >= :now)', { now })
      .andWhere('(d.usage_limit IS NULL OR d.used_count < d.usage_limit)')
      .orderBy('d.created_at', 'DESC');

    // Lọc thêm theo order_value nếu FE truyền lên (đặt điều kiện ngay trong query
    // thay vì filter ở JS để phân trang chính xác theo tổng số dòng thực tế khớp điều kiện)
    if (order_value !== undefined) {
      qb.andWhere(
        '(d.min_order_value IS NULL OR d.min_order_value <= :orderValue)',
        { orderValue: order_value },
      );
    }

    const [codes, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      items: codes.map((c) => ({
        code: c.code,
        description: c.description,
        discount_type: c.discount_type,
        discount_value: c.discount_value,
        min_order_value: c.min_order_value,
        max_discount: c.max_discount,
        valid_until: c.valid_until,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ---------- GET /api/discount-codes ----------
  // Danh sách mã giảm giá thường (percent / fixed_amount), có phân trang
  async listDiscountCodes(dto: ListDiscountCodeDto) {
    return this.listActiveCodes(['percent', 'fixed_amount'], dto);
  }

  // ---------- GET /api/discount-codes/freeship ----------
  // Danh sách mã miễn phí ship (free_shipping), có phân trang
  async listFreeshipCodes(dto: ListDiscountCodeDto) {
    return this.listActiveCodes(['free_shipping'], dto);
  }

  // ---------- POST /api/discount-codes/validate ----------
  // Chỉ kiểm tra & tính toán, KHÔNG cộng used_count ở đây.
  // used_count nên được tăng ở bước tạo đơn hàng (order) để tránh đếm trùng khi user chỉ preview.
  async validate(dto: ValidateDiscountCodeDto) {
    const discount = await this.discountRepo.findOne({
      where: { code: dto.code },
    });

    if (!discount) {
      return {
        code: dto.code,
        is_valid: false,
        message: 'Mã giảm giá không tồn tại',
      };
    }

    const now = new Date();
    let isValid = true;
    let message: string | undefined;

    if (!discount.is_active) {
      isValid = false;
      message = 'Mã giảm giá đã bị vô hiệu hoá';
    } else if (discount.valid_until && now > new Date(discount.valid_until)) {
      isValid = false;
      message = 'Mã giảm giá đã hết hạn';
    } else if (discount.valid_from && now < new Date(discount.valid_from)) {
      isValid = false;
      message = 'Mã giảm giá chưa có hiệu lực';
    } else if (
      discount.usage_limit !== null &&
      discount.used_count >= discount.usage_limit
    ) {
      isValid = false;
      message = 'Mã giảm giá đã hết lượt sử dụng';
    } else if (
      discount.min_order_value !== null &&
      dto.order_value < Number(discount.min_order_value)
    ) {
      isValid = false;
      message = `Đơn hàng tối thiểu ${Number(discount.min_order_value).toLocaleString('vi-VN')}đ để áp dụng mã này`;
    }

    const shippingFee = dto.shipping_fee ?? 0;
    let discountAmount = 0;
    if (isValid) {
      if (discount.discount_type === 'percent') {
        discountAmount = (dto.order_value * Number(discount.discount_value)) / 100;
        if (discount.max_discount !== null) {
          discountAmount = Math.min(discountAmount, Number(discount.max_discount));
        }
        discountAmount = Math.min(discountAmount, dto.order_value);
      } else if (discount.discount_type === 'free_shipping') {
        // Chỉ trừ vào phí ship, không đụng vào tiền hàng (order_value)
        discountAmount = Math.min(Number(discount.discount_value), shippingFee);
      } else {
        // fixed_amount: trừ thẳng vào tiền hàng
        discountAmount = Number(discount.discount_value);
        discountAmount = Math.min(discountAmount, dto.order_value);
      }
    }

    return {
      code: discount.code,
      discount_type: discount.discount_type,
      discount_value: discount.discount_value,
      discount_amount: Math.round(discountAmount),
      min_order_value: discount.min_order_value,
      max_discount: discount.max_discount,
      is_valid: isValid,
      ...(message ? { message } : {}),
    };
  }
}