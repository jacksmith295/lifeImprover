import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRewardDto } from './dto/create-reward.dto';
import { UpdateRewardDto } from './dto/update-reward.dto';
import { RewardQueryDto } from './dto/reward-query.dto';
import { Reward } from './reward.types';
export declare class RewardsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(userId: string, query: RewardQueryDto): Promise<Reward[]>;
    findOne(rewardId: string, userId: string): Promise<Reward>;
    create(userId: string, dto: CreateRewardDto): Promise<Reward>;
    update(rewardId: string, userId: string, dto: UpdateRewardDto): Promise<Reward>;
    delete(rewardId: string, userId: string): Promise<Reward>;
    redeem(rewardId: string, userId: string): Promise<Reward>;
}
