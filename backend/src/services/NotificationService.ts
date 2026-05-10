import { NotificationRepository } from '../repositories/NotificationRepository';
import { Notification, NotificationType } from '../entities/Notification';

export class NotificationService {
  private repo: NotificationRepository;

  constructor() {
    this.repo = new NotificationRepository();
  }

  async send(data: {
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    relatedId?: string;
  }): Promise<Notification> {
    const notification = await this.repo.create(data);
    await this.repo.deleteOld(data.userId, 50);
    return notification;
  }

  async getForUser(userId: string, page: number = 1): Promise<{ data: Notification[]; total: number; unreadCount: number }> {
    const [data, total] = await this.repo.findByUser(userId, page, 20);
    const unreadCount = await this.repo.getUnreadCount(userId);
    return { data, total, unreadCount };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.repo.getUnreadCount(userId);
  }

  async markAsRead(id: string, userId: string): Promise<void> {
    return this.repo.markAsRead(id, userId);
  }

  async markAllAsRead(userId: string): Promise<void> {
    return this.repo.markAllAsRead(userId);
  }
}

export const notificationService = new NotificationService();
