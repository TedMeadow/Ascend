"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useEffect } from "react"; // <-- ИСПРАВЛЕНИЕ: Добавлен импорт

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Task, TaskPriority, TaskStatus, TaskCreate, TaskUpdate } from "@/types";
import { cn } from "@/lib/utils";


// Схема валидации формы с помощью Zod
const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum(TaskStatus),
  priority: z.enum(TaskPriority),
  due_date: z.date().optional().nullable(),
});

type FormData = z.infer<typeof formSchema>;

interface TaskFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (data: TaskCreate | TaskUpdate) => void;
  task?: Task | null; // Если передаем задачу, форма будет в режиме редактирования
}

export function TaskForm({ isOpen, onOpenChange, onSubmit, task }: TaskFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: task?.title || "",
      description: task?.description || "",
      status: task?.status || TaskStatus.TODO,
      priority: task?.priority || TaskPriority.MEDIUM,
      due_date: task?.due_date ? new Date(task.due_date) : null,
    },
  });

  // Сбрасываем форму при изменении задачи (например, при открытии модалки для другой задачи)
  useEffect(() => {
    if (isOpen) {
      form.reset({
        title: task?.title || "",
        description: task?.description || "",
        status: task?.status || TaskStatus.TODO,
        priority: task?.priority || TaskPriority.MEDIUM,
        due_date: task?.due_date ? new Date(task.due_date) : null,
      });
    }
  }, [task, isOpen, form]);

  const handleFormSubmit = (formData: FormData) => {
    // formData здесь содержит due_date как Date | null | undefined
    
    // Преобразуем дату в ISO строку, если она есть
    const apiPayload = {
      ...formData,
      due_date: formData.due_date ? formData.due_date.toISOString() : null,
    };
    
    // Вызываем родительский onSubmit с уже преобразованными данными
    onSubmit(apiPayload); 
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Create Task"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            <FormField name="title" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl><Input placeholder="E.g. Finish the project report" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormField name="description" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl><Textarea placeholder="Add more details..." {...field} value={field.value ?? ''} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField name="status" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value={TaskStatus.TODO}>To Do</SelectItem>
                      <SelectItem value={TaskStatus.IN_PROGRESS}>In Progress</SelectItem>
                      <SelectItem value={TaskStatus.DONE}>Done</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
              
              <FormField name="priority" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value={TaskPriority.LOW}>Low</SelectItem>
                      <SelectItem value={TaskPriority.MEDIUM}>Medium</SelectItem>
                      <SelectItem value={TaskPriority.HIGH}>High</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
            </div>

            <FormField name="due_date" control={form.control} render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Due Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value || undefined} onSelect={field.onChange} autoFocus /> 
                  </PopoverContent>
                </Popover>
              </FormItem>
            )} />

            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}