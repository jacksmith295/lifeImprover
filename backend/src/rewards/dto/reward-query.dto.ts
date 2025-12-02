import { IsOptional, IsIn } from 'class-validator';

export class RewardQueryDto {
  @IsOptional()
  @IsIn(['true', 'false'])
  redeemed?: string;
}

