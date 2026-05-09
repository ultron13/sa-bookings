import { BookingService } from '../services/BookingService';

jest.mock('../repositories/BookingRepository', () => {
  const bookings: Record<string, any> = {};
  return {
    BookingRepository: jest.fn().mockImplementation(() => ({
      findById: jest.fn().mockImplementation(async (id: string) => bookings[id] || null),
      findByReference: jest.fn().mockImplementation(async (ref: string) =>
        Object.values(bookings).find((b: any) => b.reference === ref) || null
      ),
      findByUser: jest.fn().mockImplementation(async (userId: string, page: number = 1, pageSize: number = 20) => {
        const userBookings = Object.values(bookings).filter((b: any) => b.userId === userId);
        return [userBookings, userBookings.length] as [any[], number];
      }),
      findByHost: jest.fn().mockImplementation(async (hostId: string, page: number = 1, pageSize: number = 20) => [[], 0] as [any[], number]),
      checkAvailability: jest.fn().mockResolvedValue(true),
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
            ...bookings[id],
            status: 'cancelled',
            cancelledAt: new Date(),
            cancellationReason: reason || null,
            refundAmount: refundAmount || null,
          };
        }
        return bookings[id] || null;
      }),
      getRevenueStats: jest.fn().mockResolvedValue(50000),
      getBookingCountsByStatus: jest.fn().mockResolvedValue([
        { status: 'confirmed', count: 10 },
        { status: 'pending', count: 5 },
      ]),
      getMonthlyRevenue: jest.fn().mockResolvedValue([
        { month: '2026-01', revenue: 15000 },
        { month: '2026-02', revenue: 20000 },
      ]),
    })),
  };
});

jest.mock('../repositories/AccommodationRepository', () => {
  const mockAccommodation = {
    id: 'acc-123',
    name: 'Test Lodge',
    description: 'A lovely place to stay',
    type: 'lodge',
    province: 'Western Cape',
    city: 'Cape Town',
    pricePerNight: 1500,
    cleaningFee: 200,
    serviceFee: 150,
    maxGuests: 4,
    isAvailable: true,
    bedrooms: 2,
    beds: 2,
    bathrooms: 1,
    amenities: ['wifi', 'parking'],
    images: [],
    averageRating: 4.5,
    reviewCount: 10,
    hostId: 'host-123',
  };

  return {
    AccommodationRepository: jest.fn().mockImplementation(() => ({
      findById: jest.fn().mockResolvedValue(mockAccommodation),
      findByIdPublic: jest.fn().mockResolvedValue(mockAccommodation),
    })),
  };
});

jest.mock('../services/PaymentService', () => {
  return {
    PaymentService: jest.fn().mockImplementation(() => ({
      createPaymentIntent: jest.fn().mockResolvedValue({
        id: 'payment-123',
        stripePaymentIntentId: 'pi_test_123',
        amount: 5000,
        currency: 'zar',
        status: 'pending',
      }),
      processRefund: jest.fn().mockResolvedValue(undefined),
    })),
  };
});

describe('BookingService', () => {
  let bookingService: BookingService;

  beforeEach(() => {
    bookingService = new BookingService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const validBooking = {
      userId: 'user-123',
      accommodationId: 'acc-123',
      checkIn: new Date('2026-07-01'),
      checkOut: new Date('2026-07-04'),
      guests: 2,
    };

    it('should create a booking successfully', async () => {
      const booking = await bookingService.create(validBooking);
      expect(booking).toHaveProperty('id');
      expect(booking).toHaveProperty('reference');
      expect(booking.reference).toMatch(/^SA/);
      expect(booking.totalAmount).toBe(4850); // 1500*3 + 200 + 150
    });

    it('should throw error when guests exceed maxGuests', async () => {
      await expect(
        bookingService.create({ ...validBooking, guests: 10 })
      ).rejects.toThrow('Maximum 4 guests allowed');
    });

    it('should throw error for invalid check-out date', async () => {
      await expect(
        bookingService.create({
          ...validBooking,
          checkIn: new Date('2026-07-04'),
          checkOut: new Date('2026-07-03'),
        })
      ).rejects.toThrow('Check-out must be after check-in');
    });
  });

  describe('getById', () => {
    it('should return null for non-existent booking', async () => {
      const booking = await bookingService.getById('non-existent');
      expect(booking).toBeNull();
    });
  });

  describe('cancel', () => {
    it('should throw error for non-existent booking', async () => {
      await expect(
        bookingService.cancel('non-existent', 'user-123')
      ).rejects.toThrow('Booking not found');
    });
  });
});
