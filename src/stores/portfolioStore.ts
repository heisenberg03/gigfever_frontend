// src/stores/portfolioStore.ts
import { create } from 'zustand';

interface PortfolioItem {
  id: string;
  userId: string;
  mediaType: 'IMAGE' | 'VIDEO';
  mediaUrl: string;
  thumbnail: string;
  source?: 'youtube' | 'instagram' | 'facebook' | 'x';
}

interface PortfolioState {
  portfolio: PortfolioItem[];
  setPortfolio: (portfolio: PortfolioItem[]) => void;
  addMedia: (media: PortfolioItem) => void;
  removeMedia: (mediaId: string) => void;
}

export const usePortfolioStore = create<PortfolioState>((set) => ({
  portfolio: [],
  setPortfolio: (portfolio) => set({ portfolio }),
  addMedia: (media) => set((state) => ({ portfolio: [...state.portfolio, media] })),
  removeMedia: (mediaId) => set((state) => ({ portfolio: state.portfolio.filter((item) => item.id !== mediaId) })),
}));