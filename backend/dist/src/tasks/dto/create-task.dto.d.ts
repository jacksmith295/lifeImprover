import { Category } from '@prisma/client';
export declare class CreateTaskDto {
    title: string;
    description?: string;
    category?: Category;
    date: string;
    points?: number;
}
