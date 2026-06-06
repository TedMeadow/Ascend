import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { api } from '@/lib/api';
import { CalendarEventCreate, CalendarEventUpdate } from '@/types/calendar';
import { toast } from 'sonner';

const queryKey = (year: number, month: number) => ['calendar', year, month];

function monthRange(year: number, month: number) {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  return {
    startDate: format(start, 'yyyy-MM-dd'),
    endDate: format(end, 'yyyy-MM-dd'),
  };
}

export function useCalendar(year: number, month: number) {
  const qc = useQueryClient();
  const { startDate, endDate } = monthRange(year, month);

  const query = useQuery({
    queryKey: queryKey(year, month),
    queryFn: () => api.calendar.getView(startDate, endDate),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: queryKey(year, month) });

  const createEvent = useMutation({
    mutationFn: (data: CalendarEventCreate) => api.calendar.createEvent(data),
    onSuccess: () => { toast.success('Event created'); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateEvent = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CalendarEventUpdate }) =>
      api.calendar.updateEvent(id, data),
    onSuccess: () => { toast.success('Event updated'); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteEvent = useMutation({
    mutationFn: (id: string) => api.calendar.deleteEvent(id),
    onSuccess: () => { toast.success('Event deleted'); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });

  return { ...query, createEvent, updateEvent, deleteEvent };
}
