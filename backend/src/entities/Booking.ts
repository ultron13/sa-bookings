import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn, Index
} from 'typeorm';
import { User } from './User';
import { Accommodation } from './Accommodation';
import { Payment } from './Payment';
import { BookingStatus } from '../types/enums';

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ length: 20 })
  reference: string;

  @ManyToOne(() => User, (user) => user.bookings)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Accommodation, (accommodation) => accommodation.bookings)
  @JoinColumn({ name: 'accommodationId' })
  accommodation: Accommodation;

  @Column()
  accommodationId: string;

  @Column({ type: 'date' })
  checkIn: Date;

  @Column({ type: 'date' })
  checkOut: Date;

  @Column({ default: 1 })
  guests: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  pricePerNight: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  cleaningFee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  serviceFee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  status: BookingStatus;

  @Column({ nullable: true, type: 'text' })
  specialRequests: string;

  @Column({ default: false })
  isPaid: boolean;

  @Column({ nullable: true, type: 'timestamp' })
  cancelledAt: Date;

  @Column({ nullable: true, type: 'text' })
  cancellationReason: string;

  @Column({ nullable: true, type: 'decimal', precision: 10, scale: 2 })
  refundAmount: number;

  @ManyToOne(() => Payment, (payment) => payment.bookings)
  @JoinColumn({ name: 'paymentId' })
  payment: Payment;

  @Column({ nullable: true })
  paymentId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  get nights(): number {
    const diff = this.checkOut.getTime() - this.checkIn.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
}
