import { authService } from './auth.service';
import { tasksService } from './tasks.service';
import { ideaBoxFoldersService, ideaBoxIdeasService, ideaBoxTagsService } from './ideaBox.service';


export const api = {
  auth: authService,
  tasks: tasksService,
  ideaBox: { // <-- Создали неймспейс для модуля
    folders: ideaBoxFoldersService,
    ideas: ideaBoxIdeasService, // <-- Добавили
    tags: ideaBoxTagsService, // <-- Добавили
  },
};