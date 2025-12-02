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
exports.WeeklyGoalsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let WeeklyGoalsService = class WeeklyGoalsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    getWeekStart(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = day === 0 ? 6 : day - 1;
        d.setDate(d.getDate() - diff);
        d.setHours(0, 0, 0, 0);
        return d;
    }
    getWeekEnd(weekStart) {
        const end = new Date(weekStart);
        end.setDate(end.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        return end;
    }
    hasWeekEnded(weekStartDate) {
        const weekEnd = this.getWeekEnd(weekStartDate);
        return new Date() > weekEnd;
    }
    async findAll(userId, query) {
        const where = { userId };
        if (query.completed !== undefined) {
            where.isCompleted = query.completed === 'true';
        }
        if (query.xpAwarded !== undefined) {
            where.xpAwarded = query.xpAwarded === 'true';
        }
        if (query.weekStartDate) {
            const weekStart = this.getWeekStart(new Date(query.weekStartDate));
            const weekEnd = this.getWeekEnd(weekStart);
            where.weekStartDate = {
                gte: weekStart,
                lte: weekEnd,
            };
        }
        return this.prisma.weeklyGoal.findMany({
            where,
            orderBy: { weekStartDate: 'desc' },
        });
    }
    async findOne(goalId, userId) {
        const goal = await this.prisma.weeklyGoal.findUnique({
            where: { id: goalId },
        });
        if (!goal) {
            throw new common_1.NotFoundException('Weekly goal not found');
        }
        if (goal.userId !== userId) {
            throw new common_1.ForbiddenException('You do not have access to this goal');
        }
        return goal;
    }
    async create(userId, dto) {
        const weekStart = this.getWeekStart(new Date(dto.weekStartDate));
        try {
            return await this.prisma.weeklyGoal.create({
                data: {
                    userId,
                    title: dto.title,
                    description: dto.description,
                    category: dto.category,
                    weekStartDate: weekStart,
                    points: dto.points ?? 0,
                    isAvoidGoal: dto.isAvoidGoal ?? false,
                },
            });
        }
        catch (err) {
            console.error('Error creating weekly goal:', err);
            throw new common_1.BadRequestException('Could not create weekly goal');
        }
    }
    async update(goalId, userId, dto) {
        const goal = await this.findOne(goalId, userId);
        if (goal.xpAwarded) {
            throw new common_1.BadRequestException('Cannot update a goal after XP has been awarded');
        }
        const updateData = {};
        if (dto.title !== undefined)
            updateData.title = dto.title;
        if (dto.description !== undefined)
            updateData.description = dto.description;
        if (dto.category !== undefined)
            updateData.category = dto.category;
        if (dto.points !== undefined)
            updateData.points = dto.points;
        if (dto.isAvoidGoal !== undefined)
            updateData.isAvoidGoal = dto.isAvoidGoal;
        return this.prisma.weeklyGoal.update({
            where: { id: goalId },
            data: updateData,
        });
    }
    async delete(goalId, userId) {
        await this.findOne(goalId, userId);
        return this.prisma.weeklyGoal.delete({
            where: { id: goalId },
        });
    }
    async complete(goalId, userId) {
        const goal = await this.findOne(goalId, userId);
        if (goal.isCompleted) {
            throw new common_1.BadRequestException('Goal is already completed');
        }
        if (goal.isAvoidGoal && !this.hasWeekEnded(goal.weekStartDate)) {
            throw new common_1.BadRequestException('Avoidance goals can only be marked complete after the week ends');
        }
        return this.prisma.weeklyGoal.update({
            where: { id: goalId },
            data: { isCompleted: true },
        });
    }
    async uncomplete(goalId, userId) {
        const goal = await this.findOne(goalId, userId);
        if (!goal.isCompleted) {
            throw new common_1.BadRequestException('Goal is not completed');
        }
        if (goal.xpAwarded) {
            throw new common_1.BadRequestException('Cannot uncomplete after XP has been awarded');
        }
        return this.prisma.weeklyGoal.update({
            where: { id: goalId },
            data: { isCompleted: false },
        });
    }
    async claimXp(goalId, userId) {
        const goal = await this.findOne(goalId, userId);
        if (!goal.isCompleted) {
            throw new common_1.BadRequestException('Goal must be completed before claiming XP');
        }
        if (goal.xpAwarded) {
            throw new common_1.BadRequestException('XP has already been awarded for this goal');
        }
        if (!this.hasWeekEnded(goal.weekStartDate)) {
            const weekEnd = this.getWeekEnd(goal.weekStartDate);
            throw new common_1.BadRequestException(`Cannot claim XP until the week ends (${weekEnd.toDateString()})`);
        }
        const updatedGoal = await this.prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id: userId },
                data: {
                    xp: { increment: goal.points },
                    coins: { increment: goal.points },
                },
            });
            return tx.weeklyGoal.update({
                where: { id: goalId },
                data: { xpAwarded: true },
            });
        });
        return updatedGoal;
    }
    async claimAllPendingXp(userId) {
        const now = new Date();
        const pendingGoals = await this.prisma.weeklyGoal.findMany({
            where: {
                userId,
                isCompleted: true,
                xpAwarded: false,
            },
        });
        const claimableGoals = pendingGoals.filter((goal) => this.hasWeekEnded(goal.weekStartDate));
        if (claimableGoals.length === 0) {
            return { claimed: 0, totalXp: 0 };
        }
        const totalXp = claimableGoals.reduce((sum, goal) => sum + goal.points, 0);
        const goalIds = claimableGoals.map((goal) => goal.id);
        await this.prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id: userId },
                data: {
                    xp: { increment: totalXp },
                    coins: { increment: totalXp },
                },
            });
            await tx.weeklyGoal.updateMany({
                where: { id: { in: goalIds } },
                data: { xpAwarded: true },
            });
        });
        return { claimed: claimableGoals.length, totalXp };
    }
};
exports.WeeklyGoalsService = WeeklyGoalsService;
exports.WeeklyGoalsService = WeeklyGoalsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WeeklyGoalsService);
//# sourceMappingURL=weekly-goals.service.js.map