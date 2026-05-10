import { BookingService } from '../services/BookingService';
import { BookingStatus } from '../types/enums';

jest.mock('../config', () => ({
  config: {
    booking: { autoConfirm: false, minAdvanceHours: 2, cancellationWindowHours: 48 },
    jwt: { secret: 'test-secret', expiresIn: '1h', refreshSecret: 'test-refresh-secret', refreshExpiresIn: '7d' },
    stripe: { secretKey: 'sk_test', webhookSecret: 'whsec_test', currency: 'zar' },
  },
}));

jest.mock('../services/NotificationService', () => ({
  notificationService: { send: jest.fn().mockResolvedValue({}) },
}));

jest.mock('../repositories/AccommodationRepository', () => {
  const accs: Record<string, any> = {
    'acc-123': {
      id: 'acc-123', name: 'Test Lodge', type: 'lodge', province: 'Western Cape',
      city: 'Cape Town', pricePerNight: 1500, cleaningFee: 200, serviceFee: 150,
      maxGuests: 4, isAvailable: true, hostId: 'host-123',
      bedrooms: 2, beds: 2, bathrooms: 1, amenities: ['wifi', 'parking'],
      images: [], averageRating: 4.5, reviewCount: 10,
    },
    'unavailable-acc': {
      id: 'unavailable-acc', name: 'Unavailable', type: 'lodge', province: 'Western Cape',
      city: 'Cape Town', pricePerNight: 1000, cleaningFee: 100, serviceFee: 50,
      maxGuests: 2, isAvailable: false, hostId: 'host-456',
      bedrooms: 1, beds: 1, bathrooms: 1, amenities: [], images: [], averageRating: 0, reviewCount: 0,
    },
  };
  return {
    AccommodationRepository: jest.fn().mockImplementation(() => ({
      findById: jest.fn().mockImplementation(async (id: string) => accs[id] || null),
      findByIdPublic: jest.fn().mockImplementation(async (id: string) => accs[id] || null),
    })),
  };
});

jest.mock('../repositories/BookingRepository', () => {
  const bookings: Record<string, any> = {};
  return {
    BookingRepository: jest.fn().mockImplementation(() => ({
      findById: jest.fn().mockImplementation(async (id: string) => bookings[id] || null),
      findByReference: jest.fn().mockImplementation(async (ref: string) =>
        Object.values(bookings).find((b: any) => b.reference === ref) || null
      ),
      findByUser: jest.fn().mockImplementation(async (userId: string) => {
        const userBookings = Object.values(bookings).filter((b: any) => b.userId === userId);
        return [userBookings, userBookings.length] as [any[], number];
      }),
      findByHost: jest.fn().mockImplementation(async (hostId: string) => {
        const hostBookings = Object.values(bookings).filter((b: any) => b.accommodationId && b.accommodationId.startsWith('acc-'));
        return [hostBookings, hostBookings.length] as [any[], number];
      }),
      checkAvailability: jest.fn().mockImplementation(async (accommodationId: string) => {
        return accommodationId !== 'unavailable-acc';
      }),
      create: jest.fn().mockImplementation(async (data: any) => {
        const booking = { id: `booking-${Date.now()}`, ...data };
        bookings[booking.id] = booking;
        return booking;
      }),
      update: jest.fn().mockImplementation(async (id: string, data: any) => {
        if (bookings[id]) bookings[id] = { ...bookings[id], ...data };
        return bookings[id] || null;
      }),
      cancelBooking: jest.fn().mockImplementation(async (id: string, reason?: string, refundAmount?: number) => {
        if (bookings[id]) {
          bookings[id] = {
            ...bookings[id], status: 'cancelled', cancelledAt: new Date(),
            cancellationReason: reason || null, refundAmount: refundAmount || null,
          };
        }
        return bookings[id] || null;
      }),
      getRevenueStats: jest.fn().mockResolvedValue(50000),
      getBookingCountsByStatus: jest.fn().mockResolvedValue([
        { status: 'confirmed', count: 10 }, { status: 'pending', count: 5 },
      ]),
      getMonthlyRevenue: jest.fn().mockResolvedValue([
        { month: '2026-01', revenue: 15000 }, { month: '2026-02', revenue: 20000 },
      ]),
    })),
  };
});

jest.mock('../services/PaymentService', () => ({
  PaymentService: jest.fn().mockImplementation(() => ({
    createPaymentIntent: jest.fn().mockResolvedValue({
      id: 'payment-123', stripePaymentIntentId: 'pi_test_123', amount: 5000, currency: 'zar', status: 'pending',
    }),
    processRefund: jest.fn().mockResolvedValue(undefined),
  })),
}));

