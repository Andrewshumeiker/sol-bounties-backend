import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { BadgesService } from '../badges/badges.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    private readonly badges: BadgesService,
  ) {}

  async upsertByWallet(walletAddress: string): Promise<User> {
    let user = await this.usersRepo.findOne({ 
      where: { walletAddress },
      relations: ['badges', 'badges.badge'] 
    });

    if (user) return this.normalizeUser(user);

    user = this.usersRepo.create({ walletAddress });
    await this.usersRepo.save(user);

    // Create Initial Reputation Record
    const reputation = this.usersRepo.manager.create('Reputation', {
      userId: user.id,
      totalScore: 0,
      tier: 'Novice'
    });
    await this.usersRepo.manager.save(reputation);

    // Initial badges
    await this.badges.awardBadge(user.id, 'wallet_verified');
    await this.badges.awardBadge(user.id, 'first_login');

    // Refetch to get relations
    return this.findById(user.id);
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.usersRepo.findOne({ 
      where: { id }, 
      relations: ['badges', 'badges.badge', 'reputation'] 
    });
    return user ? this.normalizeUser(user) : null;
  }

  async findByWallet(walletAddress: string): Promise<User | null> {
    const user = await this.usersRepo.findOne({ 
      where: { walletAddress },
      relations: ['badges', 'badges.badge', 'reputation'] 
    });
    return user ? this.normalizeUser(user) : null;
  }

  async updateWalletAddress(userId: string, newWalletAddress: string): Promise<void> {
    const user = await this.usersRepo.findOneBy({ id: userId });
    if (!user) return;
    user.walletAddress = newWalletAddress;
    await this.usersRepo.save(user);
  }

  async saveReputation(reputation: any): Promise<void> {
    await this.usersRepo.manager.save('Reputation', reputation);
  }

  async getLeaderboard(): Promise<any[]> {
    const users = await this.usersRepo.find({
      relations: ['reputation', 'badges', 'badges.badge'],
      order: {
        reputation: {
          totalScore: 'DESC'
        }
      },
      take: 20
    });

    return users.map(u => this.normalizeUser(u));
  }

  // Helper to flat map user badges for frontend compatibility
  private normalizeUser(user: User): any {
    return {
      ...user,
      badges: user.badges ? user.badges.map(ub => ub.badge) : []
    };
  }
}
