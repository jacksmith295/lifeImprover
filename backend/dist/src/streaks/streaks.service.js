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
exports.StreaksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let StreaksService = class StreaksService {
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
    async getStreak(userId) {
        const streak = await this.prisma.streak.findUnique({
            where: { userId },
        });
        if (!streak) {
            return {
                currentStreak: 0,
                longestStreak: 0,
                lastCompletedDate: null,
                isActiveToday: false,
            };
        }
        const isActiveToday = streak.lastCompletedDate
            ? this.isToday(streak.lastCompletedDate)
            : false;
        return {
            currentStreak: streak.currentStreak,
            longestStreak: streak.longestStreak,
            lastCompletedDate: streak.lastCompletedDate,
            isActiveToday,
        };
    }
    async getStreakStatus(userId) {
        const streak = await this.getStreak(userId);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);
        const [totalTasks, completedTasks] = await Promise.all([
            this.prisma.task.count({
                where: {
                    userId,
                    date: { gte: today, lte: endOfDay },
                },
            }),
            this.prisma.task.count({
                where: {
                    userId,
                    date: { gte: today, lte: endOfDay },
                    isCompleted: true,
                },
            }),
        ]);
        const allTasksCompleted = totalTasks > 0 && totalTasks === completedTasks;
        return {
            ...streak,
            todayProgress: {
                totalTasks,
                completedTasks,
                allCompleted: allTasksCompleted,
                remainingTasks: totalTasks - completedTasks,
            },
        };
    }
    async resetStreak(userId) {
        const streak = await this.prisma.streak.findUnique({
            where: { userId },
        });
        if (!streak) {
            throw new common_1.NotFoundException('No streak record found');
        }
        const updated = await this.prisma.streak.update({
            where: { userId },
            data: {
                currentStreak: 0,
                lastCompletedDate: null,
            },
        });
        return {
            message: 'Streak reset successfully',
            previousStreak: streak.currentStreak,
            longestStreak: updated.longestStreak,
        };
    }
    async getStreakMilestones(userId) {
        const streak = await this.getStreak(userId);
        const milestones = [
            { days: 7, name: 'Week Warrior', reached: streak.longestStreak >= 7 },
            { days: 14, name: 'Fortnight Fighter', reached: streak.longestStreak >= 14 },
            { days: 30, name: 'Monthly Master', reached: streak.longestStreak >= 30 },
            { days: 60, name: 'Sixty-Day Slayer', reached: streak.longestStreak >= 60 },
            { days: 90, name: 'Quarter Champion', reached: streak.longestStreak >= 90 },
            { days: 180, name: 'Half-Year Hero', reached: streak.longestStreak >= 180 },
            { days: 365, name: 'Yearly Legend', reached: streak.longestStreak >= 365 },
        ];
        const nextMilestone = milestones.find((m) => !m.reached) ?? null;
        const daysToNextMilestone = nextMilestone
            ? nextMilestone.days - streak.currentStreak
            : null;
        return {
            currentStreak: streak.currentStreak,
            longestStreak: streak.longestStreak,
            milestones,
            nextMilestone: nextMilestone
                ? {
                    ...nextMilestone,
                    daysRemaining: daysToNextMilestone,
                }
                : null,
        };
    }
};
exports.StreaksService = StreaksService;
exports.StreaksService = StreaksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StreaksService);
//# sourceMappingURL=streaks.service.js.map