import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskQueryDto } from './dto/task-query.dto';
import { Task } from './task.types';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  /**
   * Check if a date is today (ignoring time)
   */
  private isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  }

  /**
   * Check if a date is yesterday (ignoring time)
   */
  private isYesterday(date: Date): boolean {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return (
      date.getFullYear() === yesterday.getFullYear() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getDate() === yesterday.getDate()
    );
  }

  /**
   * Get start and end of a specific day
   */
  private getDayBounds(date: Date): { start: Date; end: Date } {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  }

  /**
   * Check if all tasks for a specific day are completed
   */
  private async areAllTasksCompletedForDay(
    userId: string,
    date: Date,
  ): Promise<boolean> {
    const { start, end } = this.getDayBounds(date);

    const incompleteTasks = await this.prisma.task.count({
      where: {
        userId,
        date: { gte: start, lte: end },
        isCompleted: false,
      },
    });

    return incompleteTasks === 0;
  }

  /**
   * Update streak when all tasks for a day are completed
   */
  private async updateStreakIfAllComplete(
    userId: string,
    taskDate: Date,
  ): Promise<void> {
    const allComplete = await this.areAllTasksCompletedForDay(userId, taskDate);

    if (!allComplete) return;

    // Get or create streak record
    const streak = await this.prisma.streak.findUnique({
      where: { userId },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!streak) {
      // Create new streak
      await this.prisma.streak.create({
        data: {
          userId,
          currentStreak: 1,
          longestStreak: 1,
          lastCompletedDate: today,
        },
      });
      return;
    }

    // Check if we already counted today
    if (streak.lastCompletedDate && this.isToday(streak.lastCompletedDate)) {
      return; // Already counted
    }

    // Check if last completed was yesterday (continue streak)
    const wasYesterday =
      streak.lastCompletedDate && this.isYesterday(streak.lastCompletedDate);
    if (wasYesterday) {
      const newStreak = streak.currentStreak + 1;
      await this.prisma.streak.update({
        where: { userId },
        data: {
          currentStreak: newStreak,
          longestStreak: Math.max(newStreak, streak.longestStreak),
          lastCompletedDate: today,
        },
      });
    } else {
      // Streak broken, start fresh
      await this.prisma.streak.update({
        where: { userId },
        data: {
          currentStreak: 1,
          longestStreak: Math.max(1, streak.longestStreak),
          lastCompletedDate: today,
        },
      });
    }
  }

  async findAll(userId: string, query: TaskQueryDto): Promise<Task[]> {
    const where: {
      userId: string;
      isCompleted?: boolean;
      date?: { gte: Date; lt: Date };
    } = { userId };

    // Filter by completion status
    if (query.completed !== undefined) {
      where.isCompleted = query.completed === 'true';
    }

    // Filter by date (matches tasks on that specific day)
    if (query.date) {
      const startOfDay = new Date(query.date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(query.date);
      endOfDay.setHours(23, 59, 59, 999);

      where.date = {
        gte: startOfDay,
        lt: endOfDay,
      };
    }

    return this.prisma.task.findMany({
      where,
      orderBy: { date: 'asc' },
    });
  }

  async findOne(taskId: string, userId: string): Promise<Task> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.userId !== userId) {
      throw new ForbiddenException('You do not have access to this task');
    }

    return task;
  }

  async create(userId: string, dto: CreateTaskDto): Promise<Task> {
    try {
      return await this.prisma.task.create({
        data: {
          userId,
          title: dto.title,
          description: dto.description,
          category: dto.category,
          date: new Date(dto.date),
          points: dto.points ?? 0,
        },
      });
    } catch (err) {
      console.error('Error creating task:', err);
      throw new BadRequestException('Could not create task');
    }
  }

  async update(
    taskId: string,
    userId: string,
    dto: UpdateTaskDto,
  ): Promise<Task> {
    // Verify task exists and belongs to user
    const task = await this.findOne(taskId, userId);

    // Block completion status changes for past tasks
    if (dto.isCompleted !== undefined && !this.isToday(task.date)) {
      throw new BadRequestException(
        'Cannot change completion status of tasks from past days',
      );
    }

    const updateData: {
      title?: string;
      description?: string;
      category?: typeof dto.category;
      date?: Date;
      points?: number;
      isCompleted?: boolean;
      completedAt?: Date | null;
    } = {};

    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.category !== undefined) updateData.category = dto.category;
    if (dto.date !== undefined) updateData.date = new Date(dto.date);
    if (dto.points !== undefined) updateData.points = dto.points;

    // Handle completion status changes
    if (dto.isCompleted !== undefined) {
      updateData.isCompleted = dto.isCompleted;
      updateData.completedAt = dto.isCompleted ? new Date() : null;
    }

    return this.prisma.task.update({
      where: { id: taskId },
      data: updateData,
    });
  }

  async delete(taskId: string, userId: string): Promise<Task> {
    // Verify task exists and belongs to user
    await this.findOne(taskId, userId);

    return this.prisma.task.delete({
      where: { id: taskId },
    });
  }

  async completeTask(taskId: string, userId: string): Promise<Task> {
    // Verify task exists and belongs to user
    const task = await this.findOne(taskId, userId);

    // Block completing tasks from past days
    if (!this.isToday(task.date)) {
      throw new BadRequestException('Cannot complete tasks from past days');
    }

    if (task.isCompleted) {
      throw new BadRequestException('Task is already completed');
    }

    // Use transaction to update task and user atomically
    const [updatedTask] = await this.prisma.$transaction([
      this.prisma.task.update({
        where: { id: taskId },
        data: {
          isCompleted: true,
          completedAt: new Date(),
        },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: {
          xp: { increment: task.points },
          coins: { increment: task.points },
        },
      }),
    ]);

    // Check if all tasks for today are now complete and update streak
    await this.updateStreakIfAllComplete(userId, task.date);

    return updatedTask;
  }

  async uncompleteTask(taskId: string, userId: string): Promise<Task> {
    // Verify task exists and belongs to user
    const task = await this.findOne(taskId, userId);

    // Block uncompleting tasks from past days
    if (!this.isToday(task.date)) {
      throw new BadRequestException('Cannot uncomplete tasks from past days');
    }

    if (!task.isCompleted) {
      throw new BadRequestException('Task is not completed');
    }

    // Use transaction to update task and user atomically
    const [updatedTask] = await this.prisma.$transaction([
      this.prisma.task.update({
        where: { id: taskId },
        data: {
          isCompleted: false,
          completedAt: null,
        },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: {
          xp: { decrement: task.points },
          coins: { decrement: task.points },
        },
      }),
    ]);

    return updatedTask;
  }
}
