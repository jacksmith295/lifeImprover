import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  IsBoolean,
} from 'class-validator';
import { Category } from '@prisma/client';

export class UpdateWeeklyGoalDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(Category)
  category?: Category;

  @IsOptional()
  @IsInt()
  @Min(0)
  points?: number;

  @IsOptional()
  @IsBoolean()
  isAvoidGoal?: boolean;
}

