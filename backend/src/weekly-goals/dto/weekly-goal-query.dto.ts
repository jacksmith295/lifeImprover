import { IsOptional, IsIn, IsDateString } from 'class-validator';

export class WeeklyGoalQueryDto {
  @IsOptional()
  @IsDateString()
  weekStartDate?: string;

  @IsOptional()
  @IsIn(['true', 'false'])
  completed?: string;

  @IsOptional()
  @IsIn(['true', 'false'])
  xpAwarded?: string;
}

