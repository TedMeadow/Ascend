import { http } from './_base';
import { CalendarEvent, CalendarEventCreate, CalendarEventUpdate, CalendarViewResponse } from '@/types/calendar';

export const calendarService = {
  getView: (startDate: string, endDate: string): Promise<CalendarViewResponse> => {
    return http.request<CalendarViewResponse>(`/calendar/?start_date=${startDate}&end_date=${endDate}`);
  },

  createEvent: (data: CalendarEventCreate): Promise<CalendarEvent> => {
    return http.request<CalendarEvent>('/calendar/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateEvent: (eventId: string, data: CalendarEventUpdate): Promise<CalendarEvent> => {
    return http.request<CalendarEvent>(`/calendar/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteEvent: (eventId: string): Promise<void> => {
    return http.request<void>(`/calendar/events/${eventId}`, {
      method: 'DELETE',
    });
  },
};
