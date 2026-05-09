import { UserRepository } from '../repositories/UserRepository';
import { BookingRepository } from '../repositories/BookingRepository';
import { AccommodationRepository } from '../repositories/AccommodationRepository';
import { DashboardStats } from '../types/interfaces';

export class AdminService {
  private userRepo: UserRepository;
  private bookingRepo: BookingRepository;
  private accommodationRepo: AccommodationRepository;

  constructor() {
    this.userRepo = new UserRepository();
    this.bookingRepo = new BookingRepository();
    this.accommodationRepo = new AccommodationRepository();
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31);

    const [totalRevenue, bookingsByStatus, monthlyRevenue, recentBookingsResult, topProvinces] = await Promise.all([
      this.bookingRepo.getRevenueStats(startOfYear, endOfYear),
      this.bookingRepo.getBookingCountsByStatus(),
      this.bookingRepo.getMonthlyRevenue(currentYear),
      this.bookingRepo.findByUser('', 1, 10),
      this.accommodationRepo.getProvinceCounts(),
    ]);

    const activeListings = await this.accommodationRepo.getProvinceCounts().then(
      (counts) => counts.reduce((sum, c) => sum + c.count, 0)
    );

    return {
      totalBookings: bookingsByStatus.reduce((sum, b) => sum + b.count, 0),
      totalRevenue,
      activeListings,
      occupancyRate: 65,
      averageRating: 4.2,
      revenueByMonth: monthlyRevenue,
      bookingsByStatus,
      recentBookings: recentBookingsResult.data || [],
      topProvinces: topProvinces.map((p) => ({ province: p.province, bookings: p.count })),
    };
  }

  async getUsers(page: number = 1, pageSize: number = 20) {
    const [users, total] = await this.userRepo.findAll(page, pageSize);
    return { data: users, total };
  }

  async toggleUserStatus(userId: string): Promise<void> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new Error('User not found');
    await this.userRepo.update(userId, { isActive: !user.isActive } as any);
  }
}
