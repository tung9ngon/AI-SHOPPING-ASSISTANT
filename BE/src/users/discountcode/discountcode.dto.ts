import { Type } from 'class-transformer';
import { IsNumber, IsString, Min, MaxLength } from 'class-validator';

// POST /api/discount-codes/validate
export class ValidateDiscountCodeDto {
  @IsString()
  @MaxLength(50)
  code: string;

  // Tổng giá trị đơn hàng hiện tại, dùng để kiểm tra min_order_value và tính discount_amount
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  order_value: number;
}