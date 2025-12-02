import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRewardDto } from './dto/create-reward.dto';
import { UpdateRewardDto } from './dto/update-reward.dto';
import { RewardQueryDto } from './dto/reward-query.dto';
import { Reward } from './reward.types';

@Injectable()
export class RewardsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, query: RewardQueryDto): Promise<Reward[]> {
    const where: {
      userId: string;
      redeemedAt?: null | { not: null };
    } = { userId };

    // Filter by redemption status
    if (query.redeemed !== undefined) {
      if (query.redeemed === 'true') {
        where.redeemedAt = { not: null };
      } else {
        where.redeemedAt = null;
      }
    }

    return this.prisma.reward.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(rewardId: string, userId: string): Promise<Reward> {
    const reward = await this.prisma.reward.findUnique({
      where: { id: rewardId },
    });

    if (!reward) {
      throw new NotFoundException('Reward not found');
    }

    if (reward.userId !== userId) {
      throw new ForbiddenException('You do not have access to this reward');
    }

    return reward;
  }

  async create(userId: string, dto: CreateRewardDto): Promise<Reward> {
    try {
      return await this.prisma.reward.create({
        data: {
          userId,
          title: dto.title,
          description: dto.description,
          cost: dto.cost,
        },
      });
    } catch (err) {
      console.error('Error creating reward:', err);
      throw new BadRequestException('Could not create reward');
    }
  }

  async update(
    rewardId: string,
    userId: string,
    dto: UpdateRewardDto,
  ): Promise<Reward> {
    // Verify reward exists and belongs to user
    const reward = await this.findOne(rewardId, userId);

    // Cannot update a redeemed reward
    if (reward.redeemedAt) {
      throw new BadRequestException('Cannot update a redeemed reward');
    }

    const updateData: {
      title?: string;
      description?: string;
      cost?: number;
    } = {};

    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.cost !== undefined) updateData.cost = dto.cost;

    return this.prisma.reward.update({
      where: { id: rewardId },
      data: updateData,
    });
  }

  async delete(rewardId: string, userId: string): Promise<Reward> {
    // Verify reward exists and belongs to user
    await this.findOne(rewardId, userId);

    return this.prisma.reward.delete({
      where: { id: rewardId },
    });
  }

  async redeem(rewardId: string, userId: string): Promise<Reward> {
    // Verify reward exists and belongs to user
    const reward = await this.findOne(rewardId, userId);

    // Check if already redeemed
    if (reward.redeemedAt) {
      throw new BadRequestException('Reward has already been redeemed');
    }

    // Get user to check coin balance
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user has enough coins
    if (user.coins < reward.cost) {
      throw new BadRequestException(
        `Insufficient coins. You have ${user.coins} coins but need ${reward.cost}`,
      );
    }

    // Use transaction to deduct coins and mark reward as redeemed
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
}
