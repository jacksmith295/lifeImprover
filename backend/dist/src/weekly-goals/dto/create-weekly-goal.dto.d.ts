import { Category } from '@prisma/client';
export declare class CreateWeeklyGoalDto {
    title: string;
    description?: string;
    category?: Category;
    weekStartDate: string;
    points?: number;
    isAvoidGoal?: boolean;
}
