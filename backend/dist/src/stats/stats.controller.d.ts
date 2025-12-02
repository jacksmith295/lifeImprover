import { StatsService } from './stats.service';
import { Request } from 'express';
export declare class StatsController {
    private statsService;
    constructor(statsService: StatsService);
    getSummary(req: Request & {
        user: {
            id: string;
        };
    }): Promise<{
        user: {
            xp: number;
            coins: number;
        };
        streak: {
            currentStreak: number;
            longestStreak: number;
            lastCompletedDate: Date | null;
        } | null;
        tasks: Record<string, import("./stats.service").TaskStats>;
        tasksByCategory: import("./stats.service").CategoryStats[];
        weeklyGoals: {
            total: number;
            completed: number;
            xpClaimed: number;
            completionRate: number;
            totalPoints: number;
            earnedPoints: number;
        };
    }>;
    getTaskStats(req: Request & {
        user: {
            id: string;
        };
    }): Promise<Record<string, import("./stats.service").TaskStats>>;
    getStatsByCategory(req: Request & {
        user: {
            id: string;
        };
    }, period?: 'today' | 'week' | 'month'): Promise<import("./stats.service").CategoryStats[]>;
    getWeeklyGoalStats(req: Request & {
        user: {
            id: string;
        };
    }): Promise<{
        total: number;
        completed: number;
        xpClaimed: number;
        completionRate: number;
        totalPoints: number;
        earnedPoints: number;
    }>;
}
