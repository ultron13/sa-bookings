import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types/enums';

const router = Router();
const controller = new AdminController();

router.use(authenticate, authorize(UserRole.ADMIN));

router.get('/dashboard', controller.getDashboard.bind(controller));
router.get('/users', controller.getUsers.bind(controller));
router.put('/users/:userId/toggle-status', controller.toggleUserStatus.bind(controller));
router.get('/bookings', controller.getAllBookings.bind(controller));

export default router;
