import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bounty } from './entities/bounty.entity';
import { BountiesController } from './bounties.controller';
import { BountiesService } from './bounties.service';
import { UsersModule } from '../users/users.module';
import { BadgesModule } from '../badges/badges.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Bounty]),
    UsersModule,
    BadgesModule
  ],
  controllers: [BountiesController],
  providers: [BountiesService],
  exports: [BountiesService],
})
export class BountiesModule {}
