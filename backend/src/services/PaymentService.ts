import Stripe from 'stripe';
import { config } from '../config';
import { PaymentRepository } from '../repositories/PaymentRepository';
import { Payment } from '../entities/Payment';
import { PaymentStatus } from '../types/enums';

export class PaymentService {
  private stripe: Stripe;
  private paymentRepo: PaymentRepository;

  constructor() {
    this.stripe = new Stripe(config.stripe.secretKey, {
      apiVersion: '2024-11-20.acacia',
    });
    this.paymentRepo = new PaymentRepository();
  }

  async createPaymentIntent(
    bookingId: string,
    amount: number,
    currency: string = 'zar'
  ): Promise<Payment> {
    const amountInCents = Math.round(amount * 100);

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amountInCents,
      currency,
      metadata: { bookingId },
      automaticPaymentMethods: { enabled: true },
    });

    const payment = await this.paymentRepo.create({
      stripePaymentIntentId: paymentIntent.id,
      amount,
      currency,
      status: PaymentStatus.PENDING,
      paymentMethod: 'stripe',
      metadata: { bookingId },
    });

    return payment;
  }

  async handleWebhook(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await this.paymentRepo.updateByStripeIntent(paymentIntent.id, {
          status: PaymentStatus.SUCCEEDED,
        });
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await this.paymentRepo.updateByStripeIntent(paymentIntent.id, {
          status: PaymentStatus.FAILED,
          failureMessage: paymentIntent.last_payment_error?.message,
        });
        break;
      }
      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        if (charge.payment_intent) {
          const paymentIntentId = charge.payment_intent as string;
          await this.paymentRepo.updateByStripeIntent(paymentIntentId, {
            status: PaymentStatus.REFUNDED,
            amountRefunded: charge.amount_refunded / 100,
          });
        }
        break;
      }
    }
  }

  async processRefund(paymentIntentId: string, amount: number): Promise<void> {
    const amountInCents = Math.round(amount * 100);
    await this.stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amountInCents,
    });
  }

  constructWebhookEvent(payload: Buffer, signature: string): Stripe.Event {
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      config.stripe.webhookSecret
    );
  }
}
