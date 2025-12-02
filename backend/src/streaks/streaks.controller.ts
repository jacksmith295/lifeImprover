import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { StreaksService } from './streaks.service';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { Request } from 'express';

@Controller('streaks')
@UseGuards(JwtAuthGuard)
export class StreaksController {
  constructor(private streaksService: StreaksService) {}

  /**
   * Get current streak information
   */
  @Get()
  async getStreak(@Req() req: Request & { user: { id: string } }) {
    return this.streaksService.getStreak(req.user.id);
  }

  /**
   * Get streak status with today's progress
   */
  @Get('status')
  async getStreakStatus(@Req() req: Request & { user: { id: string } }) {
    return this.streaksService.getStreakStatus(req.user.id);
  }

  /**
   * Get streak milestones and achievements
   */
  @Get('milestones')
  async getStreakMilestones(@Req() req: Request & { user: { id: string } }) {
    return this.streaksService.getStreakMilestones(req.user.id);
  }

  /**
   * Reset current streak (for testing/admin)
   */
  @Post('reset')
  async resetStreak(@Req() req: Request & { user: { id: string } }) {
    return this.streaksService.resetStreak(req.user.id);
  }
}

