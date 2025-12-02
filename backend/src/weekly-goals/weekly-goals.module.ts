import { Module, forwardRef } from '@nestjs/common';
import { WeeklyGoalsService } from './weekly-goals.service';
import { WeeklyGoalsController } from './weekly-goals.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';
import { AchievementsModule } from 'src/achievements/achievements.module';

@Module({
  imports: [PrismaModule, AuthModule, forwardRef(() => AchievementsModule)],
  controllers: [WeeklyGoalsController],
  providers: [WeeklyGoalsService],
})
export class WeeklyGoalsModule {}

