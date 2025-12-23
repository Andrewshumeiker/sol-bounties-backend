import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reputation } from './entities/reputation.entity';
import { User } from './entities/user.entity';

@Injectable()
export class ReputationService implements OnModuleInit {
  constructor(
    @InjectRepository(Reputation)
    private readonly repRepo: Repository<Reputation>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async onModuleInit() {
    await this.seedReputations();
  }

  /**
   * REPUTATION FORMULA (V1.0)
   * 
   * Score = (BountyCount * 25) + (AcceptanceRate * 100) + (Badges * 15) - (Penalties * 10)
   * 
   * Logic:
   * - BountyCount: Rewards experience.
   * - AcceptanceRate: Rewards quality (0.0 to 1.0 multiplier).
   * - Badges: Rewards rare achievements.
   * - Penalties: Filters out spammers.
   */
  async calculateScore(rep: Reputation): Promise<number> {
    const activityScore = rep.completedBounties * 25;
    const qualityScore = rep.acceptanceRate * 100;
    const achievementScore = rep.badgeCount * 15;
    const penaltyDeduction = rep.penaltyPoints * 10;

    const total = activityScore + qualityScore + achievementScore - penaltyDeduction;
    
    // Growth Cap (Anti-gaming): prevents sudden jumps
    // In a real system, we'd compare with the previous score and timestamp
    
    return Math.max(0, total); // Score cannot be negative
  }

  async getTier(score: number): Promise<string> {
    if (score >= 1500) return 'Legend';
    if (score >= 500) return 'Elite';
    if (score >= 100) return 'Professional';
    return 'Novice';
  }

  /**
   * Updates a user's reputation stats and recomputes the score.
   */
  async refreshUserReputation(userId: string) {
    let rep = await this.repRepo.findOne({ where: { userId } });
    if (!rep) {
        rep = this.repRepo.create({ userId });
    }

    // In a production environment, we would fetch these stats from Submission/Bounty tables
    // For this MVP, we update the denormalized fields in the Reputation entity directly.
    
    const newScore = await this.calculateScore(rep);
    rep.totalScore = newScore;
    rep.tier = await this.getTier(newScore);
    
    await this.repRepo.save(rep);
  }

  /**
   * SEEDER: Generates 10 realistic profiles with varied reputation.
   */
  private async seedReputations() {
    const count = await this.userRepo.count();
    // We only seed if there are no extra users (beyond the default ones)
    if (count > 5) return; 

    console.log('Seeding professional reputation profiles...');

    const profiles = [
      { wallet: 'EDnAmnXEDYFxSay1VL3hrtf93Fuk3L2cBDFtenoBhcoe', username: 'Andre_Hunter_PRO', bounties: 28, rate: 0.92, badges: 9, penalties: 0 }, // Andre's Hunter
      { wallet: 'SeedCreatorWalletAddress123', username: 'Andre_Creator_HQ', bounties: 5, rate: 1.0, badges: 12, penalties: 0 },           // Andre's Client
      { wallet: 'Hntr111111111111111111111111111111111111', username: 'SolDev_Master', bounties: 45, rate: 0.95, badges: 12, penalties: 0 },
      { wallet: 'Hntr666666666666666666666666666666666666', username: 'DeFi_Whiz', bounties: 60, rate: 0.98, badges: 15, penalties: 0 },
      { wallet: 'Hntr444444444444444444444444444444444444', username: 'PixelArtist', bounties: 15, rate: 1.0, badges: 8, penalties: 0 },
      { wallet: 'Hntr222222222222222222222222222222222222', username: 'CodeNinja', bounties: 20, rate: 0.85, badges: 5, penalties: 2 },
    ];

    for (const p of profiles) {
      let user = await this.userRepo.findOne({ where: { walletAddress: p.wallet } });
      if (!user) {
        user = this.userRepo.create({ walletAddress: p.wallet, username: p.username });
        await this.userRepo.save(user);
      }

      let rep = await this.repRepo.findOne({ where: { userId: user.id } });
      if (!rep) {
        rep = this.repRepo.create({
          userId: user.id,
          completedBounties: p.bounties,
          acceptanceRate: p.rate,
          badgeCount: p.badges,
          penaltyPoints: p.penalties
        });
        const score = await this.calculateScore(rep);
        rep.totalScore = score;
        rep.tier = await this.getTier(score);
        await this.repRepo.save(rep);
      }
    }
  }
}
