import { TasksService } from './tasks.service';
import { Request } from 'express';
import { Task } from './task.types';
import { CreateTaskDto } from './dto/create-task.dto';
export declare class TasksController {
    private readonly tasksService;
    constructor(tasksService: TasksService);
    findAll(req: Request & {
        user: {
            id: string;
        };
    }): Promise<Task[]>;
    create(dto: CreateTaskDto, req: Request & {
        user: {
            id: string;
        };
    }): Promise<{
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
    completeTask(id: string, req: Request & {
        user: {
            id: string;
        };
    }): Promise<{
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
