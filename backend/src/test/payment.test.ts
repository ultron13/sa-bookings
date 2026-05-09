import { PaymentService } from '../services/PaymentService';

const mockStripePaymentIntentsCreate = jest.fn();
const mockStripeRefundsCreate = jest.fn();
const mockStripeWebhooksConstructEvent = jest.fn();

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    paymentIntents: { create: mockStripePaymentIntentsCreate },
    refunds: { create: mockStripeRefundsCreate },
    webhooks: { constructEvent: mockStripeWebhooksConstructEvent },
  }));
});

jest.mock('../config', () => ({
  config: {
    stripe: { secretKey: 'sk_test', webhookSecret: 'whsec_test', currency: 'zar' },
    jwt: { secret: 'test', expiresIn: '1h', refreshSecret: 'test-refresh', refreshExpiresIn: '7d' },
    booking: { autoConfirm: false, minAdvanceHours: 2, cancellationWindowHours: 48 },
  },
}));

jest.mock('../repositories/PaymentRepository', () => {
  const payments: Record<string, any> = {};
  return {
    PaymentRepository: jest.fn().mockImplementation(() => ({
      create: jest.fn().mockImplementation(async (data: any) => {
        const payment = { id: `payment-${Date.now()}`, ...data };
        payments[payment.id] = payment;
        return payment;
      }),
      updateByStripeIntent: jest.fn().mockImplementation(async (stripeIntentId: string, data: any) => {
        const existing = Object.values(payments).find((p: any) => p.stripePaymentIntentId === stripeIntentId);
        if (existing) Object.assign(existing, data);
        return existing || null;
      }),
    })),
  };
});

describe('PaymentService', () => {
  let paymentService: PaymentService;

  beforeEach(() => {
    paymentService = new PaymentService();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createPaymentIntent', () => {
    it('should create a payment intent and store it', async () => {
      mockStripePaymentIntentsCreate.mockResolvedValue({ id: 'pi_test_123' });

      const result = await paymentService.createPaymentIntent('booking-1', 5000, 'zar');

      expect(result).toHaveProperty('id');
      expect(result.stripePaymentIntentId).toBe('pi_test_123');
      expect(result.amount).toBe(5000);
      expect(result.currency).toBe('zar');
      expect(result.status).toBe('pending');
      expect(mockStripePaymentIntentsCreate).toHaveBeenCalledWith({
        amount: 500000,
        currency: 'zar',
        metadata: { bookingId: 'booking-1' },
        automatic_payment_methods: { enabled: true },
      });
    });
  });

  describe('processRefund', () => {
    it('should process a refund through Stripe', async () => {
      mockStripeRefundsCreate.mockResolvedValue({ id: 're_test_123' });

      await paymentService.processRefund('pi_test_123', 2500);

      expect(mockStripeRefundsCreate).toHaveBeenCalledWith({
        payment_intent: 'pi_test_123',
        amount: 250000,
      });
    });
  });

  describe('constructWebhookEvent', () => {
    it('should construct webhook event from payload', () => {
      const mockEvent = { type: 'payment_intent.succeeded' };
      mockStripeWebhooksConstructEvent.mockReturnValue(mockEvent);

      const payload = Buffer.from('test');
      const signature = 'test_sig';

      const result = paymentService.constructWebhookEvent(payload, signature);
      expect(result).toEqual(mockEvent);
      expect(mockStripeWebhooksConstructEvent).toHaveBeenCalledWith(payload, signature, 'whsec_test');
    });
  });

  describe('handleWebhook', () => {
    it('should handle payment_intent.succeeded', async () => {
      await paymentService.handleWebhook({
        type: 'payment_intent.succeeded',
        data: { object: { id: 'pi_success' } },
      } as any);
    });

    it('should handle payment_intent.payment_failed', async () => {
      await paymentService.handleWebhook({
        type: 'payment_intent.payment_failed',
        data: {
          object: {
            id: 'pi_failed',
            last_payment_error: { message: 'Card declined' },
          },
        },
      } as any);
    });

    it('should handle charge.refunded', async () => {
      await paymentService.handleWebhook({
        type: 'charge.refunded',
        data: {
          object: {
            id: 'ch_refunded',
            payment_intent: 'pi_refunded',
            amount_refunded: 500000,
          },
        },
      } as any);
    });
  });
});
