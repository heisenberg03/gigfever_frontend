import { create } from 'zustand';
import { GET_CATEGORIES } from '../graphql/queries';
import { useQuery } from '@apollo/client';
import React from 'react';

interface CategoryState {
  categories: string[];
  setCategories: (categories: string[]) => void;
}

export const useCategoryStore = create<CategoryState>((set) => ({
  categories: [],
  setCategories: (categories) => set({ categories }),
}));

export const useFetchCategories = () => {
  const { data, error } = useQuery(GET_CATEGORIES, { fetchPolicy: 'cache-first' });
  console.log(error)
  const setCategories = useCategoryStore((state) => state.setCategories);

  React.useEffect(() => {
    if (data) {
      setCategories(data.categories.map((c: { name: string }) => c.name));
    }
  }, [data, setCategories]);
};