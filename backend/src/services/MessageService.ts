import { MessageRepository } from '../repositories/MessageRepository';

const messageRepo = new MessageRepository();

export class MessageService {
  async getOrCreateConversation(guestId: string, hostId: string, accommodationId?: string) {
    if (guestId === hostId) throw new Error('Cannot message yourself');
    return messageRepo.findOrCreateConversation(guestId, hostId, accommodationId);
  }

  async getUserConversations(userId: string) {
    return messageRepo.getUserConversations(userId);
  }

  async getConversation(conversationId: string, userId: string) {
    const conversation = await messageRepo.getConversation(conversationId);
    if (!conversation) throw new Error('Conversation not found');
    if (conversation.guestId !== userId && conversation.hostId !== userId) {
      throw new Error('Unauthorized');
    }
    await messageRepo.markAsRead(conversationId, userId);
    return conversation;
  }

  async getMessages(conversationId: string, userId: string, page: number = 1) {
    const conversation = await messageRepo.getConversation(conversationId);
    if (!conversation) throw new Error('Conversation not found');
    if (conversation.guestId !== userId && conversation.hostId !== userId) {
      throw new Error('Unauthorized');
    }
    const [messages, total] = await messageRepo.getMessages(conversationId, page);
    return { messages, total };
  }

  async sendMessage(conversationId: string, senderId: string, content: string) {
    const conversation = await messageRepo.getConversation(conversationId);
    if (!conversation) throw new Error('Conversation not found');
    if (conversation.guestId !== senderId && conversation.hostId !== senderId) {
      throw new Error('Unauthorized');
    }
    return messageRepo.sendMessage(conversationId, senderId, content.trim());
  }
}
