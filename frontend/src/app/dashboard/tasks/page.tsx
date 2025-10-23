"use client";

import { useState } from 'react';
import { 
  DndContext, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent
} from '@dnd-kit/core';
import { useTasks } from '@/hooks/useTasks';
import { Button } from '@/components/ui/button';
import { KanbanBoard } from './components/KanbanBoard';
import { TaskForm } from './components/TaskForm';
import { TaskCard } from './components/TaskCard';
import { Task, TaskCreate, TaskUpdate, TaskStatus } from '@/types';
import { PlusCircle } from 'lucide-react';

export default function TasksPage() {
  const { tasks, isLoading, error, createTask, updateTask, deleteTask, setTasks } = useTasks();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveTask(event.active.data.current?.task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const activeTask = tasks.find(t => t.id === active.id);
    const newStatus = over.id as TaskStatus;

    if (activeTask && activeTask.status !== newStatus) {
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === active.id ? { ...task, status: newStatus } : task
        )
      );

      // Отправляем запрос на сервер "в фоне"
      updateTask({ taskId: activeTask.id, data: { status: newStatus } });
    }
  };

  const handleOpenCreateForm = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleSubmit = (data: TaskCreate | TaskUpdate) => {
    if (editingTask) {
      updateTask({ taskId: editingTask.id, data }); 
    } else {
      createTask(data as TaskCreate);
    }
  };

  if (isLoading) return <div>Loading tasks...</div>;
  if (error) return <div className="text-red-500">Error: {error.message}</div>;

  return (
    <DndContext 
      sensors={sensors} 
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Task Board</h1>
            <p className="text-gray-500 dark:text-gray-400">Visualize your workflow.</p>
          </div>
          <Button onClick={handleOpenCreateForm}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Task
          </Button>
        </div>
        
        <KanbanBoard tasks={tasks} onEdit={handleOpenEditForm} onDelete={deleteTask} />

        <DragOverlay>
          {activeTask ? (
            <TaskCard 
              task={activeTask} 
              onEdit={() => {}} 
              onDelete={() => {}} 
            />
          ) : null}
        </DragOverlay>

        <TaskForm
          isOpen={isFormOpen}
          onOpenChange={setIsFormOpen}
          onSubmit={handleSubmit}
          task={editingTask}
        />
      </div>
    </DndContext>
  );
}
