import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MaxLength,
} from 'class-validator';
import { OrderStatus } from '../../database/order.entity';

// POST /api/orders
export class CreateOrderDto {
  @IsUUID('4', { message: 'address_id không hợp lệ' })
  address_id: string;

  // Danh sách cart_item id được TICK CHỌN ở trang giỏ hàng. Không gửi -> đặt
  // toàn bộ giỏ (giữ tương thích client cũ). Gửi mảng rỗng bị chặn từ DTO.
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty({ message: 'Chưa chọn sản phẩm nào để thanh toán' })
  @IsUUID('4', { each: true, message: 'item_ids chứa id không hợp lệ' })
  item_ids?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(50)
  discount_code?: string;

  // Mã giảm giá loại free_shipping, dùng song song với discount_code
  @IsOptional()
  @IsString()
  @MaxLength(50)
  freeship_code?: string;

  @IsOptional()
  @IsString()
  note?: string;
}

// GET /api/orders
export class QueryOrderDto {
  @IsOptional()
  @IsIn(['simulated_success', 'cancelled', 'pending', 'paid', 'shipped'])
  status?: OrderStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}