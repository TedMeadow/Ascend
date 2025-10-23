"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Idea, IdeaType, IdeaCreate, IdeaUpdate } from "@/types";

// ✅ ИЗМЕНЕНИЕ 1: Максимально простая схема. `tags` - это просто строка.
const formSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  url: z.url("Please enter a valid URL").optional().or(z.literal('')),
  idea_type: z.enum(IdeaType),
  tags: z.string().optional(), // Просто строка
}).superRefine((data, ctx) => {
  if (data.idea_type === IdeaType.TEXT && !data.title) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Title is required for text ideas", path: ["title"] });
  }
  if (data.idea_type === IdeaType.LINK && !data.url) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "URL is required for link ideas", path: ["url"] });
  }
});

// Тип для внутреннего состояния формы
type FormValues = z.infer<typeof formSchema>;

interface IdeaFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (data: IdeaCreate | IdeaUpdate) => void;
  idea?: Idea | null;
}

export function IdeaForm({ isOpen, onOpenChange, onSubmit, idea }: IdeaFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        title: idea?.title || "",
        content: idea?.content || "",
        url: idea?.url || "",
        idea_type: idea?.idea_type || IdeaType.TEXT,
        // ✅ ИЗМЕНЕНИЕ 2: Преобразуем массив в строку для формы
        tags: idea?.tags?.map(t => t.name).join(', ') || "",
      });
    }
  }, [idea, isOpen, form]);

  const ideaType = form.watch("idea_type");

  // ✅ ИЗМЕНЕНИЕ 3: Функция-обертка для преобразования данных перед отправкой
  const handleFormSubmit = (values: FormValues) => {
    const apiPayload = {
      ...values,
      // Преобразуем строку тегов обратно в массив для API
      tags: values.tags?.split(',').map(tag => tag.trim()).filter(Boolean) || [],
    };
    onSubmit(apiPayload);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{idea ? "Edit Idea" : "Create New Idea"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          {/* Вызываем нашу новую функцию-обертку */}
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
            
            {/* ... (FormField для idea_type без изменений) ... */}
            <FormField name="idea_type" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value={IdeaType.TEXT}>Text</SelectItem>
                    <SelectItem value={IdeaType.LINK}>Link</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )} />

            {ideaType === IdeaType.LINK ? (
              <FormField name="url" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl><Input placeholder="https://example.com" {...field} value={field.value ?? ''}/></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            ) : (
              <>
                <FormField name="title" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl><Input placeholder="A brilliant idea..." {...field} value={field.value ?? ''}/></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField name="content" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl><Textarea placeholder="More details about the idea..." {...field} value={field.value ?? ''}/></FormControl>
                  </FormItem>
                )} />
              </>
            )}

            {/* ✅ ИЗМЕНЕНИЕ 4: Поле tags теперь - это обычный Input, работающий со строкой */}
            <FormField name="tags" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags (comma-separated)</FormLabel>
                  <FormControl><Input placeholder="productivity, project, inspiration" {...field} value={field.value ?? ''} /></FormControl>
                </FormItem>
              )} />

            <DialogFooter>
              <Button type="submit">Save Idea</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}