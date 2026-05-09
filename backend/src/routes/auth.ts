import { Router } from 'express';
import { body } from 'express-validator';
import { AuthController } from '../controllers/AuthController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { authLimiter } from '../middleware/rateLimiter';
import { UserRole } from '../types/enums';

const router = Router();
const authController = new AuthController();

router.post(
  '/register',
  authLimiter,
  [
    body('firstName').trim().notEmpty().isLength({ max: 100 }),
    body('lastName').trim().notEmpty().isLength({ max: 100 }),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
    body('role').optional().isIn(Object.values(UserRole)),
    body('phone').optional().isMobilePhone('any'),
  ],
  validate,
  authController.register.bind(authController)
);

router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  validate,
  authController.login.bind(authController)
);

router.post(
  '/refresh-token',
  [body('refreshToken').notEmpty()],
  validate,
  authController.refreshToken.bind(authController)
);

router.post('/logout', authenticate, authController.logout.bind(authController));

router.get('/profile', authenticate, authController.getProfile.bind(authController));

router.put(
  '/profile',
  authenticate,
  [
    body('firstName').optional().trim().notEmpty().isLength({ max: 100 }),
    body('lastName').optional().trim().notEmpty().isLength({ max: 100 }),
    body('phone').optional().isMobilePhone('any'),
  ],
  validate,
  authController.updateProfile.bind(authController)
);

router.put(
  '/change-password',
  authenticate,
  [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  ],
  validate,
  authController.changePassword.bind(authController)
);

export default router;
