import { Request, Response, NextFunction } from 'express';
import { notificationService } from '../services/NotificationService';

export class NotificationController {
  async getNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const page = parseInt(req.query.page as string) || 1;
      const result = await notificationService.getForUser(userId, page);
      res.json({ success: true, data: result.data, meta: { total: result.total, unreadCount: result.unreadCount } });
    } catch (err) {
      next(err);
    }
  }

  async getUnreadCount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const count = await notificationService.getUnreadCount(userId);
      res.json({ success: true, data: { count } });
    } catch (err) {
      next(err);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const { id } = req.params;
      await notificationService.markAsRead(id, userId);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  }

  async markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      await notificationService.markAllAsRead(userId);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  }
}
