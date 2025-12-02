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
export declare class StatsService {
    private prisma;
    constructor(prisma: PrismaService);
    private getDateBounds;
    private calculateStats;
    getTaskStats(userId: string): Promise<Record<string, TaskStats>>;
    getStatsByCategory(userId: string, period?: 'today' | 'week' | 'month'): Promise<CategoryStats[]>;
    getWeeklyGoalStats(userId: string): Promise<{
        total: number;
        completed: number;
        xpClaimed: number;
        completionRate: number;
        totalPoints: number;
        earnedPoints: number;
    }>;
    getSummary(userId: string): Promise<{
        user: {
            xp: number;
            coins: number;
        };
        streak: {
            currentStreak: number;
            longestStreak: number;
            lastCompletedDate: Date | null;
        } | null;
        tasks: Record<string, TaskStats>;
        tasksByCategory: CategoryStats[];
        weeklyGoals: {
            total: number;
            completed: number;
            xpClaimed: number;
            completionRate: number;
            totalPoints: number;
            earnedPoints: number;
        };
    }>;
}
