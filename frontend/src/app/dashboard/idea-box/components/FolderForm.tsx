"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { IdeaFolder, FolderCreate } from "@/types";

// ✅ ИЗМЕНЕНИЕ 1: Максимально простая схема, описывающая то, что приходит из формы.
// Zod здесь используется ТОЛЬКО для валидации, не для трансформации.
const formSchema = z.object({
  name: z.string().min(1, "Folder name is required"),
  icon: z.string().optional(), // Поле может быть string или undefined
});

// Тип для внутреннего состояния формы
type FormValues = z.infer<typeof formSchema>;

interface FolderFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  // onSubmit ожидает данные, готовые для API
  onSubmit: (data: FolderCreate) => void; 
  folder?: IdeaFolder | null;
}

export function FolderForm({ isOpen, onOpenChange, onSubmit, folder }: FolderFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: folder?.name || "",
      icon: folder?.icon || "", // По умолчанию пустая строка, а не null
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        name: folder?.name || "",
        icon: folder?.icon || "",
      });
    }
  }, [folder, isOpen, form]);

  // ✅ ИЗМЕНЕНИЕ 2: Создаем обертку, которая преобразует данные
  const handleFormSubmit = (values: FormValues) => {
    const apiPayload: FolderCreate = {
      name: values.name,
      // Преобразуем пустую строку или undefined в null для API
      icon: values.icon || null, 
    };
    onSubmit(apiPayload);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{folder ? "Edit Folder" : "Create New Folder"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          {/* Вызываем нашу функцию-обертку */}
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
            <FormField name="name" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl><Input placeholder="E.g. Project Phoenix" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField name="icon" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Icon (e.g. 🚀)</FormLabel>
                {/* Input value не может быть null/undefined, поэтому `?? ''` остается */}
                <FormControl><Input placeholder="Enter an emoji or icon name" {...field} value={field.value ?? ''} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <DialogFooter>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}