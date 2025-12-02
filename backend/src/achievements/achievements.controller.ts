import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AchievementsService } from './achievements.service';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { Request } from 'express';

@Controller('achievements')
@UseGuards(JwtAuthGuard)
export class AchievementsController {
  constructor(private achievementsService: AchievementsService) {}

  /**
   * Get all achievement definitions
   */
  @Get('definitions')
  async getAllDefinitions() {
    return this.achievementsService.getAllDefinitions();
  }

  /**
   * Get user's unlocked achievements
   */
  @Get()
  async getUserAchievements(@Req() req: Request & { user: { id: string } }) {
    return this.achievementsService.getUserAchievements(req.user.id);
  }

  /**
   * Get user's progress toward all achievements
   */
  @Get('progress')
  async getUserProgress(@Req() req: Request & { user: { id: string } }) {
    return this.achievementsService.getUserProgress(req.user.id);
  }
}

