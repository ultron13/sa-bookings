import { ReviewService } from '../services/ReviewService';

// Use module-level shared storage so we can reset between tests
let reviewStore: Record<string, any> = {};

jest.mock('../repositories/ReviewRepository', () => ({
  ReviewRepository: jest.fn().mockImplementation(() => ({
    findById: jest.fn().mockImplementation(async (id: string) => reviewStore[id] || null),
    findByAccommodation: jest.fn().mockImplementation(async (accId: string) => {
      const accReviews = Object.values(reviewStore).filter((r: any) => r.accommodationId === accId);
      return [accReviews, accReviews.length];
    }),
    findByUser: jest.fn().mockImplementation(async (userId: string) => {
      const userReviews = Object.values(reviewStore).filter((r: any) => r.userId === userId);
      return [userReviews, userReviews.length];
    }),
    findExisting: jest.fn().mockImplementation(async (userId: string, accId: string) => {
      return Object.values(reviewStore).find((r: any) => r.userId === userId && r.accommodationId === accId) || null;
    }),
    create: jest.fn().mockImplementation(async (data: any) => {
      const review = { id: `review-${Date.now()}`, createdAt: new Date(), ...data };
      reviewStore[review.id] = review;
      return review;
    }),
    update: jest.fn().mockImplementation(async (id: string, data: any) => {
      if (reviewStore[id]) reviewStore[id] = { ...reviewStore[id], ...data };
      return reviewStore[id] || null;
    }),
    delete: jest.fn().mockImplementation(async (id: string) => {
      delete reviewStore[id];
    }),
    getAverageRating: jest.fn().mockResolvedValue(4.5),
  })),
}));

jest.mock('../repositories/AccommodationRepository', () => {
  const accommodations: Record<string, any> = {
    'acc-123': { id: 'acc-123', name: 'Test Lodge', hostId: 'host-123', averageRating: 4.5, reviewCount: 10 },
    'acc-456': { id: 'acc-456', name: 'Other Lodge', hostId: 'other-host', averageRating: 4.0, reviewCount: 5 },
  };
  return {
    AccommodationRepository: jest.fn().mockImplementation(() => ({
      findById: jest.fn().mockImplementation(async (id: string) => accommodations[id] || null),
      updateRating: jest.fn().mockResolvedValue(undefined),
    })),
  };
});

jest.mock('../repositories/BookingRepository', () => ({
  BookingRepository: jest.fn().mockImplementation(() => ({
    findByUser: jest.fn().mockImplementation(async (userId: string) => {
      if (userId === 'user-with-stay') {
        return [[{ accommodationId: 'acc-123', status: 'completed' }], 1];
      }
      return [[], 0];
    }),
  })),
}));

describe('ReviewService', () => {
  let reviewService: ReviewService;

  beforeEach(() => {
    reviewService = new ReviewService();
    reviewStore = {};
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const validReview = { userId: 'user-with-stay', accommodationId: 'acc-123', rating: 5, comment: 'Amazing place!' };

    it('should create a review with valid data', async () => {
      const review = await reviewService.create(validReview);

      expect(review).toHaveProperty('id');
      expect(review.rating).toBe(5);
      expect(review.comment).toBe('Amazing place!');
      expect(review.isVerified).toBe(true);
    });

    it('should throw error for invalid rating (too low)', async () => {
      await expect(
        reviewService.create({ ...validReview, rating: 0 })
      ).rejects.toThrow('Rating must be between 1 and 5');
    });

    it('should throw error for invalid rating (too high)', async () => {
      await expect(
        reviewService.create({ ...validReview, rating: 6 })
      ).rejects.toThrow('Rating must be between 1 and 5');
    });

    it('should throw error for duplicate review', async () => {
      await reviewService.create(validReview);
      await expect(
        reviewService.create({ ...validReview, comment: 'Second review' })
      ).rejects.toThrow('You have already reviewed this accommodation');
    });
  });

  describe('getByAccommodation', () => {
    it('should return reviews for an accommodation', async () => {
      await reviewService.create({ userId: 'user-with-stay', accommodationId: 'acc-123', rating: 5, comment: 'Great!' });
      const result = await reviewService.getByAccommodation('acc-123');
      expect(result.data).toHaveLength(1);
      expect(result.data[0].comment).toBe('Great!');
    });
  });

  describe('update', () => {
    it('should update own review', async () => {
      const created = await reviewService.create({
        userId: 'user-with-stay', accommodationId: 'acc-123', rating: 3, comment: 'Okay',
      });

      const updated = await reviewService.update(created.id, 'user-with-stay', {
        rating: 4, comment: 'Actually pretty good!',
      });

      expect(updated!.rating).toBe(4);
      expect(updated!.comment).toBe('Actually pretty good!');
    });

    it('should throw error when updating another user review', async () => {
      const created = await reviewService.create({
        userId: 'user-with-stay', accommodationId: 'acc-123', rating: 4, comment: 'Good',
      });

      await expect(
        reviewService.update(created.id, 'other-user', { rating: 2 })
      ).rejects.toThrow('Unauthorized');
    });
  });

  describe('delete', () => {
    it('should delete own review', async () => {
      const created = await reviewService.create({
        userId: 'user-with-stay', accommodationId: 'acc-123', rating: 3, comment: 'Meh',
      });

      await expect(
        reviewService.delete(created.id, 'user-with-stay')
      ).resolves.not.toThrow();
    });

    it('should throw error when deleting another user review', async () => {
      const created = await reviewService.create({
        userId: 'user-with-stay', accommodationId: 'acc-123', rating: 5, comment: 'Awesome',
      });

      await expect(
        reviewService.delete(created.id, 'other-user')
      ).rejects.toThrow('Unauthorized');
    });
  });

  describe('respondToReview', () => {
    it('should allow host to respond to review', async () => {
      const created = await reviewService.create({
        userId: 'user-with-stay', accommodationId: 'acc-123', rating: 4, comment: 'Nice stay',
      });

      const responded = await reviewService.respondToReview(created.id, 'host-123', 'Thank you!');
      expect(responded!.responseFromHost).toBe('Thank you!');
    });

    it('should throw error when non-host tries to respond', async () => {
      const created = await reviewService.create({
        userId: 'user-with-stay', accommodationId: 'acc-123', rating: 5, comment: 'Perfect',
      });

      await expect(
        reviewService.respondToReview(created.id, 'wrong-host', 'Thanks')
      ).rejects.toThrow('Unauthorized');
    });
  });
});
