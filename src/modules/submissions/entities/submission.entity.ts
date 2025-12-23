import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Bounty } from '../../bounties/entities/bounty.entity';

@Entity('submissions')
export class Submission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.submissions)
  applicant: User;

  @Column()
  applicantId: string;

  @ManyToOne(() => Bounty, (bounty) => bounty.submissions)
  bounty: Bounty;

  @Column()
  bountyId: string;

  @Column('text')
  content: string;

  @Column({ default: 'PENDING' }) // PENDING, ACCEPTED, REJECTED
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}