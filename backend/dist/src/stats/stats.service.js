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
exports.StatsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let StatsService = class StatsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    getDateBounds(period) {
        const now = new Date();
        let start;
        const end = new Date(now);
        end.setHours(23, 59, 59, 999);
        switch (period) {
            case 'today':
                start = new Date(now);
                start.setHours(0, 0, 0, 0);
                break;
            case 'week':
                start = new Date(now);
                const dayOfWeek = start.getDay();
                const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
                start.setDate(start.getDate() - diff);
                start.setHours(0, 0, 0, 0);
                break;
            case 'month':
                start = new Date(now.getFullYear(), now.getMonth(), 1);
                start.setHours(0, 0, 0, 0);
                break;
            case 'all':
                start = undefined;
                break;
        }
        return { start, end };
    }
    calculateStats(tasks) {
        const total = tasks.length;
        const completed = tasks.filter((t) => t.isCompleted).length;
        const totalPoints = tasks.reduce((sum, t) => sum + t.points, 0);
        const earnedPoints = tasks
            .filter((t) => t.isCompleted)
            .reduce((sum, t) => sum + t.points, 0);
        return {
            total,
            completed,
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
            totalPoints,
            earnedPoints,
        };
    }
    async getTaskStats(userId) {
        const periods = ['today', 'week', 'month', 'all'];
        const stats = {};
        for (const period of periods) {
            const { start, end } = this.getDateBounds(period);
            const where = {
                userId,
            };
            if (start) {
                where.date = { gte: start, lte: end };
            }
            const tasks = await this.prisma.task.findMany({
                where,
                select: { isCompleted: true, points: true },
            });
            stats[period] = this.calculateStats(tasks);
        }
        return stats;
    }
    async getStatsByCategory(userId, period) {
        const where = {
            userId,
        };
        if (period) {
            const { start, end } = this.getDateBounds(period);
            if (start) {
                where.date = { gte: start, lte: end };
            }
        }
        const tasks = await this.prisma.task.findMany({
            where,
            select: { category: true, isCompleted: true, points: true },
        });
        const categoryMap = new Map();
        for (const task of tasks) {
            const key = task.category;
            if (!categoryMap.has(key)) {
                categoryMap.set(key, []);
            }
            categoryMap.get(key).push(task);
        }
        const categoryStats = [];
        for (const [category, categoryTasks] of categoryMap) {
            const stats = this.calculateStats(categoryTasks);
            categoryStats.push({
                category,
                ...stats,
            });
        }
        categoryStats.sort((a, b) => b.total - a.total);
        return categoryStats;
    }
    async getWeeklyGoalStats(userId) {
        const goals = await this.prisma.weeklyGoal.findMany({
            where: { userId },
            select: { isCompleted: true, xpAwarded: true, points: true },
        });
        const total = goals.length;
        const completed = goals.filter((g) => g.isCompleted).length;
        const xpClaimed = goals.filter((g) => g.xpAwarded).length;
        const totalPoints = goals.reduce((sum, g) => sum + g.points, 0);
        const earnedPoints = goals
            .filter((g) => g.xpAwarded)
            .reduce((sum, g) => sum + g.points, 0);
        return {
            total,
            completed,
            xpClaimed,
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
            totalPoints,
            earnedPoints,
        };
    }
    async getSummary(userId) {
        const [user, taskStats, categoryStats, weeklyGoalStats] = await Promise.all([
            this.prisma.user.findUnique({
                where: { id: userId },
                select: {
                    xp: true,
                    coins: true,
                    streak: {
                        select: {
                            currentStreak: true,
                            longestStreak: true,
                            lastCompletedDate: true,
                        },
                    },
                },
            }),
            this.getTaskStats(userId),
            this.getStatsByCategory(userId),
            this.getWeeklyGoalStats(userId),
        ]);
        return {
            user: {
                xp: user?.xp ?? 0,
                coins: user?.coins ?? 0,
            },
            streak: user?.streak ?? null,
            tasks: taskStats,
            tasksByCategory: categoryStats,
            weeklyGoals: weeklyGoalStats,
        };
    }
};
exports.StatsService = StatsService;
exports.StatsService = StatsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StatsService);
//# sourceMappingURL=stats.service.js.map