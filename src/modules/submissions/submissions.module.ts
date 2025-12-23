import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Submission } from './entities/submission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Submission])],
  controllers: [],
  providers: [],
})
export class SubmissionsModule {}