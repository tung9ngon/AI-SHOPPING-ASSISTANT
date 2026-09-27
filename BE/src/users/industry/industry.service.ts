import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Industry } from '../../database/industry.entity';
import { Category } from '../../database/category.entity';
import { Product } from '../../database/product.entity';
import { ProductImage } from '../../database/product-image.entity';
import { IndustryQueryDto } from './industry.dto';

@Injectable()
export class IndustryService {
  constructor(
    @InjectRepository(Industry)
    private readonly industryRepo: Repository<Industry>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly imageRepo: Repository<ProductImage>,
  ) {}

  // GET /api/industries - Danh sách ngành học với categories (ko products)
  async findAll() {
    const industries = await this.industryRepo.find({
      where: { is_active: true },
      relations: { categories: true },
      order: { sort_order: 'ASC' },
    });

    // Lấy product count cho mỗi category
    const industriesWithCounts = await Promise.all(
      industries.map(async (industry) => {
        const categoriesWithCounts = await Promise.all(
          industry.categories
            .filter((c) => c.isActive)
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map(async (category) => {
              const productCount = await this.productRepo.count({
                where: { category_id: category.id, is_active: true },
              });
              return {
                id: category.id,
                name: category.name,
                icon: category.icon,
                sort_order: category.sortOrder,
                product_count: productCount,
              };
            }),
        );

        return {
          id: industry.id,
          name: industry.name,
          icon: industry.icon,
          sort_order: industry.sort_order,
          categories: categoriesWithCounts,
        };
      }),
    );

    return {
      items: industriesWithCounts,
      total: industriesWithCounts.length,
    };
  }

  // GET /api/industries/:id - Chi tiết ngành học với categories và products
  async findOne(id: string, query: IndustryQueryDto) {
    const { include_products = false, page = 1, limit = 20 } = query;

    const industry = await this.industryRepo.findOne({
      where: { id, is_active: true },
      relations: { categories: true },
    });
    if (!industry) {
      throw new NotFoundException('Không tìm thấy ngành học');
    }

    // Lọc và sắp xếp categories active
    const activeCategories = industry.categories
      .filter((c) => c.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    if (!include_products) {
      return {
        id: industry.id,
        name: industry.name,
        icon: industry.icon,
        categories: activeCategories.map((c) => ({
          id: c.id,
          name: c.name,
          icon: c.icon,
          sort_order: c.sortOrder,
        })),
      };
    }

    // Với products - lấy products cho tất cả categories trong ngành
    const categoryIds = activeCategories.map((c) => c.id);

    // Query builder để lấy products với pagination
    const qb = this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect(
        'product.images',
        'primaryImage',
        'primaryImage.is_primary = true',
      )
      .where('product.category_id IN (:...categoryIds)', { categoryIds })
      .andWhere('product.is_active = true');

    const total = await qb.getCount();

    qb.orderBy('category.sortOrder', 'ASC')
      .addOrderBy('product.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const products = await qb.getMany();

    // Group products by category
    const productsByCategory = new Map<string, typeof products>();
    for (const product of products) {
      const catId = product.category_id as string; // Safe: we queried only products with category_id in list
      if (!productsByCategory.has(catId)) {
        productsByCategory.set(catId, []);
      }
      productsByCategory.get(catId)!.push(product);
    }

    const categoriesWithProducts = activeCategories.map((category) => {
      const catProducts = productsByCategory.get(category.id) ?? [];
      return {
        id: category.id,
        name: category.name,
        icon: category.icon,
        sort_order: category.sortOrder,
        products: catProducts.map((p) => ({
          id: p.id,
          name: p.name,
          brand: p.brand,
          price: p.price,
          rating: p.rating,
          primary_image: p.images?.[0]?.image_url ?? null,
        })),
      };
    });

    return {
      id: industry.id,
      name: industry.name,
      icon: industry.icon,
      categories: categoriesWithProducts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
