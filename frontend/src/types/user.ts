/**
 * @file Типы данных для пользователя.
 * @see backend/src/modules/user/schemas.py
 */

/**
 * Публичная информация о пользователе, безопасная для отображения на клиенте.
 */
import { Layout } from "react-grid-layout";

export interface UserPublic {
  username: string;
  email: string;
  dashboard_layout: Layout[] | null;
}