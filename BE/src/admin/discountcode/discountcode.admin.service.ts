import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { DiscountCode } from '../../database/discount-code.entity';
import {
  CreateDiscountCodeDto,
  QueryDiscountCodeDto,
  UpdateDiscountCodeDto,
} from './discountcode.admin.dto';

@Injectable()
export class AdminDiscountCodeService {
  constructor(
    @InjectRepository(DiscountCode)
    private readonly discountRepo: Repository<DiscountCode>,
  ) {}

  private async findOrFail(id: string): Promise<DiscountCode> {
    const discount = await this.discountRepo.findOne({ where: { id } });
    if (!discount) throw new NotFoundException('Không tìm thấy mã giảm giá');
    return discount;
  }

  // GET /api/admin/discount-codes
  async findAll(query: QueryDiscountCodeDto) {
    const { search, isActive, page = 1, limit = 20 } = query;

    const [items, total] = await this.discountRepo.findAndCount({
      where: {
        ...(search ? { code: ILike(`%${search}%`) } : {}),
        ...(isActive !== undefined ? { is_active: isActive } : {}),
      },
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items: items.map((d) => ({
        id: d.id,
        code: d.code,
        discount_type: d.discount_type,
        discount_value: d.discount_value,
        usage_limit: d.usage_limit,
        used_count: d.used_count,
        valid_from: d.valid_from,
        valid_until: d.valid_until,
        is_active: d.is_active,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // POST /api/admin/discount-codes
  async create(dto: CreateDiscountCodeDto) {
    const existed = await this.discountRepo.findOne({
      where: { code: dto.code },
    });
    if (existed) throw new ConflictException('Mã giảm giá đã tồn tại');

    const discount = this.discountRepo.create({
      code: dto.code,
      description: dto.description ?? null,
      discount_type: dto.discount_type,
      discount_value: dto.discount_value,
      min_order_value: dto.min_order_value ?? null,
      max_discount: dto.max_discount ?? null,
      usage_limit: dto.usage_limit ?? null,
      valid_until: dto.valid_until ? new Date(dto.valid_until) : null,
    });
    const saved = await this.discountRepo.save(discount);

    return {
      id: saved.id,
      code: saved.code,
      discount_type: saved.discount_type,
      discount_value: saved.discount_value,
      min_order_value: saved.min_order_value,
      max_discount: saved.max_discount,
      usage_limit: saved.usage_limit,
      valid_from: saved.valid_from,
      valid_until: saved.valid_until,
    };
  }

  // PUT /api/admin/discount-codes/:id
  async update(id: string, dto: UpdateDiscountCodeDto) {
    const discount = await this.findOrFail(id);

    if (dto.discount_value !== undefined)
      discount.discount_value = dto.discount_value;
    if (dto.usage_limit !== undefined) discount.usage_limit = dto.usage_limit;
    if (dto.valid_until !== undefined)
      discount.valid_until = new Date(dto.valid_until);
    if (dto.is_active !== undefined) discount.is_active = dto.is_active;

    const saved = await this.discountRepo.save(discount);

    return {
      id: saved.id,
      discount_value: saved.discount_value,
      usage_limit: saved.usage_limit,
      valid_until: saved.valid_until,
      is_active: saved.is_active,
    };
  }

  // DELETE /api/admin/discount-codes/:id
  // Vô hiệu hoá (không xoá cứng để giữ lịch sử các đơn hàng đã dùng mã)
  async remove(id: string) {
    const discount = await this.findOrFail(id);
    discount.is_active = false;
    await this.discountRepo.save(discount);
    return { message: 'Đã vô hiệu hoá mã giảm giá' };
  }
}