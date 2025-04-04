// src/stores/bookingStore.ts
import { create } from 'zustand';

export interface Location {
  address: string;
  lat: number;
  lng: number;
}

export interface Budget {
  min: number;
  max: number;
}

export interface Host {
  id: string;
  fullName: string;
  profilePicture?: string;
  rating?: number; // Added from server.js
  pastEventsCount?: number;
  reviewsCount?: number;
}

export interface Event {
  id: string;
  title: string;
  banner?: string;
  dateTime?: string;
  location?: Location;
  host?: Host;
  type?: string;
  budget?: Budget;
  status: string; // Ensure this is required as per UI usage
}

export interface Booking {
  id: string;
  userId: string;
  event: Event;
  status: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

interface BookingStore {
  bookings: Booking[];
  setBookings: (bookings: Booking[]) => void;
  addBooking: (booking: Booking) => void;
  removeBooking: (bookingId: string) => void;
  updateBooking: (bookingId: string, updates: Partial<Booking>) => void;
}

export const useBookingStore = create<BookingStore>((set) => ({
  bookings: [],
  setBookings: (bookings) => set({ bookings }),
  addBooking: (booking) => set((state) => ({
    bookings: [...state.bookings, booking],
  })),
  removeBooking: (bookingId) => set((state) => ({
    bookings: state.bookings.filter((b) => b.id !== bookingId),
  })),
  updateBooking: (bookingId, updates) => set((state) => ({
    bookings: state.bookings.map((b) =>
      b.id === bookingId ? { ...b, ...updates } : b
    ),
  })),
}));