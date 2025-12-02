import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Category } from '@prisma/client';

export interface TaskStats {
  total: number;
  completed: number;
  completionRate: number;
  totalPoints: number;
  earnedPoints: number;
}

export interface CategoryStats {
  category: Category | null;
  total: number;
  completed: number;
  completionRate: number;
  totalPoints: number;
  earnedPoints: number;
}

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get date bounds for different periods
   */
  private getDateBounds(period: 'today' | 'week' | 'month' | 'all') {
    const now = new Date();
    let start: Date | undefined;
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    switch (period) {
      case 'today':
        start = new Date(now);
        start.setHours(0, 0, 0, 0);
        break;
      case 'week':
        start = new Date(now);
        const dayOfWeek = start.getDay();
        const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday = start
        start.setDate(start.getDate() - diff);
        start.setHours(0, 0, 0, 0);
        break;
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        start.setHours(0, 0, 0, 0);
        break;
      case 'all':
        start = undefined;
        break;
    }

    return { start, end };
  }

  /**
   * Calculate stats from task counts
   */
  private calculateStats(
    tasks: { isCompleted: boolean; points: number }[],
  ): TaskStats {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.isCompleted).length;
    const totalPoints = tasks.reduce((sum, t) => sum + t.points, 0);
    const earnedPoints = tasks
      .filter((t) => t.isCompleted)
      .reduce((sum, t) => sum + t.points, 0);

    return {
      total,
      completed,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      totalPoints,
      earnedPoints,
    };
  }

  /**
   * Get task statistics for all time periods
   */
  async getTaskStats(userId: string) {
    const periods = ['today', 'week', 'month', 'all'] as const;
    const stats: Record<string, TaskStats> = {};

    for (const period of periods) {
      const { start, end } = this.getDateBounds(period);

      const where: { userId: string; date?: { gte: Date; lte: Date } } = {
        userId,
      };

      if (start) {
        where.date = { gte: start, lte: end };
      }

      const tasks = await this.prisma.task.findMany({
        where,
        select: { isCompleted: true, points: true },
      });

      stats[period] = this.calculateStats(tasks);
    }

    return stats;
  }

  /**
   * Get task statistics broken down by category
   */
  async getStatsByCategory(userId: string, period?: 'today' | 'week' | 'month') {
    const where: { userId: string; date?: { gte: Date; lte: Date } } = {
      userId,
    };

    if (period) {
      const { start, end } = this.getDateBounds(period);
      if (start) {
        where.date = { gte: start, lte: end };
      }
    }

    const tasks = await this.prisma.task.findMany({
      where,
      select: { category: true, isCompleted: true, points: true },
    });

    // Group by category
    const categoryMap = new Map<
      Category | null,
      { isCompleted: boolean; points: number }[]
    >();

    for (const task of tasks) {
      const key = task.category;
      if (!categoryMap.has(key)) {
        categoryMap.set(key, []);
      }
      categoryMap.get(key)!.push(task);
    }

    // Calculate stats for each category
    const categoryStats: CategoryStats[] = [];

    for (const [category, categoryTasks] of categoryMap) {
      const stats = this.calculateStats(categoryTasks);
      categoryStats.push({
        category,
        ...stats,
      });
    }

    // Sort by total tasks descending
    categoryStats.sort((a, b) => b.total - a.total);

    return categoryStats;
  }

  /**
   * Get weekly goal statistics
   */
  async getWeeklyGoalStats(userId: string) {
    const goals = await this.prisma.weeklyGoal.findMany({
      where: { userId },
      select: { isCompleted: true, xpAwarded: true, points: true },
    });

    const total = goals.length;
    const completed = goals.filter((g) => g.isCompleted).length;
    const xpClaimed = goals.filter((g) => g.xpAwarded).length;
    const totalPoints = goals.reduce((sum, g) => sum + g.points, 0);
    const earnedPoints = goals
      .filter((g) => g.xpAwarded)
      .reduce((sum, g) => sum + g.points, 0);

    return {
      total,
      completed,
      xpClaimed,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      totalPoints,
      earnedPoints,
    };
  }

  /**
   * Get a summary of all user statistics
   */
  async getSummary(userId: string) {
    const [user, taskStats, categoryStats, weeklyGoalStats] = await Promise.all(
      [
        this.prisma.user.findUnique({
          where: { id: userId },
          select: {
            xp: true,
            coins: true,
            streak: {
              select: {
                currentStreak: true,
                longestStreak: true,
                lastCompletedDate: true,
              },
            },
          },
        }),
        this.getTaskStats(userId),
        this.getStatsByCategory(userId),
        this.getWeeklyGoalStats(userId),
      ],
    );

    return {
      user: {
        xp: user?.xp ?? 0,
        coins: user?.coins ?? 0,
      },
      streak: user?.streak ?? null,
      tasks: taskStats,
      tasksByCategory: categoryStats,
      weeklyGoals: weeklyGoalStats,
    };
  }
}

