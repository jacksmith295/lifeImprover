import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskQueryDto } from './dto/task-query.dto';
import { Task } from './task.types';
import { AchievementsService, UnlockedAchievement } from 'src/achievements/achievements.service';
export declare class TasksService {
    private prisma;
    private achievementsService;
    constructor(prisma: PrismaService, achievementsService: AchievementsService);
    private isToday;
    private isYesterday;
    private getDayBounds;
    private areAllTasksCompletedForDay;
    private updateStreakIfAllComplete;
    findAll(userId: string, query: TaskQueryDto): Promise<Task[]>;
    findOne(taskId: string, userId: string): Promise<Task>;
    create(userId: string, dto: CreateTaskDto): Promise<Task>;
    update(taskId: string, userId: string, dto: UpdateTaskDto): Promise<{
        task: Task;
        unlockedAchievements: UnlockedAchievement[];
    }>;
    delete(taskId: string, userId: string): Promise<Task>;
    completeTask(taskId: string, userId: string): Promise<{
        task: Task;
        unlockedAchievements: UnlockedAchievement[];
    }>;
    uncompleteTask(taskId: string, userId: string): Promise<Task>;
}
