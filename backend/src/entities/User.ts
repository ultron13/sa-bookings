import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, OneToMany, Index
} from 'typeorm';
import { Booking } from './Booking';
import { Accommodation } from './Accommodation';
import { Review } from './Review';
import { UserRole } from '../types/enums';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName: string;

  @Index({ unique: true })
  @Column({ length: 255 })
  email: string;

  @Column({ length: 255, select: false })
  password: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.TOURIST,
  })
  role: UserRole;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true, type: 'text' })
  refreshToken: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Booking, (booking) => booking.user)
  bookings: Booking[];

  @OneToMany(() => Accommodation, (accommodation) => accommodation.host)
  accommodations: Accommodation[];

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
