/**
 * @file Типы данных для пользователя.
 * @see backend/src/modules/user/schemas.py
 */

/**
 * Публичная информация о пользователе, безопасная для отображения на клиенте.
 */
export interface UserPublic {
  username: string;
}