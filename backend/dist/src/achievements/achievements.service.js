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
exports.AchievementsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AchievementsService = class AchievementsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAllDefinitions() {
        return this.prisma.achievementDefinition.findMany({
            orderBy: [{ requirementType: 'asc' }, { requirementValue: 'asc' }],
        });
    }
    async getUserAchievements(userId) {
        const userAchievements = await this.prisma.userAchievement.findMany({
            where: { userId },
            include: { achievement: true },
            orderBy: { unlockedAt: 'desc' },
        });
        return userAchievements.map((ua) => ({
            id: ua.achievement.id,
            key: ua.achievement.key,
            name: ua.achievement.name,
            description: ua.achievement.description,
            icon: ua.achievement.icon,
            xpReward: ua.achievement.xpReward,
            coinReward: ua.achievement.coinReward,
            unlockedAt: ua.unlockedAt,
        }));
    }
    async getUserProgress(userId) {
        const [definitions, userAchievements, stats] = await Promise.all([
            this.getAllDefinitions(),
            this.prisma.userAchievement.findMany({
                where: { userId },
                select: { achievementId: true },
            }),
            this.getUserStats(userId),
        ]);
        const unlockedIds = new Set(userAchievements.map((ua) => ua.achievementId));
        return definitions.map((def) => ({
            ...def,
            unlocked: unlockedIds.has(def.id),
            currentValue: this.getCurrentValue(def, stats),
        }));
    }
    async checkAndUnlockAchievements(userId) {
        const [definitions, userAchievements, stats] = await Promise.all([
            this.getAllDefinitions(),
            this.prisma.userAchievement.findMany({
                where: { userId },
                select: { achievementId: true },
            }),
            this.getUserStats(userId),
        ]);
        const unlockedIds = new Set(userAchievements.map((ua) => ua.achievementId));
        const newlyUnlocked = [];
        for (const def of definitions) {
            if (unlockedIds.has(def.id))
                continue;
            const currentValue = this.getCurrentValue(def, stats);
            if (currentValue >= def.requirementValue) {
                const userAchievement = await this.unlockAchievement(userId, def);
                newlyUnlocked.push({
                    id: def.id,
                    key: def.key,
                    name: def.name,
                    description: def.description,
                    icon: def.icon,
                    xpReward: def.xpReward,
                    coinReward: def.coinReward,
                    unlockedAt: userAchievement.unlockedAt,
                });
            }
        }
        return newlyUnlocked;
    }
    async getUserStats(userId) {
        const [user, tasksCompleted, goalsCompleted, streak, tasksByCategory,] = await Promise.all([
            this.prisma.user.findUnique({
                where: { id: userId },
                select: { xp: true, coins: true },
            }),
            this.prisma.task.count({
                where: { userId, isCompleted: true },
            }),
            this.prisma.weeklyGoal.count({
                where: { userId, xpAwarded: true },
            }),
            this.prisma.streak.findUnique({
                where: { userId },
                select: { currentStreak: true, longestStreak: true },
            }),
            this.getTasksByCategory(userId),
        ]);
        return {
            xp: user?.xp ?? 0,
            coins: user?.coins ?? 0,
            tasksCompleted,
            goalsCompleted,
            currentStreak: streak?.currentStreak ?? 0,
            longestStreak: streak?.longestStreak ?? 0,
            tasksByCategory,
        };
    }
    async getTasksByCategory(userId) {
        const tasks = await this.prisma.task.groupBy({
            by: ['category'],
            where: { userId, isCompleted: true, category: { not: null } },
            _count: { id: true },
        });
        const map = new Map();
        for (const t of tasks) {
            if (t.category) {
                map.set(t.category, t._count.id);
            }
        }
        return map;
    }
    getCurrentValue(def, stats) {
        switch (def.requirementType) {
            case 'TASKS_COMPLETED':
                if (def.category) {
                    return stats.tasksByCategory.get(def.category) ?? 0;
                }
                return stats.tasksCompleted;
            case 'GOALS_COMPLETED':
                return stats.goalsCompleted;
            case 'STREAK_DAYS':
                return stats.longestStreak;
            case 'XP_EARNED':
                return stats.xp;
            case 'COINS_EARNED':
                return stats.coins;
            default:
                return 0;
        }
    }
    async unlockAchievement(userId, def) {
        const [userAchievement] = await this.prisma.$transaction([
            this.prisma.userAchievement.create({
                data: {
                    userId,
                    achievementId: def.id,
                },
            }),
            this.prisma.user.update({
                where: { id: userId },
                data: {
                    xp: { increment: def.xpReward },
                    coins: { increment: def.coinReward },
                },
            }),
        ]);
        return userAchievement;
    }
};
exports.AchievementsService = AchievementsService;
exports.AchievementsService = AchievementsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AchievementsService);
//# sourceMappingURL=achievements.service.js.map