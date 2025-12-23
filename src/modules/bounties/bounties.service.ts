import { Injectable, NotFoundException, BadRequestException, ForbiddenException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bounty, BountyStatus } from './entities/bounty.entity';
import { Submission } from '../submissions/entities/submission.entity';
import { BadgesService } from '../badges/badges.service';
import { UsersService } from '../users/users.service';
import { ReputationService } from '../users/reputation.service';

@Injectable()
export class BountiesService implements OnModuleInit {
  constructor(
    @InjectRepository(Bounty)
    private readonly bountyRepo: Repository<Bounty>,
    private readonly badges: BadgesService,
    private readonly users: UsersService,
    private readonly reputation: ReputationService,
  ) {}

  async onModuleInit() {
    // Seed Bounties if empty
    const count = await this.bountyRepo.count();
    if (count === 0) {
      // Create a default creator
      const creator = await this.users.upsertByWallet('SeedCreatorWalletAddress123');
      
      const seeds = [
        {
          title: 'Fix Login Bug',
          description: 'The login button flickers on mobile. Fix it for 0.50 SOL.',
          rewardAmount: 0.50,
          badgeKey: 'fast_solver',
          creatorId: creator.id,
          status: BountyStatus.PUBLISHED
        },
        {
          title: 'Design Logo',
          description: 'We need a cool pixel-art logo for Sol Bounties.',
          rewardAmount: 1.00,
          badgeKey: 'top10',
          creatorId: creator.id,
          status: BountyStatus.PUBLISHED
        }
      ];

      for (const s of seeds) {
         await this.create(creator.id, s);
      }
      console.log('Seeded bounties');
    }

    // Specific seed for user: EDnAmnXEDYFxSay1VL3hrtf93Fuk3L2cBDFtenoBhcoe
    const userWallet = 'EDnAmnXEDYFxSay1VL3hrtf93Fuk3L2cBDFtenoBhcoe';
    const targetUser = await this.users.upsertByWallet(userWallet);
    
    // Only award badges if user has none, to speed up startup
    if (!targetUser.badges || targetUser.badges.length === 0) {
      console.log(`Seeding initial badges for wallet ${userWallet}`);
      await this.badges.awardBadge(targetUser.id, 'wallet_verified');
      await this.badges.awardBadge(targetUser.id, 'first_login');
      await this.badges.awardBadge(targetUser.id, 'fast_solver');
      await this.badges.awardBadge(targetUser.id, 'top10');
    }
  }

  async create(userId: string, data: Partial<Bounty>) {
    const bounty = this.bountyRepo.create({
      ...data,
      creatorId: userId,
      createdBy: { id: userId }, // Join alias
      status: BountyStatus.PUBLISHED, // Auto publish for demo
    });
    return this.bountyRepo.save(bounty);
  }

  async findAll() {
    return this.bountyRepo.find({
      order: { createdAt: 'DESC' },
      relations: ['createdBy']
    });
  }

  async findOne(id: string) {
    return this.bountyRepo.findOne({
      where: { id },
      relations: ['createdBy', 'submissions', 'submissions.applicant']
    });
  }

  async apply(bountyId: string, userId: string, content: string) {
    const bounty = await this.findOne(bountyId);
    if (!bounty) throw new NotFoundException('Bounty not found');
    if (bounty.status !== BountyStatus.PUBLISHED) throw new BadRequestException('Bounty is not open');
    if (bounty.creatorId === userId) throw new BadRequestException('Cannot apply to own bounty');

    // Check existing
    const exists = bounty.submissions?.find(s => s.applicantId === userId);
    if (exists) {
      if (exists.status !== 'PENDING') throw new BadRequestException('Cannot edit processed submission');
      exists.content = content;
      return this.bountyRepo.manager.save(exists);
    }

    const submission = this.bountyRepo.manager.create(Submission, {
      bounty,
      bountyId,
      applicant: { id: userId },
      applicantId: userId,
      content,
      status: 'PENDING'
    });
    
    return this.bountyRepo.manager.save(submission);
  }

  async getApplications(bountyId: string, userId: string) {
    const bounty = await this.findOne(bountyId);
    if (!bounty) throw new NotFoundException('Bounty not found');
    if (bounty.creatorId !== userId) throw new ForbiddenException('Only creator can view applications');
    
    return bounty.submissions;
  }

  async acceptApplication(applicationId: string, userId: string) {
    const sub = await this.bountyRepo.manager.findOne(Submission, {
      where: { id: applicationId },
      relations: ['bounty', 'applicant']
    });
    if (!sub) throw new NotFoundException('Application not found');
    
    // Verify ownership
    if (sub.bounty.creatorId !== userId) throw new ForbiddenException('Not authorized');
    if (sub.bounty.status !== BountyStatus.PUBLISHED) throw new BadRequestException('Bounty is not open');

    // Accept logic
    sub.status = 'ACCEPTED';
    sub.bounty.status = BountyStatus.CLOSED; // Close bounty on accept (Single winner model for demo)
    
    await this.bountyRepo.manager.transaction(async m => {
      await m.save(sub);
      await m.save(sub.bounty);
    });

    // Award Badge if exists
    if (sub.bounty.badgeKey) {
      await this.badges.awardBadge(sub.applicant.id, sub.bounty.badgeKey);
    }

    // Update Reputation stats (Triggered manually for MVP)
    const applicant = await this.users.findById(sub.applicant.id);
    if (applicant && applicant.reputation) {
      applicant.reputation.completedBounties += 1;
      applicant.reputation.totalEarningsSol += sub.bounty.rewardAmount;
      // Re-normalize acceptance rate (naive calculation for demo)
      const totalSubmissions = (applicant.reputation.completedBounties + (applicant.reputation.penaltyPoints / 2)) || 1;
      applicant.reputation.acceptanceRate = Math.min(1, applicant.reputation.completedBounties / totalSubmissions);
      
      await this.users.saveReputation(applicant.reputation); // New method needed
      await this.reputation.refreshUserReputation(applicant.id);
    }
    
    return sub;
  }

  async rejectApplication(applicationId: string, userId: string) {
     const sub = await this.bountyRepo.manager.findOne(Submission, {
      where: { id: applicationId },
      relations: ['bounty']
    });
    if (!sub) throw new NotFoundException('Application not found');
    if (sub.bounty.creatorId !== userId) throw new ForbiddenException('Not authorized');

    sub.status = 'REJECTED';
    return this.bountyRepo.manager.save(sub);
  }

  async deleteApplication(applicationId: string, userId: string) {
    const sub = await this.bountyRepo.manager.findOne(Submission, {
      where: { id: applicationId },
      relations: ['bounty']
    });
    if (!sub) throw new NotFoundException('Application not found');
    if (sub.applicantId !== userId) throw new ForbiddenException('Not authorized');
    if (sub.status !== 'PENDING') throw new BadRequestException('Cannot delete processed submission');

    return this.bountyRepo.manager.remove(sub);
  }
}
