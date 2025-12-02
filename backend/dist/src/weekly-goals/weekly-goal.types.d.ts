import { Category } from '@prisma/client';
export interface WeeklyGoal {
    id: string;
    userId: string;
    weekStartDate: Date;
    title: string;
    description: string | null;
    category: Category | null;
    points: number;
    isAvoidGoal: boolean;
    isCompleted: boolean;
    xpAwarded: boolean;
    createdAt: Date;
    updatedAt: Date;
}
