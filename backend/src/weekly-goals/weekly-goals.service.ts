import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateWeeklyGoalDto } from './dto/create-weekly-goal.dto';
import { UpdateWeeklyGoalDto } from './dto/update-weekly-goal.dto';
import { WeeklyGoalQueryDto } from './dto/weekly-goal-query.dto';
import { WeeklyGoal } from './weekly-goal.types';
import {
  AchievementsService,
  UnlockedAchievement,
} from 'src/achievements/achievements.service';

@Injectable()
export class WeeklyGoalsService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => AchievementsService))
    private achievementsService: AchievementsService,
  ) {}

  /**
   * Normalize a date to the Monday of its week (start of week)
   */
  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    // Adjust: Sunday (0) becomes 6, Monday (1) becomes 0, etc.
    const diff = day === 0 ? 6 : day - 1;
    d.setDate(d.getDate() - diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  /**
   * Get the end of a week (Sunday 23:59:59.999)
   */
  private getWeekEnd(weekStart: Date): Date {
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return end;
  }

  /**
   * Check if a week has ended
   */
  private hasWeekEnded(weekStartDate: Date): boolean {
    const weekEnd = this.getWeekEnd(weekStartDate);
    return new Date() > weekEnd;
  }

  async findAll(userId: string, query: WeeklyGoalQueryDto): Promise<WeeklyGoal[]> {
    const where: {
      userId: string;
      isCompleted?: boolean;
      xpAwarded?: boolean;
      weekStartDate?: { gte: Date; lte: Date };
    } = { userId };

    // Filter by completion status
    if (query.completed !== undefined) {
      where.isCompleted = query.completed === 'true';
    }

    // Filter by xpAwarded status
    if (query.xpAwarded !== undefined) {
      where.xpAwarded = query.xpAwarded === 'true';
    }

    // Filter by week
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

  async findOne(goalId: string, userId: string): Promise<WeeklyGoal> {
    const goal = await this.prisma.weeklyGoal.findUnique({
      where: { id: goalId },
    });

    if (!goal) {
      throw new NotFoundException('Weekly goal not found');
    }

    if (goal.userId !== userId) {
      throw new ForbiddenException('You do not have access to this goal');
    }

    return goal;
  }

  async create(userId: string, dto: CreateWeeklyGoalDto): Promise<WeeklyGoal> {
    // Normalize weekStartDate to Monday of that week
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
    } catch (err) {
      console.error('Error creating weekly goal:', err);
      throw new BadRequestException('Could not create weekly goal');
    }
  }

  async update(
    goalId: string,
    userId: string,
    dto: UpdateWeeklyGoalDto,
  ): Promise<WeeklyGoal> {
    // Verify goal exists and belongs to user
    const goal = await this.findOne(goalId, userId);

    // Cannot update if XP has been awarded
    if (goal.xpAwarded) {
      throw new BadRequestException('Cannot update a goal after XP has been awarded');
    }

    const updateData: {
      title?: string;
      description?: string;
      category?: typeof dto.category;
      points?: number;
      isAvoidGoal?: boolean;
    } = {};

    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.category !== undefined) updateData.category = dto.category;
    if (dto.points !== undefined) updateData.points = dto.points;
    if (dto.isAvoidGoal !== undefined) updateData.isAvoidGoal = dto.isAvoidGoal;

    return this.prisma.weeklyGoal.update({
      where: { id: goalId },
      data: updateData,
    });
  }

  async delete(goalId: string, userId: string): Promise<WeeklyGoal> {
    // Verify goal exists and belongs to user
    await this.findOne(goalId, userId);

    return this.prisma.weeklyGoal.delete({
      where: { id: goalId },
    });
  }

  async complete(goalId: string, userId: string): Promise<WeeklyGoal> {
    // Verify goal exists and belongs to user
    const goal = await this.findOne(goalId, userId);

    if (goal.isCompleted) {
      throw new BadRequestException('Goal is already completed');
    }

    // For avoidance goals, can only mark complete after week ends
    if (goal.isAvoidGoal && !this.hasWeekEnded(goal.weekStartDate)) {
      throw new BadRequestException(
        'Avoidance goals can only be marked complete after the week ends',
      );
    }

    return this.prisma.weeklyGoal.update({
      where: { id: goalId },
      data: { isCompleted: true },
    });
  }

  async uncomplete(goalId: string, userId: string): Promise<WeeklyGoal> {
    // Verify goal exists and belongs to user
    const goal = await this.findOne(goalId, userId);

    if (!goal.isCompleted) {
      throw new BadRequestException('Goal is not completed');
    }

    // Cannot uncomplete if XP has been awarded
    if (goal.xpAwarded) {
      throw new BadRequestException('Cannot uncomplete after XP has been awarded');
    }

    return this.prisma.weeklyGoal.update({
      where: { id: goalId },
      data: { isCompleted: false },
    });
  }

  async claimXp(
    goalId: string,
    userId: string,
  ): Promise<{ goal: WeeklyGoal; unlockedAchievements: UnlockedAchievement[] }> {
    // Verify goal exists and belongs to user
    const goal = await this.findOne(goalId, userId);

    // Must be completed
    if (!goal.isCompleted) {
      throw new BadRequestException('Goal must be completed before claiming XP');
    }

    // XP already awarded
    if (goal.xpAwarded) {
      throw new BadRequestException('XP has already been awarded for this goal');
    }

    // Week must have ended
    if (!this.hasWeekEnded(goal.weekStartDate)) {
      const weekEnd = this.getWeekEnd(goal.weekStartDate);
      throw new BadRequestException(
        `Cannot claim XP until the week ends (${weekEnd.toDateString()})`,
      );
    }

    // Use transaction to award XP/coins and mark as awarded
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

    // Check for newly unlocked achievements
    const unlockedAchievements =
      await this.achievementsService.checkAndUnlockAchievements(userId);

    return { goal: updatedGoal, unlockedAchievements };
  }

  /**
   * Claim XP for all completed goals from past weeks that haven't been awarded
   */
  async claimAllPendingXp(
    userId: string,
  ): Promise<{
    claimed: number;
    totalXp: number;
    unlockedAchievements: UnlockedAchievement[];
  }> {
    // Find all completed goals where week has ended and XP not awarded
    const pendingGoals = await this.prisma.weeklyGoal.findMany({
      where: {
        userId,
        isCompleted: true,
        xpAwarded: false,
      },
    });

    // Filter to only goals where week has ended
    const claimableGoals = pendingGoals.filter((goal) =>
      this.hasWeekEnded(goal.weekStartDate),
    );

    if (claimableGoals.length === 0) {
      return { claimed: 0, totalXp: 0, unlockedAchievements: [] };
    }

    const totalXp = claimableGoals.reduce((sum, goal) => sum + goal.points, 0);
    const goalIds = claimableGoals.map((goal) => goal.id);

    // Award all XP in a transaction
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

    // Check for newly unlocked achievements
    const unlockedAchievements =
      await this.achievementsService.checkAndUnlockAchievements(userId);

    return { claimed: claimableGoals.length, totalXp, unlockedAchievements };
  }
}

