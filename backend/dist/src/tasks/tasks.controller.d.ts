import { TasksService } from './tasks.service';
import { Request } from 'express';
import { Task } from './task.types';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskQueryDto } from './dto/task-query.dto';
interface AuthenticatedRequest extends Request {
    user: {
        id: string;
    };
}
export declare class TasksController {
    private readonly tasksService;
    constructor(tasksService: TasksService);
    findAll(req: AuthenticatedRequest, query: TaskQueryDto): Promise<Task[]>;
    findOne(id: string, req: AuthenticatedRequest): Promise<Task>;
    create(dto: CreateTaskDto, req: AuthenticatedRequest): Promise<Task>;
    update(id: string, dto: UpdateTaskDto, req: AuthenticatedRequest): Promise<Task>;
    delete(id: string, req: AuthenticatedRequest): Promise<Task>;
    completeTask(id: string, req: AuthenticatedRequest): Promise<Task>;
    uncompleteTask(id: string, req: AuthenticatedRequest): Promise<Task>;
}
export {};
