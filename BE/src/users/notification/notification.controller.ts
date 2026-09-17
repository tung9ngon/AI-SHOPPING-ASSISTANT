import { Controller, Get, Param, Put, Query, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { QueryNotificationDto } from './notification.dto';
import { JwtAccessGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/auth.decorator';

@UseGuards(JwtAccessGuard)
@Controller('users/me/notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // GET /api/users/me/notifications
  @Get()
  findMine(@CurrentUser() user: any, @Query() query: QueryNotificationDto) {
    return this.notificationService.findMine(user.sub, query);
  }

  // GET /api/users/me/notifications/unread-count
  @Get('unread-count')
  unreadCount(@CurrentUser() user: any) {
    return this.notificationService.unreadCount(user.sub);
  }

  // PUT /api/users/me/notifications/read-all
  // Khai báo TRƯỚC ':id/read' để 'read-all' không bị bắt nhầm làm :id.
  @Put('read-all')
  markAllRead(@CurrentUser() user: any) {
    return this.notificationService.markAllRead(user.sub);
  }

  // PUT /api/users/me/notifications/:id/read
  @Put(':id/read')
  markRead(@CurrentUser() user: any, @Param('id') id: string) {
    return this.notificationService.markRead(user.sub, id);
  }
}
