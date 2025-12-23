import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne } from 'typeorm';
import { Bounty } from '../../bounties/entities/bounty.entity';
import { Submission } from '../../submissions/entities/submission.entity';
import { UserBadge } from '../../badges/entities/user-badge.entity';
import { Reputation } from './reputation.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  walletAddress: string;

  @Column({ nullable: true })
  username: string;

  @OneToMany(() => Bounty, (bounty) => bounty.createdBy)
  createdBounties: Bounty[];

  @OneToMany(() => Submission, (submission) => submission.applicant)
  submissions: Submission[];

  @OneToMany(() => UserBadge, (userBadge) => userBadge.user)
  badges: UserBadge[];

  @OneToOne(() => Reputation, (rep) => rep.user, { cascade: true })
  reputation: Reputation;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}