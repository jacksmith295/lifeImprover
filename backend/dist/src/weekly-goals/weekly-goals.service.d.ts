import { PrismaService } from 'src/prisma/prisma.service';
import { CreateWeeklyGoalDto } from './dto/create-weekly-goal.dto';
import { UpdateWeeklyGoalDto } from './dto/update-weekly-goal.dto';
import { WeeklyGoalQueryDto } from './dto/weekly-goal-query.dto';
import { WeeklyGoal } from './weekly-goal.types';
export declare class WeeklyGoalsService {
    private prisma;
    constructor(prisma: PrismaService);
    private getWeekStart;
    private getWeekEnd;
    private hasWeekEnded;
    findAll(userId: string, query: WeeklyGoalQueryDto): Promise<WeeklyGoal[]>;
    findOne(goalId: string, userId: string): Promise<WeeklyGoal>;
    create(userId: string, dto: CreateWeeklyGoalDto): Promise<WeeklyGoal>;
    update(goalId: string, userId: string, dto: UpdateWeeklyGoalDto): Promise<WeeklyGoal>;
    delete(goalId: string, userId: string): Promise<WeeklyGoal>;
    complete(goalId: string, userId: string): Promise<WeeklyGoal>;
    uncomplete(goalId: string, userId: string): Promise<WeeklyGoal>;
    claimXp(goalId: string, userId: string): Promise<WeeklyGoal>;
    claimAllPendingXp(userId: string): Promise<{
        claimed: number;
        totalXp: number;
    }>;
}
