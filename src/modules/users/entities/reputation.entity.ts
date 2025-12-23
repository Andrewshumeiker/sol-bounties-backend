import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('reputation_scores')
export class Reputation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column()
  userId: string;

  /**
   * Computed total score. 
   * This is a denormalized value updated on specific events (bounty completion, badge award).
   */
  @Column({ type: 'float', default: 0 })
  totalScore: number;

  // Breakdown metrics for transparency/explainability
  @Column({ default: 0 })
  completedBounties: number;

  @Column({ type: 'float', default: 0 })
  acceptanceRate: number; // 0.0 to 1.0

  @Column({ default: 0 })
  totalEarningsSol: number;

  @Column({ default: 0 })
  badgeCount: number;

  @Column({ default: 0 })
  penaltyPoints: number;

  /**
   * Professional Tier based on score:
   * 0-100: Novice
   * 101-500: Professional
   * 501-1500: Elite
   * 1501+: Legend
   */
  @Column({ default: 'Novice' })
  tier: string;

  @UpdateDateColumn()
  updatedAt: Date;
}
