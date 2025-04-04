import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  FlatList,
} from 'react-native';
import { Appbar, Searchbar, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { SubCategory } from '../stores/categoryStore';

type CategoryDetailsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'CategoryDetails'
>;

type CategoryDetailsScreenRouteProp = RouteProp<
  RootStackParamList,
  'CategoryDetails'
>;

interface CategoryDetailsScreenProps {
  navigation: CategoryDetailsScreenNavigationProp;
  route: CategoryDetailsScreenRouteProp;
}

export const CategoryDetailsScreen: React.FC<CategoryDetailsScreenProps> = ({
  route,
  navigation
}) => {
  const { categoryName, subCategories } = route.params;
  const [searchQuery, setSearchQuery] = useState('');
  const theme = useTheme();

  const filteredSubCategories = subCategories.filter(subCategory =>
    subCategory.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubCategoryPress = (subCategory: SubCategory) => {
    navigation.navigate('SubCategoryDetails', {
      subCategoryId: subCategory.id,
      subCategoryName: subCategory.name,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={categoryName} />
      </Appbar.Header>

      <Searchbar
        placeholder="Search subcategories..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      <FlatList
        data={filteredSubCategories}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.subCategoryCard}
            onPress={() => handleSubCategoryPress(item)}
          >
            <Image source={{ uri: item.image }} style={styles.subCategoryImage} />
            <View style={styles.subCategoryContent}>
              <Text style={styles.subCategoryName}>{item.name}</Text>
              <MaterialIcons name="chevron-right" size={24} color={theme.colors.primary} />
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: theme.colors.primary,
    elevation: 0,
  },
  searchBar: {
    margin: 16,
    elevation: 2,
  },
  content: {
    padding: 16,
  },
  subCategoryCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  subCategoryImage: {
    width: 80,
    height: 80,
  },
  subCategoryContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  subCategoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});

export default CategoryDetailsScreen;