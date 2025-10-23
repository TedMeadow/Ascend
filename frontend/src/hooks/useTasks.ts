"use client";

import { useCallback, useEffect, useState } from 'react';
import { toast } from "sonner";
import { api } from '@/lib/api';
import { Task, TaskCreate, TaskUpdate } from '@/types';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await api.tasks.getAll();
      setTasks(data);
      setError(null);
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);
  
  const createTask = async (taskData: TaskCreate) => {
    const promise = api.tasks.create(taskData).then(newTask => {
      setTasks(prevTasks => [...prevTasks, newTask]);
    });

    toast.promise(promise, {
      loading: 'Creating task...',
      success: 'Task created successfully!',
      error: 'Failed to create task.',
    });
  };

  const updateTask = async ({ taskId, data }: { taskId: string, data: TaskUpdate }) => {
    // 1. Сохраняем текущее состояние на случай ошибки
    const previousTasks = tasks;

    // 2. Оптимистично обновляем UI немедленно
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, ...data } : task
      )
    );

    // 3. Отправляем запрос на сервер
    try {
      await api.tasks.update(taskId, data);
      // Если все успешно, показываем success toast
      toast.success("Task updated successfully!");
    } catch (err) {
      // 4. В случае ошибки, "откатываем" UI к предыдущему состоянию
      setTasks(previousTasks);
      // И показываем ошибку
      toast.error("Failed to update task.");
    }
  };

  const deleteTask = async (taskId: string) => {
    const previousTasks = tasks;
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));

    try {
      await api.tasks.delete(taskId);
      toast.success("Task deleted successfully!");
    } catch (error) {
      setTasks(previousTasks);
      toast.error("Failed to delete task.");
    }
  };
  
  return { tasks, isLoading, error, refetch: fetchTasks, createTask, updateTask, deleteTask, setTasks };
};