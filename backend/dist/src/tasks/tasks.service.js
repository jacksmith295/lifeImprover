"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TasksService = class TasksService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    isToday(date) {
        const today = new Date();
        return (date.getFullYear() === today.getFullYear() &&
            date.getMonth() === today.getMonth() &&
            date.getDate() === today.getDate());
    }
    isYesterday(date) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return (date.getFullYear() === yesterday.getFullYear() &&
            date.getMonth() === yesterday.getMonth() &&
            date.getDate() === yesterday.getDate());
    }
    getDayBounds(date) {
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);
        return { start, end };
    }
    async areAllTasksCompletedForDay(userId, date) {
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
    async updateStreakIfAllComplete(userId, taskDate) {
        const allComplete = await this.areAllTasksCompletedForDay(userId, taskDate);
        if (!allComplete)
            return;
        const streak = await this.prisma.streak.findUnique({
            where: { userId },
        });
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (!streak) {
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
        if (streak.lastCompletedDate && this.isToday(streak.lastCompletedDate)) {
            return;
        }
        const wasYesterday = streak.lastCompletedDate && this.isYesterday(streak.lastCompletedDate);
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
        }
        else {
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
    async findAll(userId, query) {
        const where = { userId };
        if (query.completed !== undefined) {
            where.isCompleted = query.completed === 'true';
        }
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
    async findOne(taskId, userId) {
        const task = await this.prisma.task.findUnique({
            where: { id: taskId },
        });
        if (!task) {
            throw new common_1.NotFoundException('Task not found');
        }
        if (task.userId !== userId) {
            throw new common_1.ForbiddenException('You do not have access to this task');
        }
        return task;
    }
    async create(userId, dto) {
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
        }
        catch (err) {
            console.error('Error creating task:', err);
            throw new common_1.BadRequestException('Could not create task');
        }
    }
    async update(taskId, userId, dto) {
        const task = await this.findOne(taskId, userId);
        if (dto.isCompleted !== undefined && !this.isToday(task.date)) {
            throw new common_1.BadRequestException('Cannot change completion status of tasks from past days');
        }
        const updateData = {};
        if (dto.title !== undefined)
            updateData.title = dto.title;
        if (dto.description !== undefined)
            updateData.description = dto.description;
        if (dto.category !== undefined)
            updateData.category = dto.category;
        if (dto.date !== undefined)
            updateData.date = new Date(dto.date);
        if (dto.points !== undefined)
            updateData.points = dto.points;
        if (dto.isCompleted !== undefined) {
            updateData.isCompleted = dto.isCompleted;
            updateData.completedAt = dto.isCompleted ? new Date() : null;
        }
        return this.prisma.task.update({
            where: { id: taskId },
            data: updateData,
        });
    }
    async delete(taskId, userId) {
        await this.findOne(taskId, userId);
        return this.prisma.task.delete({
            where: { id: taskId },
        });
    }
    async completeTask(taskId, userId) {
        const task = await this.findOne(taskId, userId);
        if (!this.isToday(task.date)) {
            throw new common_1.BadRequestException('Cannot complete tasks from past days');
        }
        if (task.isCompleted) {
            throw new common_1.BadRequestException('Task is already completed');
        }
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
        await this.updateStreakIfAllComplete(userId, task.date);
        return updatedTask;
    }
    async uncompleteTask(taskId, userId) {
        const task = await this.findOne(taskId, userId);
        if (!this.isToday(task.date)) {
            throw new common_1.BadRequestException('Cannot uncomplete tasks from past days');
        }
        if (!task.isCompleted) {
            throw new common_1.BadRequestException('Task is not completed');
        }
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
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map