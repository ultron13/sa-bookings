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

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  REFUNDED = 'refunded',
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

export enum Amenity {
  WIFI = 'wifi',
  POOL = 'pool',
  PARKING = 'parking',
  AIR_CONDITIONING = 'air_conditioning',
  BREAKFAST = 'breakfast',
  RESTAURANT = 'restaurant',
  BAR = 'bar',
  GYM = 'gym',
  SPA = 'spa',
  PET_FRIENDLY = 'pet_friendly',
  AIRPORT_SHUTTLE = 'airport_shuttle',
  LAUNDRY = 'laundry',
  ROOM_SERVICE = 'room_service',
  SEA_VIEW = 'sea_view',
  MOUNTAIN_VIEW = 'mountain_view',
  FIREPLACE = 'fireplace',
  KITCHEN = 'kitchen',
  TV = 'tv',
  SAFARI = 'safari',
  WINE_TASTING = 'wine_tasting',
}
