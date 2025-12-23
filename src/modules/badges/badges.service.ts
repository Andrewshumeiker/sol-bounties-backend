import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Badge } from './entities/badge.entity';
import { UserBadge } from './entities/user-badge.entity';

@Injectable()
export class BadgesService implements OnModuleInit {
  constructor(
    @InjectRepository(Badge)
    private readonly badgeRepo: Repository<Badge>,
    @InjectRepository(UserBadge)
    private readonly userBadgeRepo: Repository<UserBadge>,
  ) {}

  async onModuleInit() {
    // Seed Badges
    const defaults = [
      { key: 'wallet_verified', name: 'Wallet Verified', description: 'Linked a Phantom wallet', iconUrl: '/badges/wallet_verified.png' },
      { key: 'first_login', name: 'First Login', description: 'Logged in for the first time', iconUrl: '/badges/first_login.png' },
      { key: 'first_bounty_win', name: 'First Bounty Winner', description: 'Won a bounty for the first time', iconUrl: '/badges/first_bounty_win.png' },
      { key: 'fast_solver', name: 'Fast Solver', description: 'Solved a bounty quickly', iconUrl: '/badges/fast_solver.png' },
      { key: 'top10', name: 'Top 10', description: 'Top 10 leaderboard', iconUrl: '/badges/top10.png' },
    ];

    for (const b of defaults) {
      const exists = await this.badgeRepo.findOneBy({ key: b.key });
      if (!exists) {
        await this.badgeRepo.save(b);
      }
    }
  }

  async awardBadge(userId: string, badgeKey: string) {
    const badge = await this.badgeRepo.findOneBy({ key: badgeKey });
    if (!badge) return;

    const exists = await this.userBadgeRepo.findOne({
      where: { user: { id: userId }, badge: { key: badgeKey } },
    });

    if (!exists) {
      await this.userBadgeRepo.save({
        user: { id: userId },
        badge: badge,
      });
    }
  }

  async getUserBadges(userId: string) {
     const ubs = await this.userBadgeRepo.find({
       where: { user: { id: userId } },
       relations: ['badge'],
     });
     return ubs.map(ub => ub.badge);
  }

  // Helper for internal use if needed, kept for compatibility but async now
  async getByKey(key: string) {
    return this.badgeRepo.findOneBy({ key });
  }
}
