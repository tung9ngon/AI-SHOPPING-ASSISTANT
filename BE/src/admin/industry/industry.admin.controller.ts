import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { IndustryAdminService } from './industry.admin.service';
import {
  CreateIndustryDto,
  QueryIndustryDto,
  UpdateIndustryDto,
} from './industry.admin.dto';
import { JwtAccessGuard, RolesGuard } from '../../users/auth/auth.guard';
import { Roles } from '../../users/auth/auth.decorator';

@Controller('admin/industries')
@UseGuards(JwtAccessGuard, RolesGuard)
@Roles('admin')
export class IndustryAdminController {
  constructor(private readonly industryAdminService: IndustryAdminService) {}

  // GET /api/admin/industries
  @Get()
  findAll(@Query() query: QueryIndustryDto) {
    return this.industryAdminService.findAll(query);
  }

  // GET /api/admin/industries/:id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.industryAdminService.findOne(id);
  }

  // POST /api/admin/industries
  @Post()
  create(@Body() dto: CreateIndustryDto) {
    return this.industryAdminService.create(dto);
  }

  // PATCH /api/admin/industries/:id
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateIndustryDto) {
    return this.industryAdminService.update(id, dto);
  }

  // DELETE /api/admin/industries/:id
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.industryAdminService.delete(id);
  }

  // DELETE /api/admin/industries/:id/hard
  @Delete(':id/hard')
  deleteHard(@Param('id') id: string) {
    return this.industryAdminService.deleteHard(id);
  }
}
