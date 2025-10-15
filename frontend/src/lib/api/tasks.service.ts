import { http } from './_base';
import { Task, TaskCreate, TaskUpdate } from '@/types';

export const tasksService = {
  getAll: (): Promise<Task[]> => {
    return http.request<Task[]>('/tasks/');
  },

  create: (data: TaskCreate): Promise<Task> => {
    return http.request<Task>('/tasks/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: (taskId: string, data: TaskUpdate): Promise<Task> => {
    return http.request<Task>(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: (taskId: string): Promise<void> => {
    return http.request<void>(`/tasks/${taskId}`, {
      method: 'DELETE',
    });
  },
};