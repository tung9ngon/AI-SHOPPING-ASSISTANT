import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatDto } from './chat.dto';
import { OptionalJwtAccessGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/auth.decorator';
import type { JwtPayload } from '../auth/jwt.strategy';

// Public: chat widget dùng được cả khi chưa đăng nhập.
// Guard optional: có cookie hợp lệ thì gắn user để trợ lý tư vấn theo giỏ hàng
// và lịch sử mua; không có thì vẫn chat bình thường như khách vãng lai.
@Controller('chat')
@UseGuards(OptionalJwtAccessGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  chat(@Body() dto: ChatDto, @CurrentUser() user?: JwtPayload) {
    return this.chatService.chat(dto, user?.sub);
  }
}
