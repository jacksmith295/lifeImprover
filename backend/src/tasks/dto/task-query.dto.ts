import { IsOptional, IsDateString, IsBooleanString } from 'class-validator';

export class TaskQueryDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsBooleanString()
  completed?: string;
}

