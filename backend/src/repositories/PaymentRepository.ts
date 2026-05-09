import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Payment } from '../entities/Payment';
import { PaymentStatus } from '../types/enums';

export class PaymentRepository {
  private repo: Repository<Payment>;

  constructor() {
    this.repo = AppDataSource.getRepository(Payment);
  }

  async findById(id: string): Promise<Payment | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findByStripeIntentId(stripePaymentIntentId: string): Promise<Payment | null> {
    return this.repo.findOne({ where: { stripePaymentIntentId } });
  }

  async create(data: Partial<Payment>): Promise<Payment> {
    const payment = this.repo.create(data);
    return this.repo.save(payment);
  }

  async update(id: string, data: Partial<Payment>): Promise<Payment | null> {
    await this.repo.update(id, data);
    return this.findById(id);
  }

  async updateByStripeIntent(stripePaymentIntentId: string, data: Partial<Payment>): Promise<void> {
    await this.repo.update({ stripePaymentIntentId }, data);
  }
}
