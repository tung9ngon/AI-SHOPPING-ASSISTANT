import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../../database/order.entity';
import { AdminOrderService } from './order.admin.service';
import { AdminOrderController } from './order.admin.controller';
import { PaymentModule } from '../../users/payment/payment.module';
import { NotificationModule } from '../../users/notification/notification.module';

@Module({
  imports: [TypeOrmModule.forFeature([Order]), PaymentModule, NotificationModule],
  controllers: [AdminOrderController],
  providers: [AdminOrderService],
})
export class AdminOrderModule {}