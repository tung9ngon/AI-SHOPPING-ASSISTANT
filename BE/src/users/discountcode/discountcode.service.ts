import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiscountCode } from '../../database/discount-code.entity';
import { ValidateDiscountCodeDto } from './discountcode.dto';

@Injectable()
export class DiscountCodeService {
  constructor(
    @InjectRepository(DiscountCode)
    private readonly discountRepo: Repository<DiscountCode>,
  ) {}

  // POST /api/discount-codes/validate
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

    let discountAmount = 0;
    if (isValid) {
      if (discount.discount_type === 'percent') {
        discountAmount = (dto.order_value * Number(discount.discount_value)) / 100;
        if (discount.max_discount !== null) {
          discountAmount = Math.min(discountAmount, Number(discount.max_discount));
        }
      } else {
        discountAmount = Number(discount.discount_value);
      }
      discountAmount = Math.min(discountAmount, dto.order_value);
    }

    return {
      code: discount.code,
      discount_type: discount.discount_type,
      discount_value: discount.discount_value,
      discount_amount: Math.round(discountAmount),
      min_order_value: discount.min_order_value,
      is_valid: isValid,
      ...(message ? { message } : {}),
    };
  }
}