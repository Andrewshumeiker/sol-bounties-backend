import { PrimaryGeneratedColumn, Column, Entity, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Submission } from '../../submissions/entities/submission.entity';

export enum BountyStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CLOSED = 'CLOSED',
}

@Entity('bounties')
export class Bounty {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  title: string;

  @Column('text')
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  rewardAmount: number;

  @Column({ nullable: true })
  badgeKey: string;

  @Column({ type: 'timestamp', nullable: true })
  deadline: Date | null;

  @Column({ type: 'enum', enum: BountyStatus, default: BountyStatus.DRAFT })
  status: BountyStatus;

  @ManyToOne(() => User, (user) => user.createdBounties)
  createdBy: User;

  @Column()
  creatorId: string; // Foreing key explicit for easy access

  @OneToMany(() => Submission, (submission) => submission.bounty)
  submissions: Submission[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}