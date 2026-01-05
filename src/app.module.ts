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
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const databaseUrl = config.get<string>('DATABASE_URL');

        // ✅ Local / environments donde DATABASE_URL sí existe
        if (databaseUrl && databaseUrl.trim().length > 0) {
          return {
            type: 'postgres',
            url: databaseUrl,
            autoLoadEntities: true,
            synchronize: true, // ⚠️ solo demo/dev
          };
        }

        // ✅ Railway: usar variables PG*
        return {
          type: 'postgres',
          host: config.get<string>('PGHOST'),
          port: Number(config.get<string>('PGPORT') || 5432),
          username: config.get<string>('PGUSER'),
          password: config.get<string>('PGPASSWORD'),
          database: config.get<string>('PGDATABASE'),
          autoLoadEntities: true,
          synchronize: true, // ⚠️ solo demo/dev
          ssl: false,
        };
      },
    }),

    BadgesModule,
    UsersModule,
    AuthModule,
    BountiesModule,
    SubmissionsModule,
  ],
})
export class AppModule {}
