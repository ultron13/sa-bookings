import { Router } from 'express';
import { PaymentController } from '../controllers/PaymentController';
import { authenticate } from '../middleware/auth';

const router = Router();
const controller = new PaymentController();

router.post(
  '/create-payment-intent',
  authenticate,
  controller.createPaymentIntent.bind(controller)
);

router.post(
  '/webhook',
  controller.handleWebhook.bind(controller)
);

export default router;
