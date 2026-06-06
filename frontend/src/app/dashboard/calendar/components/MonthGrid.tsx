"use client";

import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  format,
  parseISO,
} from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarEvent } from "@/types/calendar";
import { Task } from "@/types/tasks";

interface MonthGridProps {
  currentDate: Date;
  events: CalendarEvent[];
  tasks: Task[];
  onDayClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function MonthGrid({
  currentDate,
  events,
  tasks,
  onDayClick,
  onEventClick,
}: MonthGridProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  function getEventsForDay(day: Date) {
    return events.filter((e) => isSameDay(parseISO(e.start_time), day));
  }

  function getTasksForDay(day: Date) {
    return tasks.filter((t) => t.due_date && isSameDay(parseISO(t.due_date), day));
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="grid grid-cols-7 border-b">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="py-2 text-center text-xs font-medium text-muted-foreground"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 flex-1 auto-rows-fr">
        {days.map((day) => {
          const dayEvents = getEventsForDay(day);
          const dayTasks = getTasksForDay(day);
          const isCurrentMonth = isSameMonth(day, currentDate);

          return (
            <div
              key={day.toISOString()}
              onClick={() => onDayClick(day)}
              className={cn(
                "border-b border-r p-1 cursor-pointer hover:bg-muted/40 transition-colors min-h-[80px]",
                !isCurrentMonth && "bg-muted/20"
              )}
            >
              <span
                className={cn(
                  "text-xs font-medium inline-flex items-center justify-center w-6 h-6 rounded-full",
                  isToday(day) && "bg-primary text-primary-foreground",
                  !isCurrentMonth && "text-muted-foreground"
                )}
              >
                {format(day, "d")}
              </span>

              <div className="mt-1 space-y-0.5">
                {dayEvents.slice(0, 2).map((event) => (
                  <div
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event);
                    }}
                    className="truncate text-xs bg-primary/15 text-primary rounded px-1 py-0.5 cursor-pointer hover:bg-primary/25"
                  >
                    {format(parseISO(event.start_time), "HH:mm")} {event.title}
                  </div>
                ))}
                {dayTasks.slice(0, 2).map((task) => (
                  <div
                    key={task.id}
                    className="truncate text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded px-1 py-0.5"
                  >
                    ● {task.title}
                  </div>
                ))}
                {dayEvents.length + dayTasks.length > 4 && (
                  <div className="text-xs text-muted-foreground px-1">
                    +{dayEvents.length + dayTasks.length - 4} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
