"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Task, TaskPriority } from "@/types";
import { Calendar, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { GripVertical } from "lucide-react"; // Импортируем иконку для "хвата"

const priorityStyles = {
  [TaskPriority.HIGH]: "bg-red-500 hover:bg-red-500 text-white",
  [TaskPriority.MEDIUM]: "bg-yellow-500 hover:bg-yellow-500 text-white",
  [TaskPriority.LOW]: "bg-green-500 hover:bg-green-500 text-white",
};

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    // Добавляем эффект "исчезания" для оригинальной карточки во время перетаскивания
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style} {...attributes} className="touch-none flex flex-col">
      <CardHeader {...listeners} className="cursor-grab">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{task.title}</CardTitle>
          <Badge className={priorityStyles[task.priority]}>{task.priority}</Badge>
        </div>
        {task.due_date && (
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 pt-1">
            <Calendar className="mr-1 h-3 w-3" />
            <span>Due on {format(new Date(task.due_date), "MMM d, yyyy")}</span>
          </div>
        )}
      </CardHeader>
      {task.description && (
        <CardContent className="flex-1">
          <p className="text-sm text-gray-500 dark:text-gray-400 break-words">{task.description}</p>
        </CardContent>
      )}
      <CardFooter className="mt-auto pt-4 flex justify-end gap-2">
        <Button variant="ghost" size="icon" onClick={() => onEdit(task) } >
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onDelete(task.id)} >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </CardFooter>
    </Card>
  );
}