import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn, OneToMany
} from 'typeorm';
import { Booking } from './Booking';
import { PaymentStatus } from '../types/enums';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, unique: true })
  stripePaymentIntentId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amountRefunded: number;

  @Column({ length: 3, default: 'zar' })
  currency: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({ length: 50 })
  paymentMethod: string;

  @Column({ nullable: true, type: 'text' })
  failureMessage: string;

  @Column({ nullable: true, type: 'jsonb' })
  metadata: Record<string, any>;

  @OneToMany(() => Booking, (booking) => booking.payment)
  bookings: Booking[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
