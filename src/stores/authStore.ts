
    import { create } from 'zustand';
    
    interface User {
      id: string;
      phoneNumber: string;
      username: string;
      fullName: string;
      displayName: string;
      isArtist: boolean;
      bio?: string;
      portfolio?: { type: string; url: string }[];
      socialLinks?: { [key: string]: string };
      categories?: string[];
      subCategories?: string[];
      avgRating?: number;
    }
    
    interface AuthState {
      user: User | null;
      setUser: (user: User) => void;
      updateUser: (updates: Partial<User>) => void;
      logout: () => void;
    }
    
    export const useAuthStore = create<AuthState>((set) => ({
      user: null,
      setUser: (user) => set({ user }),
      updateUser: (updates) => set((state) => ({ user: state.user ? { ...state.user, ...updates } : null })),
      logout: () => set({ user: null }),
    }));