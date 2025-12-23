import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { BountiesModule } from './modules/bounties/bounties.module';
import { BadgesModule } from './modules/badges/badges.module';
import { SubmissionsModule } from './modules/submissions/submissions.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL') || 'postgres://root:root@localhost:5432/sol_bounties',
        autoLoadEntities: true,
        synchronize: true, // Only for demo/dev!
      }),
      inject: [ConfigService],
    }),
    BadgesModule,
    UsersModule,
    AuthModule,
    BountiesModule,
    SubmissionsModule,
  ],
})
export class AppModule {}
