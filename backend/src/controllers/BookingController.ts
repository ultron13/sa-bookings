import { Request, Response, NextFunction } from 'express';
import { BookingService } from '../services/BookingService';

const bookingService = new BookingService();

export class BookingController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const booking = await bookingService.create({
        ...req.body,
        userId: req.user!.userId,
      });
      res.status(201).json({ success: true, data: booking });
    } catch (error: any) {
      const statusMap: Record<string, number> = {
        'Accommodation not available': 404,
        'Not available': 409,
        'Maximum': 400,
        'Check-in must be': 400,
        'Check-out must be': 400,
      };
      const matchedKey = Object.keys(statusMap).find((k) => error.message?.startsWith(k));
      if (matchedKey) {
        res.status(statusMap[matchedKey]).json({ success: false, error: error.message });
        return;
      }
      next(error);
    }
  }

  async getMyBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 20;
      const result = await bookingService.getUserBookings(req.user!.userId, page, pageSize);
      res.json({ success: true, data: result.data, meta: { total: result.total } });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const booking = await bookingService.getById(req.params.id);
      if (!booking) {
        res.status(404).json({ success: false, error: 'Booking not found' });
        return;
      }
      if (booking.userId !== req.user!.userId && booking.accommodation.hostId !== req.user!.userId && req.user!.role !== 'admin') {
        res.status(403).json({ success: false, error: 'Unauthorized' });
        return;
      }
      res.json({ success: true, data: booking });
    } catch (error) {
      next(error);
    }
  }

  async getByReference(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const booking = await bookingService.getByReference(req.params.reference);
      if (!booking) {
        res.status(404).json({ success: false, error: 'Booking not found' });
        return;
      }
      if (booking.userId !== req.user!.userId && req.user!.role !== 'admin') {
        res.status(403).json({ success: false, error: 'Unauthorized' });
        return;
      }
      res.json({ success: true, data: booking });
    } catch (error) {
      next(error);
    }
  }

  async cancel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { reason } = req.body;
      const booking = await bookingService.cancel(req.params.id, req.user!.userId, reason);
      res.json({ success: true, data: booking });
    } catch (error: any) {
      if (error.message === 'Unauthorized') {
        res.status(403).json({ success: false, error: error.message });
        return;
      }
      if (error.message?.includes('cannot be cancelled')) {
        res.status(400).json({ success: false, error: error.message });
        return;
      }
      next(error);
    }
  }
}
