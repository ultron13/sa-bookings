export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface SearchParams extends PaginationParams {
  province?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  guests?: number;
  checkIn?: string;
  checkOut?: string;
  amenities?: string[];
  rating?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export interface BookingConfirmation {
  bookingId: string;
  reference: string;
  status: string;
  totalAmount: number;
  paymentUrl?: string;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
}

export interface DashboardStats {
  totalBookings: number;
  totalRevenue: number;
  activeListings: number;
  occupancyRate: number;
  averageRating: number;
  revenueByMonth: { month: string; revenue: number }[];
  bookingsByStatus: { status: string; count: number }[];
  recentBookings: any[];
  topProvinces: { province: string; bookings: number }[];
}
