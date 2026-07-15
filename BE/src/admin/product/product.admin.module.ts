import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../../database/product.entity';
import { ProductImage } from '../../database/product-image.entity';
import { ProductSpec } from '../../database/product-spec.entity';
import { Tag } from '../../database/tag.entity';
import { AdminProductService } from './product.admin.service';
import {AdminProductController} from './product.admin.controller'

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductImage, ProductSpec, Tag]),
  ],
  controllers: [AdminProductController],
  providers: [AdminProductService],
})
export class AdminProductModule {}