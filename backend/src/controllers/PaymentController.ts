import { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../services/PaymentService';

const paymentService = new PaymentService();

export class PaymentController {
  async createPaymentIntent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { bookingId, amount, currency } = req.body;
      const payment = await paymentService.createPaymentIntent(bookingId, amount, currency || 'zar');
      res.json({
        success: true,
        data: {
          clientSecret: (payment as any).client_secret,
          paymentIntentId: payment.stripePaymentIntentId,
          amount: payment.amount,
          currency: payment.currency,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async handleWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sig = req.headers['stripe-signature'] as string;
      const event = paymentService.constructWebhookEvent(req.body, sig);
      await paymentService.handleWebhook(event);
      res.json({ received: true });
    } catch (error: any) {
      res.status(400).json({ error: `Webhook Error: ${error.message}` });
    }
  }
}
