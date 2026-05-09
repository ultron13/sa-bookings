import { AdminService } from '../services/AdminService';

const mockFindAll = jest.fn();
const mockFindById = jest.fn();
const mockUpdate = jest.fn();

jest.mock('../repositories/UserRepository', () => ({
  UserRepository: jest.fn().mockImplementation(() => ({
    findAll: mockFindAll,
    findById: mockFindById,
    update: mockUpdate,
  })),
}));

jest.mock('../repositories/BookingRepository', () => ({
  BookingRepository: jest.fn().mockImplementation(() => ({
    getRevenueStats: jest.fn().mockResolvedValue(50000),
    getBookingCountsByStatus: jest.fn().mockResolvedValue([
      { status: 'confirmed', count: 10 },
      { status: 'pending', count: 5 },
    ]),
    getMonthlyRevenue: jest.fn().mockResolvedValue([
      { month: '2026-01', revenue: 15000 },
      { month: '2026-02', revenue: 20000 },
    ]),
    findByUser: jest.fn().mockResolvedValue([[{ id: 'b1', status: 'confirmed' }], 1]),
  })),
}));

jest.mock('../repositories/AccommodationRepository', () => ({
  AccommodationRepository: jest.fn().mockImplementation(() => ({
    getProvinceCounts: jest.fn().mockResolvedValue([
      { province: 'Western Cape', count: 5 },
      { province: 'Gauteng', count: 3 },
    ]),
  })),
}));

describe('AdminService', () => {
  let adminService: AdminService;

  beforeEach(() => {
    adminService = new AdminService();
    mockFindAll.mockReset();
    mockFindById.mockReset();
    mockUpdate.mockReset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getDashboardStats', () => {
    it('should return dashboard stats with all required fields', async () => {
      const stats = await adminService.getDashboardStats();
      expect(stats).toHaveProperty('totalBookings');
      expect(stats).toHaveProperty('totalRevenue');
      expect(stats).toHaveProperty('activeListings');
      expect(stats).toHaveProperty('occupancyRate');
      expect(stats).toHaveProperty('averageRating');
      expect(stats).toHaveProperty('revenueByMonth');
      expect(stats).toHaveProperty('bookingsByStatus');
      expect(stats).toHaveProperty('recentBookings');
      expect(stats).toHaveProperty('topProvinces');
    });

    it('should calculate total bookings from booking counts by status', async () => {
      const stats = await adminService.getDashboardStats();
      expect(stats.totalBookings).toBe(15);
    });

    it('should return total revenue', async () => {
      const stats = await adminService.getDashboardStats();
      expect(stats.totalRevenue).toBe(50000);
    });

    it('should calculate active listings from province counts', async () => {
      const stats = await adminService.getDashboardStats();
      expect(stats.activeListings).toBe(8);
    });

    it('should map province counts to topProvinces format', async () => {
      const stats = await adminService.getDashboardStats();
      expect(stats.topProvinces[0]).toHaveProperty('province');
      expect(stats.topProvinces[0]).toHaveProperty('bookings');
      expect(stats.topProvinces[0].province).toBe('Western Cape');
      expect(stats.topProvinces[0].bookings).toBe(5);
    });

    it('should return monthly revenue', async () => {
      const stats = await adminService.getDashboardStats();
      expect(stats.revenueByMonth).toHaveLength(2);
      expect(stats.revenueByMonth[0]).toHaveProperty('month');
    });

    it('should have fixed occupancy rate and average rating', async () => {
      const stats = await adminService.getDashboardStats();
      expect(stats.occupancyRate).toBe(65);
      expect(stats.averageRating).toBe(4.2);
    });
  });

  describe('getUsers', () => {
    it('should return paginated users', async () => {
      mockFindAll.mockResolvedValue([
        [{ id: 'u1', email: 'user1@test.com' }, { id: 'u2', email: 'user2@test.com' }],
        2,
      ]);

      const result = await adminService.getUsers();
      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should accept custom page and pageSize', async () => {
      mockFindAll.mockResolvedValue([[{ id: 'u1' }], 1]);

      const result = await adminService.getUsers(2, 10);
      expect(mockFindAll).toHaveBeenCalledWith(2, 10);
      expect(result.data).toHaveLength(1);
    });

    it('should use default page 1 and pageSize 20', async () => {
      mockFindAll.mockResolvedValue([[], 0]);

      await adminService.getUsers();
      expect(mockFindAll).toHaveBeenCalledWith(1, 20);
    });

    it('should return empty list when no users', async () => {
      mockFindAll.mockResolvedValue([[], 0]);

      const result = await adminService.getUsers();
      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('toggleUserStatus', () => {
    it('should toggle active user to inactive', async () => {
      mockFindById.mockResolvedValue({ id: 'u1', email: 'user@test.com', isActive: true });
      mockUpdate.mockResolvedValue({ id: 'u1', isActive: false });

      await adminService.toggleUserStatus('u1');
      expect(mockUpdate).toHaveBeenCalledWith('u1', { isActive: false });
    });

    it('should toggle inactive user to active', async () => {
      mockFindById.mockResolvedValue({ id: 'u2', email: 'inactive@test.com', isActive: false });
      mockUpdate.mockResolvedValue({ id: 'u2', isActive: true });

      await adminService.toggleUserStatus('u2');
      expect(mockUpdate).toHaveBeenCalledWith('u2', { isActive: true });
    });

    it('should throw error when user not found', async () => {
      mockFindById.mockResolvedValue(null);

      await expect(adminService.toggleUserStatus('non-existent')).rejects.toThrow('User not found');
    });
  });
});
