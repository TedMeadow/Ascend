/**
 * @file Типы данных для модуля "Задачи".
 * @see backend/src/modules/tasks/schemas.py
 * @see backend/src/models/task.py
 */

/**
 * Возможные статусы задачи.
 */
export enum TaskStatus {
  TODO = "todo",
  IN_PROGRESS = "in_progress",
  DONE = "done",
}

/**
 * Базовая модель задачи, включающая все поля.
 * Соответствует TaskPublic из FastAPI.
 */
export interface Task {
  id: string; // UUID
  title: string;
  description: string | null;
  status: TaskStatus;
  due_date: string | null; // Дата приходит в формате ISO строки
}

/**
 * Данные для создания новой задачи.
 */
export interface TaskCreate {
  title: string;
  description?: string | null;
  status?: TaskStatus;
  due_date?: string | null;
}

/**
 * Данные для обновления существующей задачи. Все поля опциональны.
 */
export interface TaskUpdate {
  title?: string;
  description?: string;
  status?: TaskStatus;
  due_date?: string | null;
}