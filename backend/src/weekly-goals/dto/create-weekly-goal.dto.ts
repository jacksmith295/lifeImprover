import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsInt,
  Min,
  IsBoolean,
} from 'class-validator';
import { Category } from '@prisma/client';

export class CreateWeeklyGoalDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(Category)
  category?: Category;

  @IsDateString()
  weekStartDate: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  points?: number;

  @IsOptional()
  @IsBoolean()
  isAvoidGoal?: boolean;
}

