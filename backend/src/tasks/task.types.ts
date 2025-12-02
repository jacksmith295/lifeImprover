import { Category } from '@prisma/client';

export interface Task {
  id: string;
  userId: string;

  title: string;
  description: string | null;
  category: Category | null;

  date: Date;
  points: number;

  isCompleted: boolean;
  completedAt: Date | null;

  createdAt: Date;
  updatedAt: Date;
}
