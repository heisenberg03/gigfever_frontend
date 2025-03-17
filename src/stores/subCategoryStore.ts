import { create } from 'zustand';
import { GET_SUB_CATEGORIES } from '../graphql/queries';
import { useQuery } from '@apollo/client';
import React from 'react';

interface SubCategoryState {
  subCategories: string[];
  setSubCategories: (subCategories: string[]) => void;
}

export const useSubCategoryStore = create<SubCategoryState>((set) => ({
  subCategories: [],
  setSubCategories: (subCategories) => set({ subCategories }),
}));

export const useFetchSubCategories = () => {
  const { data } = useQuery(GET_SUB_CATEGORIES, { fetchPolicy: 'cache-first' });
  const setSubCategories = useSubCategoryStore((state) => state.setSubCategories);

  React.useEffect(() => {
    if (data) {
      setSubCategories(data.subCategories.map((s: { name: string }) => s.name));
    }
  }, [data, setSubCategories]);
};