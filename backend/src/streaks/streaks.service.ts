import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class StreaksService {
  constructor(private prisma: PrismaService) {}

  /**
   * Check if a date is today (ignoring time)
   */
  private isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  }

  /**
   * Get user's current streak information
   */
  async getStreak(userId: string) {
    const streak = await this.prisma.streak.findUnique({
      where: { userId },
    });

    if (!streak) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastCompletedDate: null,
        isActiveToday: false,
      };
    }

    // Check if streak is still active (completed today or yesterday)
    const isActiveToday = streak.lastCompletedDate
      ? this.isToday(streak.lastCompletedDate)
      : false;

    return {
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      lastCompletedDate: streak.lastCompletedDate,
      isActiveToday,
    };
  }

  /**
   * Get streak status with additional context
   */
  async getStreakStatus(userId: string) {
    const streak = await this.getStreak(userId);

    // Get today's task completion status
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const [totalTasks, completedTasks] = await Promise.all([
      this.prisma.task.count({
        where: {
          userId,
          date: { gte: today, lte: endOfDay },
        },
      }),
      this.prisma.task.count({
        where: {
          userId,
          date: { gte: today, lte: endOfDay },
          isCompleted: true,
        },
      }),
    ]);

    const allTasksCompleted = totalTasks > 0 && totalTasks === completedTasks;

    return {
      ...streak,
      todayProgress: {
        totalTasks,
        completedTasks,
        allCompleted: allTasksCompleted,
        remainingTasks: totalTasks - completedTasks,
      },
    };
  }

  /**
   * Reset user's current streak (admin/testing purposes)
   */
  async resetStreak(userId: string) {
    const streak = await this.prisma.streak.findUnique({
      where: { userId },
    });

    if (!streak) {
      throw new NotFoundException('No streak record found');
    }

    const updated = await this.prisma.streak.update({
      where: { userId },
      data: {
        currentStreak: 0,
        lastCompletedDate: null,
      },
    });

    return {
      message: 'Streak reset successfully',
      previousStreak: streak.currentStreak,
      longestStreak: updated.longestStreak,
    };
  }

  /**
   * Get streak milestones and achievements info
   */
  async getStreakMilestones(userId: string) {
    const streak = await this.getStreak(userId);

    const milestones = [
      { days: 7, name: 'Week Warrior', reached: streak.longestStreak >= 7 },
      { days: 14, name: 'Fortnight Fighter', reached: streak.longestStreak >= 14 },
      { days: 30, name: 'Monthly Master', reached: streak.longestStreak >= 30 },
      { days: 60, name: 'Sixty-Day Slayer', reached: streak.longestStreak >= 60 },
      { days: 90, name: 'Quarter Champion', reached: streak.longestStreak >= 90 },
      { days: 180, name: 'Half-Year Hero', reached: streak.longestStreak >= 180 },
      { days: 365, name: 'Yearly Legend', reached: streak.longestStreak >= 365 },
    ];

    // Find next milestone
    const nextMilestone = milestones.find((m) => !m.reached) ?? null;
    const daysToNextMilestone = nextMilestone
      ? nextMilestone.days - streak.currentStreak
      : null;

    return {
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      milestones,
      nextMilestone: nextMilestone
        ? {
            ...nextMilestone,
            daysRemaining: daysToNextMilestone,
          }
        : null,
    };
  }
}

