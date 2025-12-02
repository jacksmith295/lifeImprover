import { RewardsService } from './rewards.service';
import { Request } from 'express';
import { Reward } from './reward.types';
import { CreateRewardDto } from './dto/create-reward.dto';
import { UpdateRewardDto } from './dto/update-reward.dto';
import { RewardQueryDto } from './dto/reward-query.dto';
interface AuthenticatedRequest extends Request {
    user: {
        id: string;
    };
}
export declare class RewardsController {
    private readonly rewardsService;
    constructor(rewardsService: RewardsService);
    findAll(req: AuthenticatedRequest, query: RewardQueryDto): Promise<Reward[]>;
    findOne(id: string, req: AuthenticatedRequest): Promise<Reward>;
    create(dto: CreateRewardDto, req: AuthenticatedRequest): Promise<Reward>;
    update(id: string, dto: UpdateRewardDto, req: AuthenticatedRequest): Promise<Reward>;
    delete(id: string, req: AuthenticatedRequest): Promise<Reward>;
    redeem(id: string, req: AuthenticatedRequest): Promise<Reward>;
}
export {};
