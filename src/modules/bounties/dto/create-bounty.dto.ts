import { IsString, IsNotEmpty, MaxLength, IsNumber, Min, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { BountyStatus } from '../entities/bounty.entity';

export class CreateBountyDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Min(0)
  rewardAmount: number;

  @IsOptional()
  @IsDateString()
  deadline?: string;

  @IsOptional()
  @IsEnum(BountyStatus)
  status?: BountyStatus;
}