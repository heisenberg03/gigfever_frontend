// src/stores/portfolioStore.ts
import { create } from 'zustand';

interface PortfolioState {
  portfolio: Array<{
    id: string;
    userId: string;
    mediaType: string;
    mediaUrl: string;
    thumbnail: string;
  }>;
  setPortfolio: (portfolio: PortfolioState['portfolio']) => void;
  addMedia: (media: PortfolioState['portfolio'][0]) => void;
  removeMedia: (mediaId: string) => void;
}

export const usePortfolioStore = create<PortfolioState>((set) => ({
  portfolio: [],
  setPortfolio: (portfolio) => set({ portfolio }),
  addMedia: (media) => set((state) => ({ portfolio: [...state.portfolio, media] })),
  removeMedia: (mediaId) => set((state) => ({ portfolio: state.portfolio.filter((item) => item.id !== mediaId) })),
}));