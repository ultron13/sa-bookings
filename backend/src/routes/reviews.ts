import { Router } from 'express';
import { body } from 'express-validator';
import { ReviewController } from '../controllers/ReviewController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();
const controller = new ReviewController();

router.get('/accommodation/:accommodationId', controller.getByAccommodation.bind(controller));

router.post(
  '/',
  authenticate,
  [
    body('accommodationId').isUUID(),
    body('rating').isInt({ min: 1, max: 5 }),
    body('comment').trim().notEmpty().isLength({ max: 2000 }),
  ],
  validate,
  controller.create.bind(controller)
);

router.put(
  '/:id',
  authenticate,
  [
    body('rating').optional().isInt({ min: 1, max: 5 }),
    body('comment').optional().trim().notEmpty(),
  ],
  validate,
  controller.update.bind(controller)
);

router.delete('/:id', authenticate, controller.delete.bind(controller));

router.put(
  '/:id/respond',
  authenticate,
  [body('response').trim().notEmpty().isLength({ max: 2000 })],
  validate,
  controller.respond.bind(controller)
);

export default router;
