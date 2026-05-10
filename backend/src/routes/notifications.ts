import { Router } from 'express';
import { NotificationController } from '../controllers/NotificationController';
import { authenticate } from '../middleware/auth';

const router = Router();
const controller = new NotificationController();

router.use(authenticate);

router.get('/', controller.getNotifications.bind(controller));
router.get('/unread-count', controller.getUnreadCount.bind(controller));
router.put('/:id/read', controller.markAsRead.bind(controller));
router.put('/read-all', controller.markAllAsRead.bind(controller));

export default router;
