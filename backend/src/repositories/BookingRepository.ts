import { Repository, Between } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Booking } from '../entities/Booking';
import { BookingStatus } from '../types/enums';

export class BookingRepository {
  private repo: Repository<Booking>;

  constructor() {
    this.repo = AppDataSource.getRepository(Booking);
  }

  async findById(id: string): Promise<Booking | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['user', 'accommodation', 'payment'],
    });
  }

  async findByReference(reference: string): Promise<Booking | null> {
    return this.repo.findOne({
      where: { reference },
      relations: ['user', 'accommodation', 'payment'],
    });
  }

  async findByUser(userId: string, page: number = 1, pageSize: number = 20): Promise<[Booking[], number]> {
    return this.repo.findAndCount({
      where: { userId },
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
      relations: ['accommodation', 'payment'],
    });
  }

  async findByHost(hostId: string, page: number = 1, pageSize: number = 20): Promise<[Booking[], number]> {
    return this.repo.createQueryBuilder('booking')
      .leftJoinAndSelect('booking.accommodation', 'accommodation')
      .leftJoinAndSelect('booking.user', 'user')
      .leftJoinAndSelect('booking.payment', 'payment')
      .where('accommodation.hostId = :hostId', { hostId })
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('booking.createdAt', 'DESC')
      .getManyAndCount();
  }

  async findByAccommodation(accommodationId: string): Promise<Booking[]> {
    return this.repo.find({
      where: {
        accommodationId,
        status: BookingStatus.CONFIRMED,
      },
      order: { checkIn: 'ASC' },
    });
  }

  async checkAvailability(accommodationId: string, checkIn: Date, checkOut: Date): Promise<boolean> {
    const conflicting = await this.repo.createQueryBuilder('booking')
      .where('booking.accommodationId = :accommodationId', { accommodationId })
      .andWhere('booking.status IN (:...statuses)', {
        statuses: [BookingStatus.CONFIRMED, BookingStatus.PENDING],
      })
      .andWhere(
        '(booking.checkIn < :checkOut AND booking.checkOut > :checkIn)',
        { checkIn, checkOut }
      )
      .getCount();

    return conflicting === 0;
  }

  async create(data: Partial<Booking>): Promise<Booking> {
    const booking = this.repo.create(data);
    return this.repo.save(booking);
  }

  async update(id: string, data: Partial<Booking>): Promise<Booking | null> {
    await this.repo.update(id, data);
    return this.findById(id);
  }

  async cancelBooking(id: string, reason?: string, refundAmount?: number): Promise<Booking | null> {
    await this.repo.update(id, {
      status: BookingStatus.CANCELLED,
      cancelledAt: new Date(),
      cancellationReason: reason || null,
      refundAmount: refundAmount || null,
    });
    return this.findById(id);
  }

  async getRevenueStats(startDate: Date, endDate: Date): Promise<number> {
    const result = await this.repo.createQueryBuilder('booking')
      .select('COALESCE(SUM(booking.totalAmount), 0)', 'total')
      .where('booking.status IN (:...statuses)', {
        statuses: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED],
      })
      .andWhere('booking.createdAt BETWEEN :start AND :end', { start: startDate, end: endDate })
      .getRawOne();
    return parseFloat(result?.total || '0');
  }

  async getBookingCountsByStatus(): Promise<{ status: string; count: number }[]> {
    return this.repo.createQueryBuilder('booking')
      .select('booking.status', 'status')
      .addSelect('COUNT(booking.id)', 'count')
      .groupBy('booking.status')
      .getRawMany();
  }

  async getMonthlyRevenue(year: number): Promise<{ month: string; revenue: number }[]> {
    return this.repo.createQueryBuilder('booking')
      .select("TO_CHAR(booking.createdAt, 'YYYY-MM')", 'month')
      .addSelect('COALESCE(SUM(booking.totalAmount), 0)', 'revenue')
      .where('booking.status IN (:...statuses)', {
        statuses: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED],
      })
      .andWhere("EXTRACT(YEAR FROM booking.createdAt) = :year", { year })
      .groupBy("month")
      .orderBy('month', 'ASC')
      .getRawMany();
  }
}
