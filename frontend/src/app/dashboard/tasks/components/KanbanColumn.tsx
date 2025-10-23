"use client";

import { useDroppable } from "@dnd-kit/core";
import { Task } from "@/types";
import { TaskCard } from "./TaskCard";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  id: string; // ID колонки (например, 'todo', 'in_progress')
  title: string;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function KanbanColumn({ id, title, tasks, onEdit, onDelete }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: id, // Уникальный ID для области сброса
  });

  return (
    <div className="flex flex-col w-full md:w-1/3 flex-shrink-0">
      <div className="p-2">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">{title} ({tasks.length})</h2>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "space-y-4 p-2 rounded-lg bg-gray-100 dark:bg-gray-900 min-h-[200px] transition-colors",
          // Подсвечиваем колонку, над которой находится перетаскиваемый элемент
          isOver && "bg-gray-200 dark:bg-gray-800"
        )}
      >
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} />
        ))}
        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-24 text-gray-400">
            No tasks in this column.
          </div>
        )}
      </div>
    </div>
  );
}