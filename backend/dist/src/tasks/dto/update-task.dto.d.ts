import { Category } from '@prisma/client';
export declare class UpdateTaskDto {
    title?: string;
    description?: string;
    category?: Category;
    date?: string;
    points?: number;
    isCompleted?: boolean;
}
