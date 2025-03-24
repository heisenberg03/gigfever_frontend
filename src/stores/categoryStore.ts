import { gql, useQuery } from '@apollo/client';
import { useEffect } from 'react';
import { create } from 'zustand';

// GraphQL query to fetch categories and their subcategories
const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      name
      subCategories {
        id
        name
      }
    }
  }
`;

interface SubCategory {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  subCategories: SubCategory[];
}

interface CategoryState {
  categories: Category[]; // List of categories with subcategories
  setCategories: (categories: Category[]) => void; // Function to update categories
  subCategories: SubCategory[];
  setSubCategories: (subCategories: SubCategory[]) => void;
}

export const useCategoryStore = create<CategoryState>((set) => ({
  categories: [],
  subCategories: [],

  // Function to update the list of categories
  setCategories: (categories) => set({ categories }),
  setSubCategories: (subCategories) => set({ subCategories }),
}));

export const useFetchCategories = () => {
  const { data, error, loading } = useQuery(GET_CATEGORIES);
  const setCategories = useCategoryStore((state) => state.setCategories);
  const setSubCategories = useCategoryStore((state) => state.setSubCategories);

  useEffect(() => {
    if (data?.categories) {
      // Update the Zustand store with the fetched categories
      setCategories(data.categories);
      setSubCategories(data.categories.flatMap((category:Category) => category.subCategories));
    }
  }, [data, setCategories]);

  if (error) {
    console.error('Error loading categories:', error);
  }

  return { loading, error };
};