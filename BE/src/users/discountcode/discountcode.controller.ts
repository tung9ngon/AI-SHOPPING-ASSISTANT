import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { DiscountCodeService } from './discountcode.service';
import { ValidateDiscountCodeDto } from './discountcode.dto';

@Controller('discount-codes')
export class DiscountCodeController {
  constructor(private readonly discountCodeService: DiscountCodeService) {}

  // POST /api/discount-codes/validate
  @Post('validate')
  @HttpCode(200)
  validate(@Body() dto: ValidateDiscountCodeDto) {
    return this.discountCodeService.validate(dto);
  }
}