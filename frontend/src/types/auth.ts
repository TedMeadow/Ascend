/**
 * @file Типы данных для аутентификации.
 * @see backend/src/modules/auth/schemas.py
 */

/**
 * Описывает JWT токен, который возвращается после успешного входа.
 */
export interface Token {
  access_token: string;
  token_type: string;
}

/**
 * Данные для создания нового пользователя.
 */
export interface UserCreate {
  email: string;
  username: string;
  password: string;
}

/**
 * Информация о доступном OAuth провайдере.
 */
export interface ProviderInfo {
  name: string;
}