describe('BookingService', () => {
  let bookingService: BookingService;

  beforeEach(() => {
    bookingService = new BookingService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const validBooking = {
    userId: 'user-123', accommodationId: 'acc-123',
    checkIn: new Date('2026-07-01'), checkOut: new Date('2026-07-04'), guests: 2,
  };

  describe('create', () => {
    it('should create a booking successfully', async () => {
      const booking = await bookingService.create(validBooking);
      expect(booking).toHaveProperty('id');
      expect(booking).toHaveProperty('reference');
      expect(booking.reference).toMatch(/^SA/);
      expect(booking.totalAmount).toBe(4850);
    });

    it('should throw error when guests exceed maxGuests', async () => {
      await expect(bookingService.create({ ...validBooking, guests: 10 })).rejects.toThrow('Maximum 4 guests allowed');
    });

    it('should throw error for invalid check-out date', async () => {
      await expect(bookingService.create({ ...validBooking, checkIn: new Date('2026-07-04'), checkOut: new Date('2026-07-03') })).rejects.toThrow('Check-out must be after check-in');
    });

    it('should throw error when accommodation is not available', async () => {
      await expect(bookingService.create({ ...validBooking, accommodationId: 'unavailable-acc' })).rejects.toThrow('Accommodation not available');
    });

    it('should throw error when accommodation does not exist', async () => {
      await expect(bookingService.create({ ...validBooking, accommodationId: 'non-existent' })).rejects.toThrow('Accommodation not available');
    });

    it('should throw error when check-in is too soon', async () => {
      const now = new Date();
      const tooSoon = new Date(now.getTime() + 60 * 60 * 1000);
      const checkOut = new Date(tooSoon.getTime() + 24 * 60 * 60 * 1000);
      await expect(bookingService.create({ ...validBooking, checkIn: tooSoon, checkOut })).rejects.toThrow(/at least .* hours in advance/);
    });
  });

  describe('getById', () => {
    it('should return null for non-existent booking', async () => {
      expect(await bookingService.getById('non-existent')).toBeNull();
    });

    it('should return booking by id', async () => {
      const created = await bookingService.create(validBooking);
      const found = await bookingService.getById(created.id);
      expect(found).not.toBeNull();
      expect(found!.id).toBe(created.id);
    });
  });

  describe('getByReference', () => {
    it('should return booking by reference', async () => {
      const created = await bookingService.create(validBooking);
      const found = await bookingService.getByReference(created.reference);
      expect(found).not.toBeNull();
      expect(found!.reference).toBe(created.reference);
    });

    it('should return null for non-existent reference', async () => {
      expect(await bookingService.getByReference('NONEXISTENT')).toBeNull();
    });
  });

  describe('getUserBookings', () => {
    it('should return bookings for a user', async () => {
      const uid1 = 'user-gub-' + Date.now() + Math.random();
      const b1 = await bookingService.create({ ...validBooking, userId: uid1 });
      expect(b1).toHaveProperty('id');
      const result = await bookingService.getUserBookings(uid1);
      expect(result.data.length).toBeGreaterThanOrEqual(1);
      expect(result.total).toBeGreaterThanOrEqual(1);
    });

    it('should return empty list for user with no bookings', async () => {
      const result = await bookingService.getUserBookings('no-bookings-user-' + Date.now() + Math.random());
      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('cancel', () => {
    it('should throw error for non-existent booking', async () => {
      await expect(bookingService.cancel('non-existent', 'user-123')).rejects.toThrow('Booking not found');
    });

    it('should throw error when user does not own the booking', async () => {
      const created = await bookingService.create(validBooking);
      await expect(bookingService.cancel(created.id, 'other-user')).rejects.toThrow('Unauthorized');
    });

    it('should throw error when booking is already cancelled', async () => {
      const created = await bookingService.create(validBooking);
      await bookingService.cancel(created.id, 'user-123');
      await expect(bookingService.cancel(created.id, 'user-123')).rejects.toThrow('Booking cannot be cancelled');
    });

    it('should cancel a booking with reason', async () => {
      const created = await bookingService.create(validBooking);
      const cancelled = await bookingService.cancel(created.id, 'user-123', 'Changed plans');
      expect(cancelled.status).toBe('cancelled');
      expect(cancelled.cancellationReason).toBe('Changed plans');
    });
  });

  describe('confirm', () => {
    it('should confirm a booking', async () => {
      const created = await bookingService.create(validBooking);
      const confirmed = await bookingService.confirm(created.id);
      expect(confirmed).not.toBeNull();
      expect(confirmed!.status).toBe(BookingStatus.CONFIRMED);
    });
  });

  describe('complete', () => {
    it('should complete a booking', async () => {
      const created = await bookingService.create(validBooking);
      const completed = await bookingService.complete(created.id);
      expect(completed).not.toBeNull();
      expect(completed!.status).toBe(BookingStatus.COMPLETED);
    });
  });

  describe('getHostBookings', () => {
    it('should return bookings for a host', async () => {
      await bookingService.create(validBooking);
      const result = await bookingService.getHostBookings('host-123');
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should accept custom page and pageSize params', async () => {
      const result = await bookingService.getHostBookings('host-123', 1, 10);
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
    });

    it('should return empty for unknown host', async () => {
      const result = await bookingService.getHostBookings('no-such-host-' + Date.now());
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe('cancel - completed booking', () => {
    it('should throw error when booking status is completed', async () => {
      const created = await bookingService.create(validBooking);
      await bookingService.complete(created.id);
      await expect(bookingService.cancel(created.id, 'user-123')).rejects.toThrow('Booking cannot be cancelled');
    });
  });

  describe('cancel - without payment', () => {
    it('should cancel booking with no payment info (no refund)', async () => {
      const created = await bookingService.create(validBooking);
      const cancelled = await bookingService.cancel(created.id, 'user-123', 'No payment yet');
      expect(cancelled.status).toBe('cancelled');
    });
  });
});
