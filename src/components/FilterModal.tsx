import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Modal, Portal, Text, Button, Searchbar, TextInput, Chip } from 'react-native-paper';
import { theme } from '../theme';

interface Category {
  id: string;
  name: string;
  image: string;
  subCategories: SubCategory[];
}

interface SubCategory {
  id: string;
  name: string;
  image: string;
}

interface FilterModalProps {
  visible: boolean;
  onDismiss: () => void;
  selectedCategory: Category | null;
  categorySearch: string;
  setCategorySearch: (search: string) => void;
  filteredCategories: Category[];
  setSelectedCategory: (category: Category | null) => void;
  selectedSubCategories: SubCategory[];
  toggleSubCategory: (subCategory: SubCategory) => void;
  minBudget: string;
  setMinBudget: (value: string) => void;
  maxBudget: string;
  setMaxBudget: (value: string) => void;
  onClearAll: () => void;
  onApply: () => void;
}

const FilterModal = ({ visible, onDismiss, ...props }: FilterModalProps) => {
  const [showCategorySearch, setShowCategorySearch] = useState(!props.selectedCategory);

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Filters</Text>
          <Button onPress={()=>{props.onClearAll(),setShowCategorySearch(true)}}>Clear All</Button>
        </View>

        {/* Category Selection */}
        {props.selectedCategory ? (
          <View style={styles.selectedCategoryContainer}>
            <Text style={styles.filterLabel}>Selected Category</Text>
            <Chip
              onClose={() => {
                props.setSelectedCategory(null);
                setShowCategorySearch(true);
              }}
              style={styles.selectedCategoryChip}
            >
              {props.selectedCategory.name}
            </Chip>
          </View>
        ) : showCategorySearch ? (
          <>
            <Text style={styles.filterLabel}>Choose Category</Text>
            <Searchbar
              placeholder="Search categories"
              value={props.categorySearch}
              onChangeText={props.setCategorySearch}
              style={styles.searchbar}
            />
            <ScrollView style={styles.optionsContainer}>
              {props.filteredCategories.map(category => (
                <TouchableOpacity
                  key={category.id}
                  style={styles.categoryOption}
                  onPress={() => {
                    props.setSelectedCategory(category);
                    setShowCategorySearch(false);
                  }}
                >
                  <Text>{category.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        ) : null}

        {/* Subcategories */}
        {props.selectedCategory && (
          <>
            <Text style={styles.filterLabel}>Subcategories</Text>
            <ScrollView style={[styles.optionsContainer, { maxHeight: 200 }]}>
              {props.selectedCategory.subCategories.map(subCategory => (
                <TouchableOpacity
                  key={subCategory.id}
                  style={[
                    styles.subCategoryOption,
                    props.selectedSubCategories.includes(subCategory) && styles.selectedOption
                  ]}
                  onPress={() => props.toggleSubCategory(subCategory)}
                >
                  <Text style={[
                    styles.optionText,
                    props.selectedSubCategories.includes(subCategory) && styles.selectedOptionText
                  ]}>
                    {subCategory.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {/* Budget Range */}
        <Text style={styles.filterLabel}>Budget Range (₹/hr)</Text>
        <View style={styles.budgetContainer}>
          <TextInput
            mode="outlined"
            label="Min"
            value={props.minBudget}
            onChangeText={props.setMinBudget}
            keyboardType="number-pad"
            style={styles.budgetInput}
          />
          <TextInput
            mode="outlined"
            label="Max"
            value={props.maxBudget}
            onChangeText={props.setMaxBudget}
            keyboardType="number-pad"
            style={styles.budgetInput}
          />
        </View>

        <View style={styles.actions}>
          <Button onPress={onDismiss}>Cancel</Button>
          <Button mode="contained" onPress={props.onApply}>
            Apply
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    maxHeight: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  selectedCategoryContainer: {
    marginBottom: 16,
  },
  selectedCategoryChip: {
    marginTop: 8,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  searchbar: {
    marginBottom: 8,
  },
  optionsContainer: {
    maxHeight: 150,
  },
  categoryOption: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginBottom: 4,
  },
  subCategoryOption: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginBottom: 4,
  },
  selectedOption: {
    backgroundColor: theme.colors.primary,
  },
  optionText: {
    color: '#000',
  },
  selectedOptionText: {
    color: '#fff',
  },
  budgetContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  budgetInput: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 20,
  },
});

export default FilterModal;