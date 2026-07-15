import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Min, MaxLength } from 'class-validator';
import { OrderStatus } from '../../database/order.entity';

// POST /api/orders
export class CreateOrderDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  discount_code?: string;

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