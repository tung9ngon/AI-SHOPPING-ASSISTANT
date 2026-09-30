import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../../database/category.entity';
import { Industry } from '../../database/industry.entity';
import { AdminCategoryService } from './category.admin.service';
import { AdminCategoryController } from './category.admin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Industry])],
  controllers: [AdminCategoryController],
  providers: [AdminCategoryService],
})
export class AdminCategoryModule {}