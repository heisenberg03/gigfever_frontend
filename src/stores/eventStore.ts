// src/stores/eventStore.ts
import { create } from 'zustand';

interface EventState {
  events: Array<{
    id: string;
    title: string;
    category: string;
    date: string;
    location: string;
    status: string;
    host: { id: string; displayName: string };
    isDraft: boolean;
  }>;
  setEvents: (events: EventState['events']) => void;
  updateEvent: (eventId: string, updates: Partial<EventState['events'][0]>) => void;
}

export const useEventStore = create<EventState>((set) => ({
  events: [],
  setEvents: (events) => set({ events }),
  updateEvent: (eventId, updates) =>
    set((state) => ({
      events: state.events.map((event) =>
        event.id === eventId ? { ...event, ...updates } : event
      ),
    })),
}));