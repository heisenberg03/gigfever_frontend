// src/stores/bookingStore.ts
import { create } from 'zustand';

interface BookingState {
  bookings: Array<{
    id: string;
    userId: string;
    event: { id: string; title: string };
    status: string;
    date: string;
  }>;
  setBookings: (bookings: BookingState['bookings']) => void;
  addBooking: (booking: BookingState['bookings'][0]) => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  bookings: [],
  setBookings: (bookings) => set({ bookings }),
  addBooking: (booking) => set((state) => ({ bookings: [...state.bookings, booking] })),
}));