import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn, Index
} from 'typeorm';
import { User } from './User';
import { Accommodation } from './Accommodation';

@Entity('reviews')
@Index(['userId', 'accommodationId'], { unique: true })
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.reviews)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Accommodation, (accommodation) => accommodation.reviews)
  @JoinColumn({ name: 'accommodationId' })
  accommodation: Accommodation;

  @Column()
  accommodationId: string;

  @Column({ type: 'smallint' })
  rating: number;

  @Column({ type: 'text' })
  comment: string;

  @Column({ nullable: true, type: 'text' })
  responseFromHost: string;

  @Column({ default: false })
  isVerified: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
