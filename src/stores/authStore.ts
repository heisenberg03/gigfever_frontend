// src/stores/authStore.ts
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { client } from '../../App';
import { LOGOUT } from '../graphql/mutations';

export interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  phone: string;
  email?: string;
  profilePicture?: string;
  location?: string;
  bio?: string;
  isArtist: boolean;
  artistType?: string;
  budget?: number;
  artistRating?: number;
  artistReviewCount?: number;
  hostRating?: number;
  hostReviewCount?: number;
  youtubeId?: string;
  youtubeDisplay?: boolean;
  instagramUsername?: string;
  instagramDisplay?: boolean;
  facebookId?: string;
  facebookDisplay?: boolean;
  xUsername?: string;
  xDisplay?: boolean;
}

interface AuthStore {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  currentUser: UserProfile | null;
  authenticate: (user: UserProfile, accessToken: string, refreshToken: string) => Promise<void>;
  setToken: (accessToken: string) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  toggleArtistMode: (on: boolean) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  isAuthenticated: false,
  accessToken: null,
  refreshToken: null,
  currentUser: null,

  authenticate: async (user, accessToken, refreshToken) => {
    try {
      await AsyncStorage.setItem('accessToken', accessToken);
      await AsyncStorage.setItem('refreshToken', refreshToken);
      set({
        currentUser: user,
        accessToken,
        refreshToken,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error('Failed to store tokens:', error);
    }
  },

  setToken: (accessToken) => {
    // Update the access token in the store and AsyncStorage
    set((state) => ({
      accessToken,
      isAuthenticated: !!accessToken && !!state.refreshToken, // Ensure both tokens exist for auth
    }));
    AsyncStorage.setItem('accessToken', accessToken).catch((error) => {
      console.error('Failed to update access token in storage:', error);
    });
  },

  updateProfile: (updates) =>
    set((state) => ({
      currentUser: state.currentUser ? { ...state.currentUser, ...updates } : null,
    })),

  toggleArtistMode: (on) =>
    set((state) => ({
      currentUser: state.currentUser ? { ...state.currentUser, isArtist: on } : null,
    })),

  logout: async () => {
    try {
      await client.mutate({ mutation: LOGOUT });
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');
      set({
        isAuthenticated: false,
        accessToken: null,
        refreshToken: null,
        currentUser: null,
      });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  },
}));