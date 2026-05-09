import dotenv from 'dotenv';
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'sa_bookings',
    synchronize: process.env.NODE_ENV === 'development',
    logging: process.env.NODE_ENV === 'development',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'super-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'refresh-secret-key-change',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    currency: 'zar',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  },
  upload: {
    maxFileSize: 5 * 1024 * 1024,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    dir: process.env.LOG_DIR || 'logs',
  },
  booking: {
    autoConfirm: process.env.BOOKING_AUTO_CONFIRM === 'true',
    cancellationWindowHours: parseInt(process.env.CANCELLATION_WINDOW_HOURS || '48', 10),
    maxGuestsPerBooking: parseInt(process.env.MAX_GUESTS_PER_BOOKING || '20', 10),
    minAdvanceHours: parseInt(process.env.MIN_ADVANCE_HOURS || '2', 10),
  },
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100,
  },
};
