import { Request, Response, NextFunction } from 'express';
import { AccommodationService } from '../services/AccommodationService';

const accommodationService = new AccommodationService();

export class AccommodationController {
  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await accommodationService.search(req.query as any);
      res.json({
        success: true,
        data: result.data,
        meta: {
          page: result.page,
          pageSize: result.pageSize,
          totalCount: result.total,
          totalPages: Math.ceil(result.total / result.pageSize),
          hasNextPage: result.page * result.pageSize < result.total,
          hasPreviousPage: result.page > 1,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const accommodation = await accommodationService.getByIdPublic(req.params.id);
      if (!accommodation) {
        res.status(404).json({ success: false, error: 'Accommodation not found' });
        return;
      }
      res.json({ success: true, data: accommodation });
    } catch (error) {
      next(error);
    }
  }

  async getFeatured(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const accommodations = await accommodationService.getFeatured();
      res.json({ success: true, data: accommodations });
    } catch (error) {
      next(error);
    }
  }

  async getProvinceCounts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const counts = await accommodationService.getProvinceCounts();
      res.json({ success: true, data: counts });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const accommodation = await accommodationService.create({
        ...req.body,
        hostId: req.user!.userId,
      });
      res.status(201).json({ success: true, data: accommodation });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const accommodation = await accommodationService.update(
        req.params.id,
        req.user!.userId,
        req.body
      );
      if (!accommodation) {
        res.status(404).json({ success: false, error: 'Accommodation not found' });
        return;
      }
      res.json({ success: true, data: accommodation });
    } catch (error: any) {
      if (error.message === 'Unauthorized') {
        res.status(403).json({ success: false, error: error.message });
        return;
      }
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await accommodationService.delete(req.params.id, req.user!.userId);
      res.json({ success: true, message: 'Accommodation deleted' });
    } catch (error: any) {
      if (error.message === 'Unauthorized') {
        res.status(403).json({ success: false, error: error.message });
        return;
      }
      next(error);
    }
  }

  async getMyListings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 20;
      const result = await accommodationService.getByHost(req.user!.userId, page, pageSize);
      res.json({ success: true, data: result.data, meta: { total: result.total } });
    } catch (error) {
      next(error);
    }
  }
}
