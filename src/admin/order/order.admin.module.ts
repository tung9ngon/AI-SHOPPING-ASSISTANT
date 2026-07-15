import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../../database/order.entity';
import { AdminOrderService } from './order.admin.service';
import { AdminOrderController } from './order.admin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Order])],
  controllers: [AdminOrderController],
  providers: [AdminOrderService],
})
export class AdminOrderModule {}