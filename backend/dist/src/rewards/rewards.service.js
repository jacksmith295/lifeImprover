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
exports.RewardsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let RewardsService = class RewardsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(userId, query) {
        const where = { userId };
        if (query.redeemed !== undefined) {
            if (query.redeemed === 'true') {
                where.redeemedAt = { not: null };
            }
            else {
                where.redeemedAt = null;
            }
        }
        return this.prisma.reward.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(rewardId, userId) {
        const reward = await this.prisma.reward.findUnique({
            where: { id: rewardId },
        });
        if (!reward) {
            throw new common_1.NotFoundException('Reward not found');
        }
        if (reward.userId !== userId) {
            throw new common_1.ForbiddenException('You do not have access to this reward');
        }
        return reward;
    }
    async create(userId, dto) {
        try {
            return await this.prisma.reward.create({
                data: {
                    userId,
                    title: dto.title,
                    description: dto.description,
                    cost: dto.cost,
                },
            });
        }
        catch (err) {
            console.error('Error creating reward:', err);
            throw new common_1.BadRequestException('Could not create reward');
        }
    }
    async update(rewardId, userId, dto) {
        const reward = await this.findOne(rewardId, userId);
        if (reward.redeemedAt) {
            throw new common_1.BadRequestException('Cannot update a redeemed reward');
        }
        const updateData = {};
        if (dto.title !== undefined)
            updateData.title = dto.title;
        if (dto.description !== undefined)
            updateData.description = dto.description;
        if (dto.cost !== undefined)
            updateData.cost = dto.cost;
        return this.prisma.reward.update({
            where: { id: rewardId },
            data: updateData,
        });
    }
    async delete(rewardId, userId) {
        await this.findOne(rewardId, userId);
        return this.prisma.reward.delete({
            where: { id: rewardId },
        });
    }
    async redeem(rewardId, userId) {
        const reward = await this.findOne(rewardId, userId);
        if (reward.redeemedAt) {
            throw new common_1.BadRequestException('Reward has already been redeemed');
        }
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (user.coins < reward.cost) {
            throw new common_1.BadRequestException(`Insufficient coins. You have ${user.coins} coins but need ${reward.cost}`);
        }
        const [updatedReward] = await this.prisma.$transaction([
            this.prisma.reward.update({
                where: { id: rewardId },
                data: {
                    redeemedAt: new Date(),
                },
            }),
            this.prisma.user.update({
                where: { id: userId },
                data: {
                    coins: { decrement: reward.cost },
                },
            }),
        ]);
        return updatedReward;
    }
};
exports.RewardsService = RewardsService;
exports.RewardsService = RewardsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RewardsService);
//# sourceMappingURL=rewards.service.js.map