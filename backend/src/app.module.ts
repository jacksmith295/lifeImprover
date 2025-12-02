import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { TasksModule } from './tasks/tasks.module';
import { RewardsModule } from './rewards/rewards.module';
import { WeeklyGoalsModule } from './weekly-goals/weekly-goals.module';
import { StatsModule } from './stats/stats.module';
import { StreaksModule } from './streaks/streaks.module';
import { AchievementsModule } from './achievements/achievements.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    TasksModule,
    RewardsModule,
    WeeklyGoalsModule,
    StatsModule,
    StreaksModule,
    AchievementsModule,
  ],
})
export class AppModule {}
