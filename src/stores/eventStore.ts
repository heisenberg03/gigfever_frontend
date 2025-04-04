// src/stores/eventStore.ts
import { create } from 'zustand';
import {Location} from '../types';

interface EventState {
  events: Array<{
    id: string;
    title: string;
    category: string;
    dateTime: string;
    location: Location;
    status: string;
    host: { id: string; displayName: string };
    isDraft: boolean;
    applicationsCount: number;
    createdAt: string;
    updatedAt: string;
    type?: string;
    budget?: { min: number; max: number };
    banner?: string;
    confirmedArtist?: {
      fullName: string;
      profilePicture?: string;
    };
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