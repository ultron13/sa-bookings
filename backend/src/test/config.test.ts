jest.mock('dotenv', () => ({ config: jest.fn() }));

describe('Config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.resetModules();
  });

  it('should use default values when env vars are not set', () => {
    process.env = { NODE_ENV: undefined as any };

    const { config } = require('../config');
    expect(config.port).toBe(4000);
    expect(config.database.host).toBe('localhost');
    expect(config.database.port).toBe(5432);
    expect(config.database.username).toBe('postgres');
    expect(config.database.password).toBe('postgres');
    expect(config.database.database).toBe('sa_bookings');
    expect(config.jwt.secret).toBe('super-secret-key-change-in-production');
    expect(config.jwt.expiresIn).toBe('7d');
    expect(config.jwt.refreshSecret).toBe('refresh-secret-key-change');
    expect(config.jwt.refreshExpiresIn).toBe('30d');
    expect(config.stripe.secretKey).toBe('');
    expect(config.stripe.webhookSecret).toBe('');
    expect(config.redis.host).toBe('localhost');
    expect(config.redis.port).toBe(6379);
    expect(config.cors.origin).toBe('http://localhost:3000');
    expect(config.rateLimit.max).toBe(100);
    expect(config.logging.level).toBe('info');
    expect(config.logging.dir).toBe('logs');
    expect(config.booking.cancellationWindowHours).toBe(48);
    expect(config.booking.maxGuestsPerBooking).toBe(20);
    expect(config.booking.minAdvanceHours).toBe(2);
    expect(config.booking.autoConfirm).toBe(false);
  });

  it('should use provided env var values when set', () => {
    process.env.PORT = '5000';
    process.env.DB_HOST = 'db.example.com';
    process.env.DB_PORT = '5433';
    process.env.DB_USERNAME = 'myuser';
    process.env.DB_PASSWORD = 'mypassword';
    process.env.DB_NAME = 'mydb';
    process.env.JWT_SECRET = 'my-jwt-secret';
    process.env.JWT_EXPIRES_IN = '24h';
    process.env.JWT_REFRESH_SECRET = 'my-refresh-secret';
    process.env.JWT_REFRESH_EXPIRES_IN = '14d';
    process.env.STRIPE_SECRET_KEY = 'sk_live_xxx';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_xxx';
    process.env.REDIS_HOST = 'redis.example.com';
    process.env.REDIS_PORT = '6380';
    process.env.CORS_ORIGIN = 'https://myapp.co.za';
    process.env.RATE_LIMIT_MAX = '200';
    process.env.LOG_LEVEL = 'debug';
    process.env.LOG_DIR = '/var/logs';
    process.env.CANCELLATION_WINDOW_HOURS = '72';
    process.env.MAX_GUESTS_PER_BOOKING = '10';
    process.env.MIN_ADVANCE_HOURS = '4';
    process.env.BOOKING_AUTO_CONFIRM = 'true';

    const { config } = require('../config');
    expect(config.port).toBe(5000);
    expect(config.database.host).toBe('db.example.com');
    expect(config.database.port).toBe(5433);
    expect(config.database.username).toBe('myuser');
    expect(config.database.password).toBe('mypassword');
    expect(config.database.database).toBe('mydb');
    expect(config.jwt.secret).toBe('my-jwt-secret');
    expect(config.jwt.expiresIn).toBe('24h');
    expect(config.jwt.refreshSecret).toBe('my-refresh-secret');
    expect(config.jwt.refreshExpiresIn).toBe('14d');
    expect(config.stripe.secretKey).toBe('sk_live_xxx');
    expect(config.stripe.webhookSecret).toBe('whsec_xxx');
    expect(config.redis.host).toBe('redis.example.com');
    expect(config.redis.port).toBe(6380);
    expect(config.cors.origin).toBe('https://myapp.co.za');
    expect(config.rateLimit.max).toBe(200);
    expect(config.logging.level).toBe('debug');
    expect(config.logging.dir).toBe('/var/logs');
    expect(config.booking.cancellationWindowHours).toBe(72);
    expect(config.booking.maxGuestsPerBooking).toBe(10);
    expect(config.booking.minAdvanceHours).toBe(4);
    expect(config.booking.autoConfirm).toBe(true);
  });

  it('should set synchronize and logging to true in development mode', () => {
    process.env.NODE_ENV = 'development';
    const { config } = require('../config');
    expect(config.database.synchronize).toBe(true);
    expect(config.database.logging).toBe(true);
    expect(config.env).toBe('development');
  });

  it('should set synchronize and logging to false in production mode', () => {
    process.env.NODE_ENV = 'production';
    const { config } = require('../config');
    expect(config.database.synchronize).toBe(false);
    expect(config.database.logging).toBe(false);
    expect(config.env).toBe('production');
  });

  it('should set synchronize and logging to false in test mode', () => {
    process.env.NODE_ENV = 'test';
    const { config } = require('../config');
    expect(config.database.synchronize).toBe(false);
    expect(config.database.logging).toBe(false);
  });

  it('should have fixed pagination settings', () => {
    const { config } = require('../config');
    expect(config.pagination.defaultPageSize).toBe(20);
    expect(config.pagination.maxPageSize).toBe(100);
  });

  it('should have stripe currency set to zar', () => {
    const { config } = require('../config');
    expect(config.stripe.currency).toBe('zar');
  });

  it('should have upload settings', () => {
    const { config } = require('../config');
    expect(config.upload.maxFileSize).toBe(5 * 1024 * 1024);
    expect(config.upload.allowedMimeTypes).toContain('image/jpeg');
    expect(config.upload.allowedMimeTypes).toContain('image/png');
    expect(config.upload.allowedMimeTypes).toContain('image/webp');
  });

  it('should have autoConfirm false when not set to true', () => {
    process.env.BOOKING_AUTO_CONFIRM = 'false';
    const { config } = require('../config');
    expect(config.booking.autoConfirm).toBe(false);
  });
});
