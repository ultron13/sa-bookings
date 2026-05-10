import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Notification, NotificationType } from '../entities/Notification';

export class NotificationRepository {
  private repo: Repository<Notification>;

  constructor() {
    this.repo = AppDataSource.getRepository(Notification);
  }

  async create(data: {
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    relatedId?: string;
  }): Promise<Notification> {
    const notification = this.repo.create(data);
    return this.repo.save(notification);
  }

  async findByUser(userId: string, page: number = 1, pageSize: number = 20): Promise<[Notification[], number]> {
    return this.repo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.repo.count({ where: { userId, isRead: false } });
  }

  async markAsRead(id: string, userId: string): Promise<void> {
    await this.repo.update({ id, userId }, { isRead: true });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.repo.update({ userId, isRead: false }, { isRead: true });
  }

  async deleteOld(userId: string, keepCount: number = 50): Promise<void> {
    const notifications = await this.repo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: keepCount,
    });
    if (notifications.length > 0) {
      await this.repo.remove(notifications);
    }
  }
}
