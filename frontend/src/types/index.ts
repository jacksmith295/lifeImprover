// Task types
export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  category: Category | null;
  date: string;
  points: number;
  isCompleted: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type Category =
  | 'CODING'
  | 'FITNESS'
  | 'HEALTH'
  | 'FINANCE'
  | 'HOUSE'
  | 'STUDY'
  | 'WORK'
  | 'AVOIDANCE'
  | 'OTHER';

// Weekly Goal types
export interface WeeklyGoal {
  id: string;
  userId: string;
  weekStartDate: string;
  title: string;
  description: string | null;
  category: Category | null;
  points: number;
  isAvoidGoal: boolean;
  isCompleted: boolean;
  xpAwarded: boolean;
  createdAt: string;
  updatedAt: string;
}

// Reward types
export interface Reward {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  cost: number;
  redeemedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Achievement types
export interface AchievementDefinition {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string | null;
  requirementType: string;
  requirementValue: number;
  category: Category | null;
  xpReward: number;
  coinReward: number;
}

export interface UnlockedAchievement {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string | null;
  xpReward: number;
  coinReward: number;
  unlockedAt: string;
}

export interface AchievementProgress extends AchievementDefinition {
  unlocked: boolean;
  currentValue: number;
}

// Streak types
export interface Streak {
  id: string;
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
}

export interface StreakStatus {
  streak: Streak | null;
  todayCompleted: boolean;
  tasksToday: number;
  completedToday: number;
}

// User types
export interface User {
  id: string;
  email: string;
  xp: number;
  coins: number;
  createdAt: string;
  streak: {
    currentStreak: number;
    longestStreak: number;
    lastCompletedDate: string | null;
  } | null;
}

// API Response types
export interface TaskCompletionResponse {
  task: Task;
  unlockedAchievements: UnlockedAchievement[];
}

export interface GoalClaimResponse {
  goal: WeeklyGoal;
  unlockedAchievements: UnlockedAchievement[];
}

export interface ClaimAllResponse {
  claimed: number;
  totalXp: number;
  unlockedAchievements: UnlockedAchievement[];
}

