"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarEvent } from "@/types/calendar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().min(1, "End time is required"),
});

type FormValues = z.infer<typeof schema>;

interface EventFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: Date;
  editingEvent?: CalendarEvent | null;
  onSubmit: (data: FormValues) => void;
  onDelete?: () => void;
  isLoading?: boolean;
}

function toLocalDatetimeValue(iso: string) {
  const d = new Date(iso);
  return format(d, "yyyy-MM-dd'T'HH:mm");
}

function toDefaultDatetime(date: Date, offsetHours = 0) {
  const d = new Date(date);
  d.setHours(9 + offsetHours, 0, 0, 0);
  return format(d, "yyyy-MM-dd'T'HH:mm");
}

export function EventForm({
  isOpen,
  onOpenChange,
  defaultDate,
  editingEvent,
  onSubmit,
  onDelete,
  isLoading,
}: EventFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      start_time: defaultDate ? toDefaultDatetime(defaultDate) : "",
      end_time: defaultDate ? toDefaultDatetime(defaultDate, 1) : "",
    },
  });

  useEffect(() => {
    if (editingEvent) {
      form.reset({
        title: editingEvent.title,
        description: editingEvent.description ?? "",
        start_time: toLocalDatetimeValue(editingEvent.start_time),
        end_time: toLocalDatetimeValue(editingEvent.end_time),
      });
    } else {
      form.reset({
        title: "",
        description: "",
        start_time: defaultDate ? toDefaultDatetime(defaultDate) : "",
        end_time: defaultDate ? toDefaultDatetime(defaultDate, 1) : "",
      });
    }
  }, [editingEvent, defaultDate, form]);

  const handleSubmit = (values: FormValues) => {
    onSubmit({
      ...values,
      start_time: new Date(values.start_time).toISOString(),
      end_time: new Date(values.end_time).toISOString(),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingEvent ? "Edit Event" : "New Event"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Event title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Optional description" rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="gap-2">
              {editingEvent && onDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={onDelete}
                  disabled={isLoading}
                >
                  Delete
                </Button>
              )}
              <Button type="submit" disabled={isLoading}>
                {editingEvent ? "Save" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
