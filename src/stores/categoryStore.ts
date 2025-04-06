import { gql, useQuery } from '@apollo/client';
import { useEffect } from 'react';
import { create } from 'zustand';
import { GET_CATEGORIES } from '../graphql/queries';

// GraphQL query to fetch categories and their subcategories

export interface SubCategory {
  id: string;
  name: string;
  image: string;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  subCategories: SubCategory[];
}

interface CategoryState {
  categories: Category[];
  setCategories: (categories: Category[]) => void;
  subCategories: SubCategory[];
  setSubCategories: (categories: Category[]) => void;
}

export const useCategoryStore = create<CategoryState>((set) => ({
  categories: [],
  subCategories: [],

  // Function to update the list of categories
  setCategories: (categories) => set({ categories }),
  setSubCategories: (categories) => {
    const subCategoriesMap = categories.reduce<SubCategory[]>((acc, category) => {
      [...acc] = category.subCategories;
      return acc;
    }, []);
    set({ subCategories: subCategoriesMap });
  },
}));

export const useFetchCategories = () => {
  const { data, error, loading } = useQuery(GET_CATEGORIES);
  const setCategories = useCategoryStore((state) => state.setCategories);
  const setSubCategories = useCategoryStore((state) => state.setSubCategories);

  useEffect(() => {
    if (data?.categories) {
      // Update the Zustand store with the fetched categories
      setCategories(data.categories);
      setSubCategories(data.categories);
    }
  }, [data, setCategories, setSubCategories]);

  if (error) {
    console.error('Error loading categories:', error);
  }

  return { loading, error };
};