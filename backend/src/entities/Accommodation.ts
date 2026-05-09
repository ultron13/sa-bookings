import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, Index
} from 'typeorm';
import { User } from './User';
import { Booking } from './Booking';
import { Review } from './Review';
import { AccommodationType, Province, Amenity } from '../types/enums';

@Entity('accommodations')
export class Accommodation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: AccommodationType,
  })
  type: AccommodationType;

  @Column({
    type: 'enum',
    enum: Province,
  })
  province: Province;

  @Column({ length: 200 })
  city: string;

  @Column({ length: 500 })
  address: string;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  longitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  pricePerNight: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  cleaningFee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  serviceFee: number;

  @Column({ default: 1 })
  maxGuests: number;

  @Column({ default: 1 })
  bedrooms: number;

  @Column({ default: 1 })
  beds: number;

  @Column({ default: 1 })
  bathrooms: number;

  @Column('simple-array')
  amenities: string[];

  @Column({ type: 'text', array: true, default: '{}' })
  images: string[];

  @Column({ nullable: true })
  thumbnailUrl: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  averageRating: number;

  @Column({ default: 0 })
  reviewCount: number;

  @Column({ default: true })
  isAvailable: boolean;

  @Column({ default: false })
  isFeatured: boolean;

  @Index()
  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  cancellationPolicy: {
    type: 'flexible' | 'moderate' | 'strict';
    description: string;
    refundPercentage: number;
  };

  @Column({ type: 'jsonb', nullable: true })
  houseRules: string[];

  @Column({ length: 100, nullable: true })
  checkInTime: string;

  @Column({ length: 100, nullable: true })
  checkOutTime: string;

  @ManyToOne(() => User, (user) => user.accommodations)
  @JoinColumn({ name: 'hostId' })
  host: User;

  @Column()
  hostId: string;

  @OneToMany(() => Booking, (booking) => booking.accommodation)
  bookings: Booking[];

  @OneToMany(() => Review, (review) => review.accommodation)
  reviews: Review[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
