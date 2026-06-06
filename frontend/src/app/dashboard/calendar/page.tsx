"use client";

import { useState } from "react";
import { format, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCalendar } from "@/hooks/useCalendar";
import { CalendarEvent } from "@/types/calendar";
import { MonthGrid } from "./components/MonthGrid";
import { EventForm } from "./components/EventForm";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const { data, isLoading, createEvent, updateEvent, deleteEvent } = useCalendar(year, month);

  const events = data?.events ?? [];
  const tasks = data?.tasks ?? [];

  const handleDayClick = (date: Date) => {
    setSelectedDay(date);
    setEditingEvent(null);
    setIsFormOpen(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setEditingEvent(event);
    setSelectedDay(null);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (values: { title: string; description?: string; start_time: string; end_time: string }) => {
    const payload = {
      title: values.title,
      description: values.description ?? null,
      start_time: values.start_time,
      end_time: values.end_time,
      task_id: null,
    };

    if (editingEvent) {
      updateEvent.mutate(
        { id: editingEvent.id, data: payload },
        { onSuccess: () => setIsFormOpen(false) }
      );
    } else {
      createEvent.mutate(payload, { onSuccess: () => setIsFormOpen(false) });
    }
  };

  const handleDelete = () => {
    if (!editingEvent) return;
    deleteEvent.mutate(editingEvent.id, { onSuccess: () => setIsFormOpen(false) });
  };

  const isMutating =
    createEvent.isPending || updateEvent.isPending || deleteEvent.isPending;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] -m-8">
      <div className="flex items-center justify-between px-8 py-4 border-b flex-shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold w-40 text-center">
            {format(currentDate, "MMMM yyyy")}
          </h2>
          <Button variant="outline" size="icon" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
          Today
        </Button>
      </div>

      <div className="flex-1 min-h-0 overflow-auto px-8 pb-8 flex flex-col">
        {isLoading ? (
          <div className="flex items-center justify-center flex-1 text-muted-foreground">
            Loading...
          </div>
        ) : (
          <MonthGrid
            currentDate={currentDate}
            events={events}
            tasks={tasks}
            onDayClick={handleDayClick}
            onEventClick={handleEventClick}
          />
        )}
      </div>

      <EventForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        defaultDate={selectedDay ?? undefined}
        editingEvent={editingEvent}
        onSubmit={handleFormSubmit}
        onDelete={editingEvent ? handleDelete : undefined}
        isLoading={isMutating}
      />
    </div>
  );
}
