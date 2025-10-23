"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useTasks } from "@/hooks/useTasks";
import { TaskStatus } from "@/types";
import { CheckCircle2, ListTodo, Loader2 } from "lucide-react";

export function TasksSummaryWidget() {
  const { tasks, isLoading } = useTasks();

  if (isLoading) {
    return (
      <Card className="h-full flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </Card>
    );
  }

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.status === TaskStatus.DONE).length;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Tasks Overview</CardTitle>
        <CardDescription>Your progress at a glance.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4 text-center">
        <div className="flex flex-col items-center justify-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <ListTodo className="h-8 w-8 text-blue-500 mb-2" />
          <p className="text-2xl font-bold">{totalTasks}</p>
          <p className="text-sm text-muted-foreground">Total Tasks</p>
        </div>
        <div className="flex flex-col items-center justify-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <CheckCircle2 className="h-8 w-8 text-green-500 mb-2" />
          <p className="text-2xl font-bold">{doneTasks}</p>
          <p className="text-sm text-muted-foreground">Completed</p>
        </div>
      </CardContent>
    </Card>
  );
}