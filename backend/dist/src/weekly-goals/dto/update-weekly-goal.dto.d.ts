import { Category } from '@prisma/client';
export declare class UpdateWeeklyGoalDto {
    title?: string;
    description?: string;
    category?: Category;
    points?: number;
    isAvoidGoal?: boolean;
}
