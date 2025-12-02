import {
  Controller,
  UseGuards,
  Get,
  Req,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { RewardsService } from './rewards.service';
import { Request } from 'express';
import { Reward } from './reward.types';
import { CreateRewardDto } from './dto/create-reward.dto';
import { UpdateRewardDto } from './dto/update-reward.dto';
import { RewardQueryDto } from './dto/reward-query.dto';

interface AuthenticatedRequest extends Request {
  user: { id: string };
}

@UseGuards(JwtAuthGuard)
@Controller('rewards')
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Get()
  async findAll(
    @Req() req: AuthenticatedRequest,
    @Query() query: RewardQueryDto,
  ): Promise<Reward[]> {
    return await this.rewardsService.findAll(req.user.id, query);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<Reward> {
    return await this.rewardsService.findOne(id, req.user.id);
  }

  @Post()
  async create(
    @Body() dto: CreateRewardDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<Reward> {
    return await this.rewardsService.create(req.user.id, dto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateRewardDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<Reward> {
    return await this.rewardsService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<Reward> {
    return await this.rewardsService.delete(id, req.user.id);
  }

  @Post(':id/redeem')
  async redeem(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<Reward> {
    return await this.rewardsService.redeem(id, req.user.id);
  }
}

