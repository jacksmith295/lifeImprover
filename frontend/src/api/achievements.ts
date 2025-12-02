import { apiClient } from './client';
import type { AchievementDefinition, UnlockedAchievement, AchievementProgress } from '../types/index';

export const achievementsApi = {
  getDefinitions: async (): Promise<AchievementDefinition[]> => {
    const { data } = await apiClient.get<AchievementDefinition[]>('/achievements/definitions');
    return data;
  },

  getUserAchievements: async (): Promise<UnlockedAchievement[]> => {
    const { data } = await apiClient.get<UnlockedAchievement[]>('/achievements');
    return data;
  },

  getProgress: async (): Promise<AchievementProgress[]> => {
    const { data } = await apiClient.get<AchievementProgress[]>('/achievements/progress');
    return data;
  },
};

