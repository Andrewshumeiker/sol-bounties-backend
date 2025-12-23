import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { BadgesModule } from '../badges/badges.module';

import { Reputation } from './entities/reputation.entity';

import { ReputationService } from './reputation.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Reputation]),
    BadgesModule
  ],
  providers: [UsersService, ReputationService],
  controllers: [UsersController],
  exports: [UsersService, ReputationService],
})
export class UsersModule {}
