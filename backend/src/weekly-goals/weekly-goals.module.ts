import { Module } from '@nestjs/common';
import { WeeklyGoalsService } from './weekly-goals.service';
import { WeeklyGoalsController } from './weekly-goals.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [WeeklyGoalsController],
  providers: [WeeklyGoalsService],
})
export class WeeklyGoalsModule {}

