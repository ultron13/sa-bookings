import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/AdminService';
import { BookingService } from '../services/BookingService';

const adminService = new AdminService();
const bookingService = new BookingService();

export class AdminController {
  async getDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await adminService.getDashboardStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 20;
      const result = await adminService.getUsers(page, pageSize);
      res.json({ success: true, data: result.data, meta: { total: result.total } });
    } catch (error) {
      next(error);
    }
  }

  async toggleUserStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await adminService.toggleUserStatus(req.params.userId);
      res.json({ success: true, message: 'User status updated' });
    } catch (error) {
      next(error);
    }
  }

  async getAllBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 20;

      const accommodations = await (await import('../services/AccommodationService')).AccommodationService;
      res.json({ success: true, data: [], meta: { total: 0 } });
    } catch (error) {
      next(error);
    }
  }
}
