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
import { WeeklyGoalsService } from './weekly-goals.service';
import { Request } from 'express';
import { WeeklyGoal } from './weekly-goal.types';
import { CreateWeeklyGoalDto } from './dto/create-weekly-goal.dto';
import { UpdateWeeklyGoalDto } from './dto/update-weekly-goal.dto';
import { WeeklyGoalQueryDto } from './dto/weekly-goal-query.dto';
import { UnlockedAchievement } from 'src/achievements/achievements.service';

interface AuthenticatedRequest extends Request {
  user: { id: string };
}

@UseGuards(JwtAuthGuard)
@Controller('weekly-goals')
export class WeeklyGoalsController {
  constructor(private readonly weeklyGoalsService: WeeklyGoalsService) {}

  @Get()
  async findAll(
    @Req() req: AuthenticatedRequest,
    @Query() query: WeeklyGoalQueryDto,
  ): Promise<WeeklyGoal[]> {
    return await this.weeklyGoalsService.findAll(req.user.id, query);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<WeeklyGoal> {
    return await this.weeklyGoalsService.findOne(id, req.user.id);
  }

  @Post()
  async create(
    @Body() dto: CreateWeeklyGoalDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<WeeklyGoal> {
    return await this.weeklyGoalsService.create(req.user.id, dto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateWeeklyGoalDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<WeeklyGoal> {
    return await this.weeklyGoalsService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<WeeklyGoal> {
    return await this.weeklyGoalsService.delete(id, req.user.id);
  }

  @Patch(':id/complete')
  async complete(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<WeeklyGoal> {
    return await this.weeklyGoalsService.complete(id, req.user.id);
  }

  @Patch(':id/uncomplete')
  async uncomplete(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<WeeklyGoal> {
    return await this.weeklyGoalsService.uncomplete(id, req.user.id);
  }

  @Post(':id/claim-xp')
  async claimXp(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<{ goal: WeeklyGoal; unlockedAchievements: UnlockedAchievement[] }> {
    return await this.weeklyGoalsService.claimXp(id, req.user.id);
  }

  @Post('claim-all-xp')
  async claimAllPendingXp(@Req() req: AuthenticatedRequest): Promise<{
    claimed: number;
    totalXp: number;
    unlockedAchievements: UnlockedAchievement[];
  }> {
    return await this.weeklyGoalsService.claimAllPendingXp(req.user.id);
  }
}

