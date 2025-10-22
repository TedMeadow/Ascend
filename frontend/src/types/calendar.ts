/**
 * @file Типы данных для модуля "Календарь".
 * @see backend/src/modules/calendar/schemas.py
 */
import { Task } from "./tasks";

/**
 * Базовая модель события в календаре.
 */
interface CalendarEventBase {
  title: string;
  description: string | null;
  start_time: string; // Дата в формате ISO строки
  end_time: string;   // Дата в формате ISO строки
  task_id: string | null; // UUID
}

/**
 * Полная модель события в календаре, включая ID.
 * Соответствует CalendarEventPublic из FastAPI.
 */
export interface CalendarEvent extends CalendarEventBase {
  id: string; // UUID
}

/**
 * Данные для создания нового события.
 */
export type CalendarEventCreate = CalendarEventBase;

/**
 * Данные для обновления события. Все поля опциональны.
 */
export interface CalendarEventUpdate {
  title?: string;
  description?: string | null;
  start_time?: string;
  end_time?: string;
  task_id?: string | null;
}

/**
 * Структура ответа для "вида" календаря, включающая события и задачи.
 */
export interface CalendarViewResponse {
  events: CalendarEvent[];
  tasks: Task[];
}