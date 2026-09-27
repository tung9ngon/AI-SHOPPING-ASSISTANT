import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Industry } from '../../database/industry.entity';
import { Category } from '../../database/category.entity';
import { Product } from '../../database/product.entity';
import { ProductImage } from '../../database/product-image.entity';
import { IndustryController } from './industry.controller';
import { IndustryService } from './industry.service';

@Module({
  imports: [TypeOrmModule.forFeature([Industry, Category, Product, ProductImage])],
  controllers: [IndustryController],
  providers: [IndustryService],
})
export class IndustryModule {}
