import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Industry } from '../../database/industry.entity';
import { Category } from '../../database/category.entity';
import { IndustryAdminController } from './industry.admin.controller';
import { IndustryAdminService } from './industry.admin.service';

@Module({
  imports: [TypeOrmModule.forFeature([Industry, Category])],
  controllers: [IndustryAdminController],
  providers: [IndustryAdminService],
})
export class IndustryAdminModule {}
