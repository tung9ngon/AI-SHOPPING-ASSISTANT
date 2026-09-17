import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Notification,
  NotificationType,
} from '../../database/notification.entity';
import { QueryNotificationDto } from './notification.dto';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notiRepo: Repository<Notification>,
  ) {}

  // Helper cho các module khác (order, price alert...) bắn thông báo in-app.
  // Thông báo chỉ là kênh phụ: lỗi ghi thông báo không được làm hỏng nghiệp vụ
  // chính (đặt hàng, đổi trạng thái...) nên nuốt lỗi + log thay vì throw.
  async push(
    userId: string,
    payload: {
      type: NotificationType;
      title: string;
      body?: string | null;
      data?: Record<string, any> | null;
    },
  ): Promise<void> {
    try {
      await this.notiRepo.save(
        this.notiRepo.create({
          user_id: userId,
          type: payload.type,
          title: payload.title,
          body: payload.body ?? null,
          data: payload.data ?? null,
          channel: 'app',
        }),
      );
    } catch (err) {
      this.logger.error(`Không ghi được thông báo cho user ${userId}: ${err}`);
    }
  }

  // GET /api/users/me/notifications
  async findMine(userId: string, query: QueryNotificationDto) {
    const { page = 1, limit = 15 } = query;

    const [items, total] = await this.notiRepo.findAndCount({
      where: { user_id: userId, channel: 'app' },
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    const unreadCount = await this.notiRepo.count({
      where: { user_id: userId, channel: 'app', is_read: false },
    });

    return {
      items: items.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        body: n.body,
        data: n.data,
        is_read: n.is_read,
        created_at: n.created_at,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      unread_count: unreadCount,
    };
  }

  // GET /api/users/me/notifications/unread-count — nhẹ, cho badge chuông header
  async unreadCount(userId: string) {
    const count = await this.notiRepo.count({
      where: { user_id: userId, channel: 'app', is_read: false },
    });
    return { count };
  }

  // PUT /api/users/me/notifications/:id/read
  async markRead(userId: string, id: string) {
    const noti = await this.notiRepo.findOne({
      where: { id, user_id: userId },
    });
    if (!noti) throw new NotFoundException('Không tìm thấy thông báo');

    if (!noti.is_read) {
      noti.is_read = true;
      await this.notiRepo.save(noti);
    }
    return { id: noti.id, is_read: true };
  }

  // PUT /api/users/me/notifications/read-all
  async markAllRead(userId: string) {
    await this.notiRepo.update(
      { user_id: userId, is_read: false },
      { is_read: true },
    );
    return { message: 'Đã đánh dấu tất cả thông báo là đã đọc' };
  }
}
