import { ClockWidget } from "./ClockWidget";
import { TasksSummaryWidget } from "./TasksSummaryWidget";

export const WIDGETS = {
  'clock': {
    name: 'Clock',
    component: ClockWidget,
    defaultLayout: { w: 4, h: 2, minW: 3, minH: 2 },
  },
  'tasks-summary': {
    name: 'Tasks Summary',
    component: TasksSummaryWidget,
    defaultLayout: { w: 4, h: 2, minW: 3, minH: 2 },
  },
} as const;

export type WidgetId = keyof typeof WIDGETS;