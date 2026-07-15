import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../database/product.entity';
import { ProductImage } from '../../database/product-image.entity';
import { ProductSpec } from '../../database/product-spec.entity';
import { Tag } from '../../database/tag.entity';
import {
  CreateProductDto,
  CreateProductImageDto,
  CreateProductSpecDto,
  CreateProductTagDto,
  QueryAdminProductDto,
  UpdateProductDto,
  UpdateProductSpecDto,
} from './product.admin.dto';

@Injectable()
export class AdminProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly imageRepo: Repository<ProductImage>,
    @InjectRepository(ProductSpec)
    private readonly specRepo: Repository<ProductSpec>,
    @InjectRepository(Tag)
    private readonly tagRepo: Repository<Tag>,
  ) {}

  private async findProductOrFail(id: string): Promise<Product> {
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');
    return product;
  }

  // GET /api/admin/products
  async findAll(query: QueryAdminProductDto) {
    const {
      search,
      categoryId,
      brand,
      isActive,
      sort,
      page = 1,
      limit = 20,
    } = query;

    const qb = this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category');

    if (search) {
      qb.andWhere('product.name ILIKE :search', { search: `%${search}%` });
    }
    if (categoryId) {
      qb.andWhere('product.category_id = :categoryId', { categoryId });
    }
    if (brand) {
      qb.andWhere('product.brand ILIKE :brand', { brand: `%${brand}%` });
    }
    if (isActive !== undefined) {
      qb.andWhere('product.is_active = :isActive', { isActive });
    }

    switch (sort) {
      case 'price_asc':
        qb.orderBy('product.price', 'ASC');
        break;
      case 'price_desc':
        qb.orderBy('product.price', 'DESC');
        break;
      case 'rating_desc':
        qb.orderBy('product.rating', 'DESC');
        break;
      case 'newest':
      default:
        qb.orderBy('product.created_at', 'DESC');
    }

    qb.skip((page - 1) * limit).take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      items: items.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category?.name ?? null,
        brand: p.brand,
        price: p.price,
        rating: p.rating,
        is_active: p.is_active,
        created_at: p.created_at,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // POST /api/admin/products
  async create(dto: CreateProductDto) {
    const product = this.productRepo.create({
      name: dto.name,
      category_id: dto.category_id ?? null,
      brand: dto.brand ?? null,
      price: dto.price,
      description: dto.description ?? null,
      is_active: dto.is_active ?? true,
    });
    const saved = await this.productRepo.save(product);

    return {
      id: saved.id,
      name: saved.name,
      category_id: saved.category_id,
      brand: saved.brand,
      price: saved.price,
      description: saved.description,
      is_active: saved.is_active,
      created_at: saved.created_at,
    };
  }

  // PUT /api/admin/products/:id
  async update(id: string, dto: UpdateProductDto) {
    const product = await this.findProductOrFail(id);

    if (dto.name !== undefined) product.name = dto.name;
    if (dto.price !== undefined) product.price = dto.price;
    if (dto.description !== undefined) product.description = dto.description;
    if (dto.is_active !== undefined) product.is_active = dto.is_active;

    const saved = await this.productRepo.save(product);

    return {
      id: saved.id,
      name: saved.name,
      price: saved.price,
      description: saved.description,
      is_active: saved.is_active,
      updated_at: saved.updated_at,
    };
  }

  // DELETE /api/admin/products/:id
  // Xoá mềm: chỉ ẩn sản phẩm (is_active = false), không xoá cứng khỏi DB
  async remove(id: string) {
    const product = await this.findProductOrFail(id);
    product.is_active = false;
    await this.productRepo.save(product);
    return { message: 'Đã ẩn sản phẩm' };
  }

  // POST /api/admin/products/:id/images
  async addImage(productId: string, dto: CreateProductImageDto) {
    await this.findProductOrFail(productId);

    // Nếu set ảnh mới làm primary, bỏ cờ primary ở các ảnh cũ
    if (dto.is_primary) {
      await this.imageRepo.update(
        { product_id: productId },
        { is_primary: false },
      );
    }

    const image = this.imageRepo.create({
      product_id: productId,
      image_url: dto.image_url,
      is_primary: dto.is_primary ?? false,
      sort_order: dto.sort_order ?? 0,
    });
    const saved = await this.imageRepo.save(image);

    return {
      id: saved.id,
      image_url: saved.image_url,
      is_primary: saved.is_primary,
      sort_order: saved.sort_order,
    };
  }

  // DELETE /api/admin/products/:id/images/:image_id
  async removeImage(productId: string, imageId: string) {
    const image = await this.imageRepo.findOne({
      where: { id: imageId, product_id: productId },
    });
    if (!image) throw new NotFoundException('Không tìm thấy ảnh sản phẩm');

    await this.imageRepo.remove(image);
    return { message: 'Đã xoá ảnh sản phẩm' };
  }

  // POST /api/admin/products/:id/specs
  async addSpec(productId: string, dto: CreateProductSpecDto) {
    await this.findProductOrFail(productId);

    const spec = this.specRepo.create({
      product_id: productId,
      spec_key: dto.spec_key,
      spec_value: dto.spec_value,
      spec_unit: dto.spec_unit ?? null,
    });
    const saved = await this.specRepo.save(spec);

    return {
      id: saved.id,
      spec_key: saved.spec_key,
      spec_value: saved.spec_value,
      spec_unit: saved.spec_unit,
    };
  }

  // PUT /api/admin/products/:id/specs/:spec_id
  async updateSpec(
    productId: string,
    specId: string,
    dto: UpdateProductSpecDto,
  ) {
    const spec = await this.specRepo.findOne({
      where: { id: specId, product_id: productId },
    });
    if (!spec) throw new NotFoundException('Không tìm thấy thông số kỹ thuật');

    if (dto.spec_key !== undefined) spec.spec_key = dto.spec_key;
    if (dto.spec_value !== undefined) spec.spec_value = dto.spec_value;
    if (dto.spec_unit !== undefined) spec.spec_unit = dto.spec_unit;

    const saved = await this.specRepo.save(spec);

    return {
      id: saved.id,
      spec_key: saved.spec_key,
      spec_value: saved.spec_value,
      spec_unit: saved.spec_unit,
    };
  }

  // DELETE /api/admin/products/:id/specs/:spec_id
  async removeSpec(productId: string, specId: string) {
    const spec = await this.specRepo.findOne({
      where: { id: specId, product_id: productId },
    });
    if (!spec) throw new NotFoundException('Không tìm thấy thông số kỹ thuật');

    await this.specRepo.remove(spec);
    return { message: 'Đã xoá thông số kỹ thuật' };
  }

  // POST /api/admin/products/:id/tags
  async addTag(productId: string, dto: CreateProductTagDto) {
    const product = await this.productRepo.findOne({
      where: { id: productId },
      relations: { tags: true },
    });
    if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');

    let tag = await this.tagRepo.findOne({ where: { name: dto.tag } });
    if (!tag) {
      tag = await this.tagRepo.save(this.tagRepo.create({ name: dto.tag }));
    }

    const alreadyLinked = product.tags?.some((t) => t.id === tag!.id);
    if (!alreadyLinked) {
      product.tags = [...(product.tags ?? []), tag];
      await this.productRepo.save(product);
    }

    return { id: tag.id, tag: tag.name };
  }

  // DELETE /api/admin/products/:id/tags/:tag_id
  async removeTag(productId: string, tagId: string) {
    const product = await this.productRepo.findOne({
      where: { id: productId },
      relations: { tags: true },
    });
    if (!product) throw new NotFoundException('Không tìm thấy sản phẩm');

    const exists = product.tags?.some((t) => t.id === tagId);
    if (!exists) {
      throw new NotFoundException('Sản phẩm chưa gắn tag này');
    }

    product.tags = product.tags.filter((t) => t.id !== tagId);
    await this.productRepo.save(product);

    return { message: 'Đã gỡ tag khỏi sản phẩm' };
  }
}