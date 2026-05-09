export enum UserRole {
  TOURIST = 'tourist',
  HOST = 'host',
  ADMIN = 'admin',
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  REFUNDED = 'refunded',
}

export enum Province {
  EASTERN_CAPE = 'Eastern Cape',
  FREE_STATE = 'Free State',
  GAUTENG = 'Gauteng',
  KWAZULU_NATAL = 'KwaZulu-Natal',
  LIMPOPO = 'Limpopo',
  MPUMALANGA = 'Mpumalanga',
  NORTH_WEST = 'North West',
  NORTHERN_CAPE = 'Northern Cape',
  WESTERN_CAPE = 'Western Cape',
}

export enum AccommodationType {
  HOTEL = 'hotel',
  LODGE = 'lodge',
  GUESTHOUSE = 'guesthouse',
  BNB = 'bed_and_breakfast',
  APARTMENT = 'apartment',
  VILLA = 'villa',
  COTTAGE = 'cottage',
  BACKPACKER = 'backpacker',
  CAMPING = 'camping',
  GAME_LODGE = 'game_lodge',
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Accommodation {
  id: string;
  name: string;
  description: string;
  type: AccommodationType;
  province: Province;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  pricePerNight: number;
  cleaningFee: number;
  serviceFee: number;
  maxGuests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  amenities: string[];
  images: string[];
  thumbnailUrl?: string;
  averageRating: number;
  reviewCount: number;
  isAvailable: boolean;
  isFeatured: boolean;
  host?: User;
  cancellationPolicy?: {
    type: 'flexible' | 'moderate' | 'strict';
    description: string;
    refundPercentage: number;
  };
  checkInTime?: string;
  checkOutTime?: string;
}

export interface Booking {
  id: string;
  reference: string;
  userId: string;
  accommodationId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  pricePerNight: number;
  cleaningFee: number;
  serviceFee: number;
  subtotal: number;
  totalAmount: number;
  status: BookingStatus;
  isPaid: boolean;
  specialRequests?: string;
  accommodation?: Accommodation;
  payment?: Payment;
  createdAt: string;
}

export interface Payment {
  id: string;
  stripePaymentIntentId: string;
  amount: number;
  amountRefunded: number;
  currency: string;
  status: string;
}

export interface Review {
  id: string;
  userId: string;
  accommodationId: string;
  rating: number;
  comment: string;
  responseFromHost?: string;
  isVerified: boolean;
  user?: User;
  createdAt: string;
}

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

export interface SearchFilters {
  province?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  guests?: number;
  checkIn?: string;
  checkOut?: string;
  amenities?: string[];
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  pageSize?: number;
}
