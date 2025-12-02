import { PrismaService } from 'src/prisma/prisma.service';
import { AchievementDefinition } from '@prisma/client';
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
export declare class AchievementsService {
    private prisma;
    constructor(prisma: PrismaService);
    getAllDefinitions(): Promise<AchievementDefinition[]>;
    getUserAchievements(userId: string): Promise<{
        id: string;
        key: string;
        name: string;
        description: string;
        icon: string | null;
        xpReward: number;
        coinReward: number;
        unlockedAt: Date;
    }[]>;
    getUserProgress(userId: string): Promise<{
        unlocked: boolean;
        currentValue: number;
        category: import("@prisma/client").$Enums.Category | null;
        id: string;
        key: string;
        name: string;
        description: string;
        icon: string | null;
        requirementType: string;
        requirementValue: number;
        xpReward: number;
        coinReward: number;
    }[]>;
    checkAndUnlockAchievements(userId: string): Promise<UnlockedAchievement[]>;
    private getUserStats;
    private getTasksByCategory;
    private getCurrentValue;
    private unlockAchievement;
}
