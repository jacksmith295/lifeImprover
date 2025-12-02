import { WeeklyGoalsService } from './weekly-goals.service';
import { Request } from 'express';
import { WeeklyGoal } from './weekly-goal.types';
import { CreateWeeklyGoalDto } from './dto/create-weekly-goal.dto';
import { UpdateWeeklyGoalDto } from './dto/update-weekly-goal.dto';
import { WeeklyGoalQueryDto } from './dto/weekly-goal-query.dto';
interface AuthenticatedRequest extends Request {
    user: {
        id: string;
    };
}
export declare class WeeklyGoalsController {
    private readonly weeklyGoalsService;
    constructor(weeklyGoalsService: WeeklyGoalsService);
    findAll(req: AuthenticatedRequest, query: WeeklyGoalQueryDto): Promise<WeeklyGoal[]>;
    findOne(id: string, req: AuthenticatedRequest): Promise<WeeklyGoal>;
    create(dto: CreateWeeklyGoalDto, req: AuthenticatedRequest): Promise<WeeklyGoal>;
    update(id: string, dto: UpdateWeeklyGoalDto, req: AuthenticatedRequest): Promise<WeeklyGoal>;
    delete(id: string, req: AuthenticatedRequest): Promise<WeeklyGoal>;
    complete(id: string, req: AuthenticatedRequest): Promise<WeeklyGoal>;
    uncomplete(id: string, req: AuthenticatedRequest): Promise<WeeklyGoal>;
    claimXp(id: string, req: AuthenticatedRequest): Promise<WeeklyGoal>;
    claimAllPendingXp(req: AuthenticatedRequest): Promise<{
        claimed: number;
        totalXp: number;
    }>;
}
export {};
