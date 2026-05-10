import { v4 as uuidv4 } from 'uuid';
import { BookingRepository } from '../repositories/BookingRepository';
import { AccommodationRepository } from '../repositories/AccommodationRepository';
import { Booking } from '../entities/Booking';
import { BookingStatus } from '../types/enums';
import { config } from '../config';
import { PaymentService } from './PaymentService';
import { notificationService } from './NotificationService';

export class BookingService {
  private bookingRepo: BookingRepository;
  private accommodationRepo: AccommodationRepository;
  private paymentService: PaymentService;

  constructor() {
    this.bookingRepo = new BookingRepository();
    this.accommodationRepo = new AccommodationRepository();
    this.paymentService = new PaymentService();
  }

  async getById(id: string): Promise<Booking | null> {
    return this.bookingRepo.findById(id);
  }

  async getByReference(reference: string): Promise<Booking | null> {
    return this.bookingRepo.findByReference(reference);
  }

  async getUserBookings(userId: string, page: number = 1, pageSize: number = 20): Promise<{ data: Booking[]; total: number }> {
    const [data, total] = await this.bookingRepo.findByUser(userId, page, pageSize);
    return { data, total };
  }

  async getHostBookings(hostId: string, page: number = 1, pageSize: number = 20): Promise<{ data: Booking[]; total: number }> {
    const [data, total] = await this.bookingRepo.findByHost(hostId, page, pageSize);
    return { data, total };
  }

  async getAllBookings(page: number = 1, pageSize: number = 20): Promise<{ data: Booking[]; total: number }> {
    const [data, total] = await this.bookingRepo.findAll(page, pageSize);
    return { data, total };
  }

  async create(data: {
    userId: string;
    accommodationId: string;
    checkIn: Date;
    checkOut: Date;
    guests: number;
    specialRequests?: string;
  }): Promise<Booking> {
    const accommodation = await this.accommodationRepo.findById(data.accommodationId);
    if (!accommodation || !accommodation.isAvailable) {
      throw new Error('Accommodation not available');
    }

    if (data.guests > accommodation.maxGuests) {
      throw new Error(`Maximum ${accommodation.maxGuests} guests allowed`);
    }

    const minCheckIn = new Date();
    minCheckIn.setHours(minCheckIn.getHours() + config.booking.minAdvanceHours);
    if (new Date(data.checkIn) < minCheckIn) {
      throw new Error(`Check-in must be at least ${config.booking.minAdvanceHours} hours in advance`);
    }

    if (new Date(data.checkOut) <= new Date(data.checkIn)) {
      throw new Error('Check-out must be after check-in');
    }

    const isAvailable = await this.bookingRepo.checkAvailability(
      data.accommodationId,
      new Date(data.checkIn),
      new Date(data.checkOut)
    );
    if (!isAvailable) {
      throw new Error('Accommodation is not available for the selected dates');
    }

    const nights = Math.ceil(
      (new Date(data.checkOut).getTime() - new Date(data.checkIn).getTime()) / (1000 * 60 * 60 * 24)
    );
    const subtotal = Number(accommodation.pricePerNight) * nights;
    const totalAmount = subtotal + Number(accommodation.cleaningFee) + Number(accommodation.serviceFee);

    const reference = this.generateReference();

    const booking = await this.bookingRepo.create({
      userId: data.userId,
      accommodationId: data.accommodationId,
      checkIn: new Date(data.checkIn),
      checkOut: new Date(data.checkOut),
      guests: data.guests,
      pricePerNight: accommodation.pricePerNight,
      cleaningFee: accommodation.cleaningFee,
      serviceFee: accommodation.serviceFee,
      subtotal,
      totalAmount,
      reference,
      specialRequests: data.specialRequests,
      status: config.booking.autoConfirm ? BookingStatus.CONFIRMED : BookingStatus.PENDING,
    });

    if (config.booking.autoConfirm) {
      const paymentIntent = await this.paymentService.createPaymentIntent(
        booking.id,
        totalAmount,
        'zar'
      );
      booking.paymentId = paymentIntent.id;
      await this.bookingRepo.update(booking.id, { paymentId: paymentIntent.id } as any);
    }

    notificationService.send({
      userId: data.userId,
      title: 'Booking Created',
      message: `Your booking for ${accommodation.name} has been ${config.booking.autoConfirm ? 'confirmed' : 'submitted and is pending confirmation'}.`,
      type: config.booking.autoConfirm ? 'booking_confirmed' : 'booking_pending',
      relatedId: booking.id,
    }).catch(() => {});

    notificationService.send({
      userId: accommodation.hostId,
      title: 'New Booking Request',
      message: `You have a new booking request for ${accommodation.name}.`,
      type: 'booking_pending',
      relatedId: booking.id,
    }).catch(() => {});

    return this.bookingRepo.findById(booking.id) as Promise<Booking>;
  }

  async cancel(bookingId: string, userId: string, reason?: string): Promise<Booking> {
    const booking = await this.bookingRepo.findById(bookingId);
    if (!booking) throw new Error('Booking not found');
    if (booking.userId !== userId) throw new Error('Unauthorized');

    if ([BookingStatus.CANCELLED, BookingStatus.COMPLETED].includes(booking.status)) {
      throw new Error('Booking cannot be cancelled');
    }

    const hoursUntilCheckIn = (new Date(booking.checkIn).getTime() - Date.now()) / (1000 * 60 * 60);
    let refundAmount = 0;

    if (booking.payment?.status === 'succeeded') {
      if (hoursUntilCheckIn >= config.booking.cancellationWindowHours) {
        refundAmount = Number(booking.totalAmount);
      } else {
        refundAmount = Number(booking.totalAmount) * 0.5;
      }

      if (refundAmount > 0) {
        await this.paymentService.processRefund(booking.payment.stripePaymentIntentId, refundAmount);
      }
    }

    const cancelled = await this.bookingRepo.cancelBooking(bookingId, reason, refundAmount) as Booking;

    notificationService.send({
      userId: booking.userId,
      title: 'Booking Cancelled',
      message: `Your booking (ref: ${booking.reference}) has been cancelled.${refundAmount > 0 ? ` A refund of R${refundAmount.toFixed(2)} will be processed.` : ''}`,
      type: 'booking_cancelled',
      relatedId: bookingId,
    }).catch(() => {});

    return cancelled;
  }

  async confirm(bookingId: string): Promise<Booking | null> {
    return this.bookingRepo.update(bookingId, { status: BookingStatus.CONFIRMED });
  }

  async complete(bookingId: string): Promise<Booking | null> {
    return this.bookingRepo.update(bookingId, { status: BookingStatus.COMPLETED });
  }

  async getBookedDateRanges(accommodationId: string, year: number, month: number) {
    return this.bookingRepo.getBookedDateRanges(accommodationId, year, month);
  }

  private generateReference(): string {
    const prefix = 'SA';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}${timestamp}${random}`;
  }
}
