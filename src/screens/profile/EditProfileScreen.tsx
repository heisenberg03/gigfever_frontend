import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useMutation } from '@apollo/client';
import { UPDATE_USER } from '../../graphql/mutations';
import { useAuthStore } from '../../stores/authStore';
import { useCategoryStore } from '../../stores/categoryStore';
import { TextInput, Button, Text } from 'react-native-paper';
import MultiSelect from 'react-native-multiple-select';
import SingleSelectDropdown from '../../components/SingleSelectDropdown';

const EditProfileScreen = () => {
  const { currentUser: user, updateProfile } = useAuthStore();
  const { categories, subCategories } = useCategoryStore();

  const [bio, setBio] = useState(user?.bio || '');
  const [budget, setBudget] = useState(user?.budget || 0);
  const [selectedCategory, setSelectedCategory] = useState(user?.category || '');
  const [selectedSubcategories, setSelectedSubcategories] = useState(user?.subcategories || []);

  const [updateUser] = useMutation(UPDATE_USER, {
    update(cache, { data: { updateUser } }) {
      // Update Apollo cache with the updated user data
      cache.modify({
        fields: {
          currentUser(existingUser = {}) {
            return { ...existingUser, ...updateUser };
          },
        },
      });
    },
  });

  const handleSave = async () => {
    // Update Zustand state immediately for UI responsiveness
    updateProfile({
      bio,
      budget,
      category: selectedCategory,
      subcategories: selectedSubcategories,
    });

    try {
      // Send mutation to backend
      await updateUser({
        variables: {
          id: user?.id,
          input: {
            bio,
            budget,
            category: selectedCategory,
            subcategories: selectedSubcategories,
          },
        },
      });
      alert('Profile updated successfully');
    } catch (error) {
      console.error(error);
      alert('Failed to update profile');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Bio</Text>
      <TextInput
        value={bio}
        onChangeText={setBio}
        style={styles.input}
        mode="outlined"
        placeholder="Enter your bio"
      />

      <Text style={styles.label}>Budget (Rs/hr)</Text>
      <TextInput
        value={String(budget)}
        onChangeText={(text) => setBudget(Number(text))}
        style={styles.input}
        mode="outlined"
        keyboardType="numeric"
        placeholder="Enter your budget"
      />

      <Text style={styles.label}>Category</Text>
      <SingleSelectDropdown
        label="Select Category"
        value={selectedCategory}
        onValueChange={(value) => {
          setSelectedCategory(value);
          setSelectedSubcategories([]); // Reset subcategories when category changes
        }}
        items={categories.map((cat) => ({ label: cat, value: cat }))}
        style={styles.dropdown}
      />

      <Text style={styles.label}>Subcategories</Text>
      <MultiSelect
        items={subCategories[selectedCategory]?.map((sub) => ({
          id: sub,
          name: sub,
        }))}
        uniqueKey="id"
        onSelectedItemsChange={setSelectedSubcategories}
        selectedItems={selectedSubcategories}
        selectText="Pick Subcategories"
        searchInputPlaceholderText="Search Subcategories..."
        tagRemoveIconColor="#6B48FF"
        tagBorderColor="#6B48FF"
        tagTextColor="#6B48FF"
        selectedItemTextColor="#6B48FF"
        selectedItemIconColor="#6B48FF"
        itemTextColor="#000"
        displayKey="name"
        searchInputStyle={{ color: '#000' }}
        submitButtonColor="#6B48FF"
        submitButtonText="Done"
        styleDropdownMenuSubsection={styles.multiSelectDropdown}
      />

      <Button mode="contained" onPress={handleSave} style={styles.saveButton}>
        Save
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  input: { marginBottom: 16 },
  dropdown: { marginBottom: 16 },
  multiSelectDropdown: { marginBottom: 16 },
  saveButton: { marginTop: 16 },
});

export default EditProfileScreen;