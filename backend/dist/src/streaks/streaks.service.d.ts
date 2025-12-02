import { PrismaService } from 'src/prisma/prisma.service';
export declare class StreaksService {
    private prisma;
    constructor(prisma: PrismaService);
    private isToday;
    getStreak(userId: string): Promise<{
        currentStreak: number;
        longestStreak: number;
        lastCompletedDate: Date | null;
        isActiveToday: boolean;
    }>;
    getStreakStatus(userId: string): Promise<{
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
    resetStreak(userId: string): Promise<{
        message: string;
        previousStreak: number;
        longestStreak: number;
    }>;
    getStreakMilestones(userId: string): Promise<{
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
}
