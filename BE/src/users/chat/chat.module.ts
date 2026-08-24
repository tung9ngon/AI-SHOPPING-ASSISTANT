import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ProductModule } from '../product/product.module';
import { CartModule } from '../cart/cart.module';

@Module({
  // ProductModule export ProductService, CartModule export CartService.
  imports: [ConfigModule, ProductModule, CartModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
