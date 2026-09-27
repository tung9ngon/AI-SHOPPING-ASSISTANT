import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Industry } from '../../database/industry.entity';
import { Category } from '../../database/category.entity';
import { CreateIndustryDto, UpdateIndustryDto, QueryIndustryDto } from './industry.admin.dto';

@Injectable()
export class IndustryAdminService {
  constructor(
    @InjectRepository(Industry)
    private readonly industryRepo: Repository<Industry>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  // GET /api/admin/industries
  async findAll(query: QueryIndustryDto) {
    const { search, is_active, page = 1, limit = 20 } = query;

    const qb = this.industryRepo.createQueryBuilder('industry');

    if (search) {
      qb.andWhere('industry.name ILIKE :search', { search: `%${search}%` });
    }
    if (is_active !== undefined) {
      qb.andWhere('industry.is_active = :is_active', { is_active });
    }

    const total = await qb.getCount();

    qb.orderBy('industry.sort_order', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const industries = await qb.getMany();

    // Lấy số lượng categories cho mỗi industry
    const industriesWithCount = await Promise.all(
      industries.map(async (ind) => {
        const count = await this.categoryRepo.count({
          where: { industry_id: ind.id },
        });
        return { ...ind, category_count: count };
      }),
    );

    return {
      items: industriesWithCount,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // GET /api/admin/industries/:id
  async findOne(id: string) {
    const industry = await this.industryRepo.findOne({
      where: { id },
      relations: { categories: true },
    });
    if (!industry) {
      throw new NotFoundException('Không tìm thấy ngành học');
    }

    // Sắp xếp categories theo sortOrder
    industry.categories.sort((a, b) => a.sortOrder - b.sortOrder);

    return industry;
  }

  // POST /api/admin/industries
  async create(dto: CreateIndustryDto) {
    const industry = this.industryRepo.create({
      name: dto.name,
      icon: dto.icon ?? null,
      sort_order: dto.sort_order ?? 0,
      is_active: dto.is_active ?? true,
    });
    const saved = await this.industryRepo.save(industry);
    return saved;
  }

  // PATCH /api/admin/industries/:id
  async update(id: string, dto: UpdateIndustryDto) {
    const industry = await this.industryRepo.findOne({ where: { id } });
    if (!industry) {
      throw new NotFoundException('Không tìm thấy ngành học');
    }

    if (dto.name !== undefined) industry.name = dto.name;
    if (dto.icon !== undefined) industry.icon = dto.icon;
    if (dto.sort_order !== undefined) industry.sort_order = dto.sort_order;
    if (dto.is_active !== undefined) industry.is_active = dto.is_active;

    const saved = await this.industryRepo.save(industry);
    return saved;
  }

  // DELETE /api/admin/industries/:id
  async delete(id: string) {
    const industry = await this.industryRepo.findOne({ where: { id } });
    if (!industry) {
      throw new NotFoundException('Không tìm thấy ngành học');
    }

    industry.is_active = false;
    await this.industryRepo.save(industry);
    return { message: 'Đã vô hiệu hoá ngành học' };
  }

  // DELETE /api/admin/industries/:id/hard
  async deleteHard(id: string) {
    const industry = await this.industryRepo.findOne({
      where: { id },
      relations: { categories: true },
    });
    if (!industry) {
      throw new NotFoundException('Không tìm thấy ngành học');
    }

    // Kiểm tra có categories không
    if (industry.categories.length > 0) {
      throw new BadRequestException(
        'Không thể xóa ngành học này vì còn danh mục bên trong. Hãy xóa hoặc chuyển các danh mục trước.',
      );
    }

    await this.industryRepo.remove(industry);
    return { message: 'Đã xóa ngành học' };
  }
}
