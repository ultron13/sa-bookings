import { ReviewRepository } from '../repositories/ReviewRepository';
import { AccommodationRepository } from '../repositories/AccommodationRepository';
import { BookingRepository } from '../repositories/BookingRepository';
import { Review } from '../entities/Review';
import { BookingStatus } from '../types/enums';

export class ReviewService {
  private reviewRepo: ReviewRepository;
  private accommodationRepo: AccommodationRepository;
  private bookingRepo: BookingRepository;

  constructor() {
    this.reviewRepo = new ReviewRepository();
    this.accommodationRepo = new AccommodationRepository();
    this.bookingRepo = new BookingRepository();
  }

  async getByAccommodation(accommodationId: string, page: number = 1, pageSize: number = 20): Promise<{ data: Review[]; total: number }> {
    const [data, total] = await this.reviewRepo.findByAccommodation(accommodationId, page, pageSize);
    return { data, total };
  }

  async getByUser(userId: string, page: number = 1, pageSize: number = 20): Promise<{ data: Review[]; total: number }> {
    const [data, total] = await this.reviewRepo.findByUser(userId, page, pageSize);
    return { data, total };
  }

  async create(data: {
    userId: string;
    accommodationId: string;
    rating: number;
    comment: string;
  }): Promise<Review> {
    if (data.rating < 1 || data.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const existing = await this.reviewRepo.findExisting(data.userId, data.accommodationId);
    if (existing) {
      throw new Error('You have already reviewed this accommodation');
    }

    const [bookings] = await this.bookingRepo.findByUser(data.userId);
    const hasCompletedStay = bookings.some(
      (b) =>
        b.accommodationId === data.accommodationId &&
        b.status === BookingStatus.COMPLETED
    );

    const review = await this.reviewRepo.create({
      ...data,
      isVerified: hasCompletedStay,
    });

    await this.accommodationRepo.updateRating(data.accommodationId);
    return review;
  }

  async update(id: string, userId: string, data: { rating?: number; comment?: string }): Promise<Review | null> {
    const review = await this.reviewRepo.findById(id);
    if (!review) throw new Error('Review not found');
    if (review.userId !== userId) throw new Error('Unauthorized');

    const updated = await this.reviewRepo.update(id, data);
    if (data.rating && review.accommodationId) {
      await this.accommodationRepo.updateRating(review.accommodationId);
    }
    return updated;
  }

  async delete(id: string, userId: string): Promise<void> {
    const review = await this.reviewRepo.findById(id);
    if (!review) throw new Error('Review not found');
    if (review.userId !== userId) throw new Error('Unauthorized');

    await this.reviewRepo.delete(id);
    if (review.accommodationId) {
      await this.accommodationRepo.updateRating(review.accommodationId);
    }
  }

  async respondToReview(id: string, hostId: string, response: string): Promise<Review | null> {
    const review = await this.reviewRepo.findById(id);
    if (!review) throw new Error('Review not found');

    const accommodation = await this.accommodationRepo.findById(review.accommodationId);
    if (!accommodation || accommodation.hostId !== hostId) {
      throw new Error('Unauthorized');
    }

    return this.reviewRepo.update(id, { responseFromHost: response } as any);
  }
}
