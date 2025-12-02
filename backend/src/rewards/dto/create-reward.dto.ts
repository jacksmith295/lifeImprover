import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class CreateRewardDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @Min(1)
  cost: number;
}

