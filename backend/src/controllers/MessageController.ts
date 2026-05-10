import { Request, Response, NextFunction } from 'express';
import { MessageService } from '../services/MessageService';

const messageService = new MessageService();

export class MessageController {
  async getConversations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const conversations = await messageService.getUserConversations(req.user!.userId);
      res.json({ success: true, data: conversations });
    } catch (error) {
      next(error);
    }
  }

  async getOrCreateConversation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { hostId, accommodationId } = req.body;
      const conversation = await messageService.getOrCreateConversation(
        req.user!.userId,
        hostId,
        accommodationId,
      );
      res.json({ success: true, data: conversation });
    } catch (error: any) {
      if (error.message === 'Cannot message yourself') {
        res.status(400).json({ success: false, error: error.message });
        return;
      }
      next(error);
    }
  }

  async getConversation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const conversation = await messageService.getConversation(req.params.id, req.user!.userId);
      res.json({ success: true, data: conversation });
    } catch (error: any) {
      if (error.message === 'Unauthorized') {
        res.status(403).json({ success: false, error: error.message });
        return;
      }
      if (error.message === 'Conversation not found') {
        res.status(404).json({ success: false, error: error.message });
        return;
      }
      next(error);
    }
  }

  async getMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const result = await messageService.getMessages(req.params.id, req.user!.userId, page);
      res.json({ success: true, data: result.messages, meta: { total: result.total } });
    } catch (error: any) {
      if (error.message === 'Unauthorized') {
        res.status(403).json({ success: false, error: error.message });
        return;
      }
      if (error.message === 'Conversation not found') {
        res.status(404).json({ success: false, error: error.message });
        return;
      }
      next(error);
    }
  }

  async sendMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const message = await messageService.sendMessage(req.params.id, req.user!.userId, req.body.content);
      res.status(201).json({ success: true, data: message });
    } catch (error: any) {
      if (error.message === 'Unauthorized') {
        res.status(403).json({ success: false, error: error.message });
        return;
      }
      if (error.message === 'Conversation not found') {
        res.status(404).json({ success: false, error: error.message });
        return;
      }
      next(error);
    }
  }
}
