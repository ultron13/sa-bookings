import { Request, Response, NextFunction } from 'express';
import { ReviewService } from '../services/ReviewService';

const reviewService = new ReviewService();

export class ReviewController {
  async getByAccommodation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 20;
      const result = await reviewService.getByAccommodation(req.params.accommodationId, page, pageSize);
      res.json({ success: true, data: result.data, meta: { total: result.total } });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const review = await reviewService.create({
        ...req.body,
        userId: req.user!.userId,
      });
      res.status(201).json({ success: true, data: review });
    } catch (error: any) {
      if (error.message === 'You have already reviewed this accommodation') {
        res.status(409).json({ success: false, error: error.message });
        return;
      }
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const review = await reviewService.update(req.params.id, req.user!.userId, req.body);
      res.json({ success: true, data: review });
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
      await reviewService.delete(req.params.id, req.user!.userId);
      res.json({ success: true, message: 'Review deleted' });
    } catch (error: any) {
      if (error.message === 'Unauthorized') {
        res.status(403).json({ success: false, error: error.message });
        return;
      }
      next(error);
    }
  }

  async respond(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { response } = req.body;
      const review = await reviewService.respondToReview(req.params.id, req.user!.userId, response);
      res.json({ success: true, data: review });
    } catch (error: any) {
      if (error.message === 'Unauthorized') {
        res.status(403).json({ success: false, error: error.message });
        return;
      }
      next(error);
    }
  }
}
