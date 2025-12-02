import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { Task } from './task.types';
export declare class TasksService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(userId: string): Promise<Task[]>;
    create(userId: string, dto: CreateTaskDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        category: import("@prisma/client").$Enums.Category | null;
        date: Date;
        points: number;
        userId: string;
        isCompleted: boolean;
        completedAt: Date | null;
    }>;
    completeTask(taskId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        category: import("@prisma/client").$Enums.Category | null;
        date: Date;
        points: number;
        userId: string;
        isCompleted: boolean;
        completedAt: Date | null;
    }>;
}
