import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminProductService } from './product.admin.service';
import {
  CreateProductDto,
  CreateProductImageDto,
  CreateProductSpecDto,
  CreateProductTagDto,
  QueryAdminProductDto,
  UpdateProductDto,
  UpdateProductSpecDto,
} from './product.admin.dto';
import { JwtAccessGuard, RolesGuard } from '../../users/auth/auth.guard';
import { Roles } from '../../users/auth/auth.decorator';
@Controller('admin/products')
@UseGuards(JwtAccessGuard, RolesGuard)
@Roles('admin')
export class AdminProductController {
  constructor(private readonly adminProductService: AdminProductService) {}

  @Get()
  findAll(@Query() query: QueryAdminProductDto) {
    return this.adminProductService.findAll(query);
  }

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.adminProductService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.adminProductService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adminProductService.remove(id);
  }

  @Post(':id/images')
  addImage(@Param('id') id: string, @Body() dto: CreateProductImageDto) {
    return this.adminProductService.addImage(id, dto);
  }

  @Delete(':id/images/:image_id')
  removeImage(@Param('id') id: string, @Param('image_id') imageId: string) {
    return this.adminProductService.removeImage(id, imageId);
  }

  @Post(':id/specs')
  addSpec(@Param('id') id: string, @Body() dto: CreateProductSpecDto) {
    return this.adminProductService.addSpec(id, dto);
  }

  @Put(':id/specs/:spec_id')
  updateSpec(
    @Param('id') id: string,
    @Param('spec_id') specId: string,
    @Body() dto: UpdateProductSpecDto,
  ) {
    return this.adminProductService.updateSpec(id, specId, dto);
  }

  @Delete(':id/specs/:spec_id')
  removeSpec(@Param('id') id: string, @Param('spec_id') specId: string) {
    return this.adminProductService.removeSpec(id, specId);
  }

  @Post(':id/tags')
  addTag(@Param('id') id: string, @Body() dto: CreateProductTagDto) {
    return this.adminProductService.addTag(id, dto);
  }

  @Delete(':id/tags/:tag_id')
  removeTag(@Param('id') id: string, @Param('tag_id') tagId: string) {
    return this.adminProductService.removeTag(id, tagId);
  }
}