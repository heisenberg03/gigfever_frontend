// src/store/authStore.ts
import { create } from 'zustand';

export interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  source: 'instagram' | 'youtube' | 'facebook';
}

export interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  phone: string;
  budget?: number;
  email?: string;
  location?: string;
  profilePicture?: string;
  bio?: string;
  isArtist: boolean;
  category: string | null;
  subcategories: string[];
  artistRating?: number;
  artistReviewCount?: number;
  hostRating?: number;
  hostReviewCount?: number;
}

interface AuthStore {
  isAuthenticated: boolean;
  token: string | null;
  currentUser: UserProfile | null;

  authenticate: (user: UserProfile, token: string) => void;
  setToken: (token: string | null) => void;
  setUser: (user: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  toggleArtistMode: (on: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  isAuthenticated: false,
  token: null,
  currentUser: null,

  authenticate: (user:UserProfile, token: any) => set(() => ({
    currentUser: user,
    token: token,
    isAuthenticated: true
  })),
  setToken: (token) => set(() => ({ token, isAuthenticated: !!token })),

  setUser: (user) => set(() => ({ currentUser: user, isAuthenticated: !!user })),

  updateProfile: (updates) =>
    set((state) => ({
      currentUser: state.currentUser
        ? { ...state.currentUser, ...updates }
        : null,
    })),

  toggleArtistMode: (on) =>
    set((state) => ({
      currentUser: state.currentUser
        ? { ...state.currentUser, isArtist: on }
        : null,
    })),

  logout: () => set(() => ({
    isAuthenticated: false,
    token: null,
    currentUser: null,
  })),
}));