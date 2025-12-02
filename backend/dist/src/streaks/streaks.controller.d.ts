import { StreaksService } from './streaks.service';
import { Request } from 'express';
export declare class StreaksController {
    private streaksService;
    constructor(streaksService: StreaksService);
    getStreak(req: Request & {
        user: {
            id: string;
        };
    }): Promise<{
        currentStreak: number;
        longestStreak: number;
        lastCompletedDate: Date | null;
        isActiveToday: boolean;
    }>;
    getStreakStatus(req: Request & {
        user: {
            id: string;
        };
    }): Promise<{
        todayProgress: {
            totalTasks: number;
            completedTasks: number;
            allCompleted: boolean;
            remainingTasks: number;
        };
        currentStreak: number;
        longestStreak: number;
        lastCompletedDate: Date | null;
        isActiveToday: boolean;
    }>;
    getStreakMilestones(req: Request & {
        user: {
            id: string;
        };
    }): Promise<{
        currentStreak: number;
        longestStreak: number;
        milestones: {
            days: number;
            name: string;
            reached: boolean;
        }[];
        nextMilestone: {
            daysRemaining: number | null;
            days: number;
            name: string;
            reached: boolean;
        } | null;
    }>;
    resetStreak(req: Request & {
        user: {
            id: string;
        };
    }): Promise<{
        message: string;
        previousStreak: number;
        longestStreak: number;
    }>;
}
