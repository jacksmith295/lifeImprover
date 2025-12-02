import { AchievementsService } from './achievements.service';
import { Request } from 'express';
export declare class AchievementsController {
    private achievementsService;
    constructor(achievementsService: AchievementsService);
    getAllDefinitions(): Promise<{
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
    getUserAchievements(req: Request & {
        user: {
            id: string;
        };
    }): Promise<{
        id: string;
        key: string;
        name: string;
        description: string;
        icon: string | null;
        xpReward: number;
        coinReward: number;
        unlockedAt: Date;
    }[]>;
    getUserProgress(req: Request & {
        user: {
            id: string;
        };
    }): Promise<{
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
}
