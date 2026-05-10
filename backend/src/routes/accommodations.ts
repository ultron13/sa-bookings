import { Router } from 'express';
import { body } from 'express-validator';
import { AccommodationController } from '../controllers/AccommodationController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { UserRole, AccommodationType, Province } from '../types/enums';

const router = Router();
const controller = new AccommodationController();

router.get('/search', controller.search.bind(controller));
router.get('/featured', controller.getFeatured.bind(controller));
router.get('/popular', controller.getPopular.bind(controller));
router.get('/province-counts', controller.getProvinceCounts.bind(controller));
router.get('/:id/similar', controller.getSimilar.bind(controller));
router.get('/:id', controller.getById.bind(controller));

router.get('/', authenticate, authorize(UserRole.HOST), controller.getMyListings.bind(controller));

router.post(
  '/',
  authenticate,
  authorize(UserRole.HOST),
  [
    body('name').trim().notEmpty().isLength({ max: 200 }),
    body('description').trim().notEmpty(),
    body('type').isIn(Object.values(AccommodationType)),
    body('province').isIn(Object.values(Province)),
    body('city').trim().notEmpty(),
    body('address').trim().notEmpty(),
    body('latitude').isFloat({ min: -90, max: 90 }),
    body('longitude').isFloat({ min: -180, max: 180 }),
    body('pricePerNight').isFloat({ min: 0 }),
    body('maxGuests').isInt({ min: 1 }),
    body('bedrooms').isInt({ min: 0 }),
    body('beds').isInt({ min: 1 }),
    body('bathrooms').isInt({ min: 1 }),
  ],
  validate,
  controller.create.bind(controller)
);

router.put(
  '/:id',
  authenticate,
  authorize(UserRole.HOST),
  controller.update.bind(controller)
);

router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.HOST),
  controller.delete.bind(controller)
);

export default router;
