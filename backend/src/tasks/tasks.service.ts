import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { Task } from './task.types';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string): Promise<Task[]> {
    return this.prisma.task.findMany({
      where: { userId },
      orderBy: { date: 'asc' },
    });
  }

  async create(userId: string, dto: CreateTaskDto) {
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

  async completeTask(taskId: string, userId: string) {
    // 1. Ensure the task exists and belongs to this user
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task || task.userId !== userId) {
      throw new NotFoundException('Task not found');
    }

    // 2. Update to completed
    const updatedTask = await this.prisma.task.update({
      where: { id: taskId },
      data: {
        isCompleted: true,
        completedAt: new Date(),
      },
    });

    return updatedTask;
  }
}
