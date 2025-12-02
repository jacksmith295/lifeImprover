import {
  Controller,
  UseGuards,
  Get,
  Req,
  Post,
  Body,
  Patch,
  Param,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { TasksService } from './tasks.service';
import { Request } from 'express';
import { Task } from './task.types';
import { CreateTaskDto } from './dto/create-task.dto';

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(
    @Req() req: Request & { user: { id: string } },
  ): Promise<Task[]> {
    const userId = req.user.id;
    return this.tasksService.findAll(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() dto: CreateTaskDto,
    @Req() req: Request & { user: { id: string } },
  ) {
    return this.tasksService.create(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/complete')
  completeTask(
    @Param('id') id: string,
    @Req() req: Request & { user: { id: string } },
  ) {
    return this.tasksService.completeTask(id, req.user.id);
  }
}
