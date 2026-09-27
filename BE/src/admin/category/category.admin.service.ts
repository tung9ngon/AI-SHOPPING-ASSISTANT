import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Category } from '../../database/category.entity';
import { Industry } from '../../database/industry.entity';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  QueryCategoryDto,
} from './category.admin.dto';

@Injectable()
export class AdminCategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(Industry)
    private readonly industryRepo: Repository<Industry>,
  ) {}

  async findAllForAdmin(query: QueryCategoryDto) {
    const { search, isActive, industryId, page = 1, limit = 20 } = query;

    const qb = this.categoryRepo
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.industry', 'industry');

    if (search) {
      qb.andWhere('category.name ILIKE :search', { search: `%${search}%` });
    }
    if (isActive !== undefined) {
      qb.andWhere('category.isActive = :isActive', { isActive });
    }
    if (industryId) {
      qb.andWhere('category.industry_id = :industryId', { industryId });
    }

    qb.orderBy('category.sortOrder', 'ASC');

    const [items, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      items: items.map((c) => ({
        ...c,
        industry_name: c.industry?.name ?? null,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOneOrFail(id: string): Promise<Category> {
    const category = await this.categoryRepo.findOne({
      where: { id },
      relations: { industry: true },
    });
    if (!category) throw new NotFoundException('Không tìm thấy danh mục');
    return category;
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    // Validate industry exists if provided
    if (dto.industryId) {
      const industry = await this.industryRepo.findOne({
        where: { id: dto.industryId },
      });
      if (!industry) {
        throw new NotFoundException('Không tìm thấy ngành học');
      }
    }

    const category = this.categoryRepo.create({
      name: dto.name,
      icon: dto.icon ?? null,
      sortOrder: dto.sortOrder ?? 0,
      isActive: dto.isActive ?? true,
      industry_id: dto.industryId ?? null,
    });
    return this.categoryRepo.save(category);
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOneOrFail(id);

    // Validate industry if provided
    if (dto.industryId !== undefined) {
      if (dto.industryId) {
        const industry = await this.industryRepo.findOne({
          where: { id: dto.industryId },
        });
        if (!industry) {
          throw new NotFoundException('Không tìm thấy ngành học');
        }
        category.industry_id = dto.industryId;
      } else {
        category.industry_id = null;
      }
    }

    if (dto.name !== undefined) category.name = dto.name;
    if (dto.icon !== undefined) category.icon = dto.icon;
    if (dto.sortOrder !== undefined) category.sortOrder = dto.sortOrder;
    if (dto.isActive !== undefined) category.isActive = dto.isActive;

    return this.categoryRepo.save(category);
  }

  // Xoá mềm
  async remove(id: string): Promise<{ message: string }> {
    const category = await this.findOneOrFail(id);
    category.isActive = false;
    await this.categoryRepo.save(category);
    return { message: 'Đã ẩn danh mục thành công' };
  }

  // Xoá cứng khỏi DB
  async hardRemove(id: string): Promise<{ message: string }> {
    const category = await this.findOneOrFail(id);
    await this.categoryRepo.remove(category);
    return { message: 'Đã xoá danh mục thành công' };
  }
}