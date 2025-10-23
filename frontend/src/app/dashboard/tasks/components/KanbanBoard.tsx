import { useMemo } from "react";
import { Task, TaskStatus } from "@/types";
import { KanbanColumn } from "./KanbanColumn";

interface KanbanBoardProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function KanbanBoard({ tasks, onEdit, onDelete }: KanbanBoardProps) {
  const columns = useMemo(() => {
    return {
      [TaskStatus.TODO]: tasks.filter(t => t.status === TaskStatus.TODO),
      [TaskStatus.IN_PROGRESS]: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS),
      [TaskStatus.DONE]: tasks.filter(t => t.status === TaskStatus.DONE),
    }
  }, [tasks]);

  return (
    <div className="flex flex-col md:flex-row gap-6 w-full">
      <KanbanColumn id={TaskStatus.TODO} title="To Do" tasks={columns.todo} onEdit={onEdit} onDelete={onDelete} />
      <KanbanColumn id={TaskStatus.IN_PROGRESS} title="In Progress" tasks={columns.in_progress} onEdit={onEdit} onDelete={onDelete} />
      <KanbanColumn id={TaskStatus.DONE} title="Done" tasks={columns.done} onEdit={onEdit} onDelete={onDelete} />
    </div>
  );
}