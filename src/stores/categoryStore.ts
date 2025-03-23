import { gql, useQuery } from '@apollo/client';
import { useEffect } from 'react';
import { create } from 'zustand';

// Initial data for categories and subcategories
const initialCategories = ['Music', 'Art', 'Food', 'Technology'];
const initialSubCategories = {
  Music: ['Live Band', 'DJ', 'Solo Artist'],
  Art: ['Painting', 'Sculpture', 'Photography'],
  Food: ['Catering', 'Food Truck', 'Chef'],
  Technology: ['Workshop', 'Seminar', 'Hackathon'],
};
const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      name
    }
  }
`;

const GET_SUB_CATEGORIES = gql`
  query GetSubCategories {
    subCategories {
      id
      name
      categoryId
    }
  }
`;

// const { data: categoriesData, loading: categoriesLoading, error: categoriesError } = useQuery(GET_CATEGORIES, {
// });
// const { data: subCategoriesData, loading: subCategoriesLoading, error: subCategoriesError } = useQuery(GET_SUB_CATEGORIES, {
// });

interface CategoryState {
  categories: string[]; // List of categories
  subCategories: Record<string, string[]>; // Subcategories mapped to categories
  setCategories: (categories: string[]) => void; // Function to update categories
  setSubCategories: (subCategories: Record<string, string[]>) => void; // Function to update subcategories
}

// useEffect(() => {
//   if (categoriesData?.categories) {
//     // Map categories to a simple array of names
//     const categoryNames = categoriesData.categories.map((cat: { name: string }) => cat.name);
//     useCategoryStore.getState().setCategories(categoryNames);
//   }

//   if (subCategoriesData?.subCategories) {
//     // Map subcategories to a record of categoryId -> subcategory names
//     const subCategoryMap: Record<string, string[]> = {};
//     subCategoriesData.subCategories.forEach((sub: { name: string; categoryId: string }) => {
//       if (!subCategoryMap[sub.categoryId]) {
//         subCategoryMap[sub.categoryId] = [];
//       }
//       subCategoryMap[sub.categoryId].push(sub.name);
//     });
//     useCategoryStore.getState().setSubCategories(subCategoryMap);
//   }
// }, [categoriesData, subCategoriesData]);

// if (categoriesError || subCategoriesError) {
//   console.error('Error loading categories or subcategories');
// }


export const useCategoryStore = create<CategoryState>((set) => ({
  
  categories: initialCategories,
  subCategories: initialSubCategories,

  // Function to update the list of categories
  setCategories: (categories) => set({ categories }),

  // Function to update the subcategories
  setSubCategories: (subCategories) => set({ subCategories }),
}));