import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AchievementDefinition, Category } from '@prisma/client';

export interface UnlockedAchievement {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string | null;
  xpReward: number;
  coinReward: number;
  unlockedAt: Date;
}

@Injectable()
export class AchievementsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all achievement definitions
   */
  async getAllDefinitions(): Promise<AchievementDefinition[]> {
    return this.prisma.achievementDefinition.findMany({
      orderBy: [{ requirementType: 'asc' }, { requirementValue: 'asc' }],
    });
  }

  /**
   * Get user's unlocked achievements
   */
  async getUserAchievements(userId: string) {
    const userAchievements = await this.prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
      orderBy: { unlockedAt: 'desc' },
    });

    return userAchievements.map((ua) => ({
      id: ua.achievement.id,
      key: ua.achievement.key,
      name: ua.achievement.name,
      description: ua.achievement.description,
      icon: ua.achievement.icon,
      xpReward: ua.achievement.xpReward,
      coinReward: ua.achievement.coinReward,
      unlockedAt: ua.unlockedAt,
    }));
  }

  /**
   * Get user's progress toward all achievements
   */
  async getUserProgress(userId: string) {
    const [definitions, userAchievements, stats] = await Promise.all([
      this.getAllDefinitions(),
      this.prisma.userAchievement.findMany({
        where: { userId },
        select: { achievementId: true },
      }),
      this.getUserStats(userId),
    ]);

    const unlockedIds = new Set(userAchievements.map((ua) => ua.achievementId));

    return definitions.map((def) => ({
      ...def,
      unlocked: unlockedIds.has(def.id),
      currentValue: this.getCurrentValue(def, stats),
    }));
  }

  /**
   * Check and unlock any newly earned achievements
   * Returns the list of newly unlocked achievements
   */
  async checkAndUnlockAchievements(userId: string): Promise<UnlockedAchievement[]> {
    const [definitions, userAchievements, stats] = await Promise.all([
      this.getAllDefinitions(),
      this.prisma.userAchievement.findMany({
        where: { userId },
        select: { achievementId: true },
      }),
      this.getUserStats(userId),
    ]);

    const unlockedIds = new Set(userAchievements.map((ua) => ua.achievementId));
    const newlyUnlocked: UnlockedAchievement[] = [];

    for (const def of definitions) {
      // Skip if already unlocked
      if (unlockedIds.has(def.id)) continue;

      // Check if requirement is met
      const currentValue = this.getCurrentValue(def, stats);
      if (currentValue >= def.requirementValue) {
        // Unlock the achievement
        const userAchievement = await this.unlockAchievement(userId, def);
        newlyUnlocked.push({
          id: def.id,
          key: def.key,
          name: def.name,
          description: def.description,
          icon: def.icon,
          xpReward: def.xpReward,
          coinReward: def.coinReward,
          unlockedAt: userAchievement.unlockedAt,
        });
      }
    }

    return newlyUnlocked;
  }

  /**
   * Get user's current stats for achievement checking
   */
  private async getUserStats(userId: string) {
    const [
      user,
      tasksCompleted,
      goalsCompleted,
      streak,
      tasksByCategory,
    ] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { xp: true, coins: true },
      }),
      this.prisma.task.count({
        where: { userId, isCompleted: true },
      }),
      this.prisma.weeklyGoal.count({
        where: { userId, xpAwarded: true },
      }),
      this.prisma.streak.findUnique({
        where: { userId },
        select: { currentStreak: true, longestStreak: true },
      }),
      this.getTasksByCategory(userId),
    ]);

    return {
      xp: user?.xp ?? 0,
      coins: user?.coins ?? 0,
      tasksCompleted,
      goalsCompleted,
      currentStreak: streak?.currentStreak ?? 0,
      longestStreak: streak?.longestStreak ?? 0,
      tasksByCategory,
    };
  }

  /**
   * Get completed task count by category
   */
  private async getTasksByCategory(userId: string): Promise<Map<Category, number>> {
    const tasks = await this.prisma.task.groupBy({
      by: ['category'],
      where: { userId, isCompleted: true, category: { not: null } },
      _count: { id: true },
    });

    const map = new Map<Category, number>();
    for (const t of tasks) {
      if (t.category) {
        map.set(t.category, t._count.id);
      }
    }
    return map;
  }

  /**
   * Get current progress value for an achievement
   */
  private getCurrentValue(
    def: AchievementDefinition,
    stats: Awaited<ReturnType<typeof this.getUserStats>>,
  ): number {
    switch (def.requirementType) {
      case 'TASKS_COMPLETED':
        if (def.category) {
          return stats.tasksByCategory.get(def.category) ?? 0;
        }
        return stats.tasksCompleted;

      case 'GOALS_COMPLETED':
        return stats.goalsCompleted;

      case 'STREAK_DAYS':
        return stats.longestStreak;

      case 'XP_EARNED':
        return stats.xp;

      case 'COINS_EARNED':
        return stats.coins;

      default:
        return 0;
    }
  }

  /**
   * Unlock an achievement for a user and award rewards
   */
  private async unlockAchievement(userId: string, def: AchievementDefinition) {
    // Use transaction to unlock and award rewards atomically
    const [userAchievement] = await this.prisma.$transaction([
      this.prisma.userAchievement.create({
        data: {
          userId,
          achievementId: def.id,
        },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: {
          xp: { increment: def.xpReward },
          coins: { increment: def.coinReward },
        },
      }),
    ]);

    return userAchievement;
  }
}

