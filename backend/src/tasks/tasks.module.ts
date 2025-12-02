import { Module, forwardRef } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';
import { AchievementsModule } from 'src/achievements/achievements.module';

@Module({
  imports: [PrismaModule, AuthModule, forwardRef(() => AchievementsModule)],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
