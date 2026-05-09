import { Router } from 'express';
import { body } from 'express-validator';
import { BookingController } from '../controllers/BookingController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();
const controller = new BookingController();

router.get('/', authenticate, controller.getMyBookings.bind(controller));
router.get('/host', authenticate, controller.getHostBookings.bind(controller));

router.get('/:id', authenticate, controller.getById.bind(controller));
router.get('/reference/:reference', authenticate, controller.getByReference.bind(controller));

router.post(
  '/',
  authenticate,
  [
    body('accommodationId').isUUID(),
    body('checkIn').isISO8601().toDate(),
    body('checkOut').isISO8601().toDate(),
    body('guests').isInt({ min: 1 }),
    body('specialRequests').optional().trim(),
  ],
  validate,
  controller.create.bind(controller)
);

router.put(
  '/:id/cancel',
  authenticate,
  [body('reason').optional().trim()],
  validate,
  controller.cancel.bind(controller)
);

export default router;
