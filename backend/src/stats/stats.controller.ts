import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { Request } from 'express';

@Controller('stats')
@UseGuards(JwtAuthGuard)
export class StatsController {
  constructor(private statsService: StatsService) {}

  /**
   * Get comprehensive stats summary
   */
  @Get()
  async getSummary(@Req() req: Request & { user: { id: string } }) {
    return this.statsService.getSummary(req.user.id);
  }

  /**
   * Get task statistics for all time periods
   */
  @Get('tasks')
  async getTaskStats(@Req() req: Request & { user: { id: string } }) {
    return this.statsService.getTaskStats(req.user.id);
  }

  /**
   * Get task statistics by category
   * Optional query param: period (today, week, month)
   */
  @Get('tasks/by-category')
  async getStatsByCategory(
    @Req() req: Request & { user: { id: string } },
    @Query('period') period?: 'today' | 'week' | 'month',
  ) {
    return this.statsService.getStatsByCategory(req.user.id, period);
  }

  /**
   * Get weekly goal statistics
   */
  @Get('weekly-goals')
  async getWeeklyGoalStats(@Req() req: Request & { user: { id: string } }) {
    return this.statsService.getWeeklyGoalStats(req.user.id);
  }
}

