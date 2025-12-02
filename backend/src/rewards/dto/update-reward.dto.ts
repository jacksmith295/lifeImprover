import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class UpdateRewardDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  cost?: number;
}

