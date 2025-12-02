import {
  Controller,
  UseGuards,
  Get,
  Req,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { TasksService } from './tasks.service';
import { Request } from 'express';
import { Task } from './task.types';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskQueryDto } from './dto/task-query.dto';

interface AuthenticatedRequest extends Request {
  user: { id: string };
}

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  async findAll(
    @Req() req: AuthenticatedRequest,
    @Query() query: TaskQueryDto,
  ): Promise<Task[]> {
    return await this.tasksService.findAll(req.user.id, query);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<Task> {
    return await this.tasksService.findOne(id, req.user.id);
  }

  @Post()
  async create(
    @Body() dto: CreateTaskDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<Task> {
    return await this.tasksService.create(req.user.id, dto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<Task> {
    return await this.tasksService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<Task> {
    return await this.tasksService.delete(id, req.user.id);
  }

  @Patch(':id/complete')
  async completeTask(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<Task> {
    return await this.tasksService.completeTask(id, req.user.id);
  }

  @Patch(':id/uncomplete')
  async uncompleteTask(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<Task> {
    return await this.tasksService.uncompleteTask(id, req.user.id);
  }
}
