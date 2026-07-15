import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './payment.dto';
import { JwtAccessGuard } from '../auth/auth.guard';

@Controller('payments')
@UseGuards(JwtAccessGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  create(@Body() dto: CreatePaymentDto, @Req() req: any) {
    return this.paymentService.create(req.user.id, dto);
  }

  @Get(':id/status')
  getStatus(@Param('id') id: string, @Req() req: any) {
    return this.paymentService.getStatus(req.user.id, id);
  }
}