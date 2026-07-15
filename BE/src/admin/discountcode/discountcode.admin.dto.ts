import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MaxLength,
} from 'class-validator';

// GET /api/admin/discount-codes
export class QueryDiscountCodeDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;

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

// POST /api/admin/discount-codes
export class CreateDiscountCodeDto {
  @IsString()
  @MaxLength(50)
  code: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @IsIn(['percent', 'fixed_amount'])
  discount_type: 'percent' | 'fixed_amount';

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  discount_value: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  min_order_value?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  max_discount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  usage_limit?: number;

  @IsOptional()
  @IsDateString()
  valid_until?: string;
}

// PUT /api/admin/discount-codes/:id
// Chỉ cho phép sửa các trường vận hành, không cho đổi code/discount_type gốc
export class UpdateDiscountCodeDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  discount_value?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  usage_limit?: number;

  @IsOptional()
  @IsDateString()
  valid_from?: string;

  @IsOptional()
  @IsDateString()
  valid_until?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}