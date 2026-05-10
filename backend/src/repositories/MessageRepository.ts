import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Message } from '../entities/Message';
import { Conversation } from '../entities/Conversation';

export class MessageRepository {
  private messageRepo: Repository<Message>;
  private conversationRepo: Repository<Conversation>;

  constructor() {
    this.messageRepo = AppDataSource.getRepository(Message);
    this.conversationRepo = AppDataSource.getRepository(Conversation);
  }

  async findOrCreateConversation(guestId: string, hostId: string, accommodationId?: string): Promise<Conversation> {
    const existing = await this.conversationRepo.findOne({
      where: { guestId, hostId, accommodationId: accommodationId || undefined },
      relations: ['guest', 'host', 'accommodation'],
    });
    if (existing) return existing;

    const conversation = this.conversationRepo.create({ guestId, hostId, accommodationId });
    return this.conversationRepo.save(conversation);
  }

  async getConversation(id: string): Promise<Conversation | null> {
    return this.conversationRepo.findOne({
      where: { id },
      relations: ['guest', 'host', 'accommodation'],
    });
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    return this.conversationRepo.createQueryBuilder('conv')
      .leftJoinAndSelect('conv.guest', 'guest')
      .leftJoinAndSelect('conv.host', 'host')
      .leftJoinAndSelect('conv.accommodation', 'accommodation')
      .where('conv.guestId = :userId OR conv.hostId = :userId', { userId })
      .orderBy('conv.updatedAt', 'DESC')
      .getMany();
  }

  async getMessages(conversationId: string, page: number = 1, pageSize: number = 50): Promise<[Message[], number]> {
    return this.messageRepo.findAndCount({
      where: { conversationId },
      relations: ['sender'],
      order: { createdAt: 'ASC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
  }

  async sendMessage(conversationId: string, senderId: string, content: string): Promise<Message> {
    const message = this.messageRepo.create({ conversationId, senderId, content });
    const saved = await this.messageRepo.save(message);
    await this.conversationRepo.update(conversationId, { lastMessage: content, updatedAt: new Date() });
    return this.messageRepo.findOne({ where: { id: saved.id }, relations: ['sender'] }) as Promise<Message>;
  }

  async markAsRead(conversationId: string, userId: string): Promise<void> {
    await this.messageRepo.createQueryBuilder()
      .update(Message)
      .set({ isRead: true })
      .where('conversationId = :conversationId AND senderId != :userId AND isRead = false', { conversationId, userId })
      .execute();
  }
}
