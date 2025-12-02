import { apiClient } from './client';
import type { Task, TaskCompletionResponse, Category } from '../types/index';

interface CreateTaskDto {
  title: string;
  description?: string;
  category?: Category;
  date: string;
  points?: number;
}

interface UpdateTaskDto {
  title?: string;
  description?: string;
  category?: Category;
  date?: string;
  points?: number;
  isCompleted?: boolean;
}

interface TaskQueryParams {
  date?: string;
  startDate?: string;
  endDate?: string;
  completed?: boolean;
  category?: Category;
}

export const tasksApi = {
  getAll: async (params?: TaskQueryParams): Promise<Task[]> => {
    const { data } = await apiClient.get<Task[]>('/tasks', { params });
    return data;
  },

  getOne: async (id: string): Promise<Task> => {
    const { data } = await apiClient.get<Task>(`/tasks/${id}`);
    return data;
  },

  create: async (dto: CreateTaskDto): Promise<Task> => {
    const { data } = await apiClient.post<Task>('/tasks', dto);
    return data;
  },

  update: async (id: string, dto: UpdateTaskDto): Promise<TaskCompletionResponse> => {
    const { data } = await apiClient.patch<TaskCompletionResponse>(`/tasks/${id}`, dto);
    return data;
  },

  delete: async (id: string): Promise<Task> => {
    const { data } = await apiClient.delete<Task>(`/tasks/${id}`);
    return data;
  },

  complete: async (id: string): Promise<TaskCompletionResponse> => {
    const { data } = await apiClient.patch<TaskCompletionResponse>(`/tasks/${id}/complete`);
    return data;
  },

  uncomplete: async (id: string): Promise<Task> => {
    const { data } = await apiClient.patch<Task>(`/tasks/${id}/uncomplete`);
    return data;
  },
};

