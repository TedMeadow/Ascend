import { authService } from './auth.service';
import { tasksService } from './tasks.service';
import { ideaBoxFoldersService, ideaBoxIdeasService, ideaBoxTagsService } from './ideaBox.service';
import { calendarService } from './calendar.service';
import { financeService } from './finance.service';


export const api = {
  auth: authService,
  tasks: tasksService,
  calendar: calendarService,
  ideaBox: {
    folders: ideaBoxFoldersService,
    ideas: ideaBoxIdeasService,
    tags: ideaBoxTagsService,
  },
  finance: financeService,
};