import { Router } from 'express';
import { body } from 'express-validator';
import { MessageController } from '../controllers/MessageController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();
const controller = new MessageController();

router.use(authenticate);

router.get('/conversations', controller.getConversations.bind(controller));

router.post(
  '/conversations',
  [
    body('hostId').isUUID(),
    body('accommodationId').optional().isUUID(),
  ],
  validate,
  controller.getOrCreateConversation.bind(controller),
);

router.get('/conversations/:id', controller.getConversation.bind(controller));
router.get('/conversations/:id/messages', controller.getMessages.bind(controller));

router.post(
  '/conversations/:id/messages',
  [body('content').trim().notEmpty().withMessage('Message content is required')],
  validate,
  controller.sendMessage.bind(controller),
);

export default router;
