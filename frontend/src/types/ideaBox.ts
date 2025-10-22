/**
 * @file Типы данных для модуля "Коробка идей".
 * @see backend/src/modules/idea_box/
 */

// --- Типы для Тегов ---

/**
 * Базовая модель тега.
 */
interface TagBase {
  name: string;
}

/**
 * Публичная модель тега, включая ID.
 */
export interface Tag extends TagBase {
  id: string; // UUID
}

/**
 * Модель тега для обновления (переименования).
 */
export type TagUpdate = TagBase;

/**
 * Расширенная модель тега со счетчиком идей.
 */
export interface TagWithCount extends Tag {
  idea_count: number;
}


// --- Типы для Папок ---

/**
 * Базовая модель папки для идей.
 */
interface FolderBase {
  name: string;
  icon: string | null;
}

/**
 * Публичная модель папки, включая ID.
 */
export interface IdeaFolder extends FolderBase {
  id: string; // UUID
}

/**
 * Модель для создания новой папки.
 */
export type FolderCreate = FolderBase;

/**
 * Модель для обновления папки.
 */
export type FolderUpdate = FolderBase;


// --- Типы для Идей ---

/**
 * Тип идеи.
 */
export enum IdeaType {
  TEXT = "text",
  LINK = "link",
  IMAGE = "image",
}

/**
 * Метаданные для превью ссылки.
 */
export interface LinkMetadata {
  url: string;
  title: string | null;
  description: string | null;
  image_url: string | null;
}

/**
 * Базовая модель идеи.
 */
interface IdeaBase {
  title: string | null;
  content: string | null;
  url: string | null;
}

/**
 * Полная публичная модель идеи.
 * Соответствует IdeaPublic из FastAPI.
 */
export interface Idea extends IdeaBase {
  id: string; // UUID
  owner_id: string; // UUID
  folder_id: string; // UUID
  idea_type: IdeaType;
  is_pinned: boolean;
  created_at: string; // Дата в формате ISO строки
  updated_at: string; // Дата в формате ISO строки
  tags: Tag[];
  link_metadata: LinkMetadata | null;
}

/**
 * Данные для создания новой идеи.
 */
export interface IdeaCreate {
  folder_id: string; // UUID
  idea_type?: IdeaType;
  title?: string | null;
  content?: string | null;
  url?: string | null;
  tags?: string[]; // При создании отправляем массив строк
}

/**
 * Данные для обновления идеи. Все поля опциональны.
 */
export interface IdeaUpdate {
  title?: string | null;
  content?: string | null;
  url?: string | null;
  is_pinned?: boolean;
  folder_id?: string; // UUID
  tags?: string[]; // При обновлении также отправляем массив строк
}

/**

 * Данные для "продвижения" идеи в задачу.
 */
export interface IdeaPromoteToTask {
  task_title: string;
  task_description?: string | null;
}