// src/screens/profile/EditProfileModal.tsx
import React, { useState, useEffect } from 'react';
import { Modal, View, ScrollView } from 'react-native';
import { TextInput, Button, Text, Chip, useTheme } from 'react-native-paper';
import { useAuthStore } from '../../stores/authStore';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const EditProfileModal = ({ visible, onClose }: Props) => {
  const { currentUser, updateProfile } = useAuthStore();
  const [name, setName] = useState(currentUser?.fullName || '');
  const [location, setLocation] = useState(currentUser?.location || '');
  const [category, setCategory] = useState(currentUser?.category || '');
  const [subcategories, setSubcategories] = useState(currentUser?.subcategories || []);
  const [newSubcategory, setNewSubcategory] = useState('');
  const theme = useTheme();

  useEffect(() => {
    if (visible) {
      setName(currentUser?.fullName || '');
      setLocation(currentUser?.location || '');
      setCategory(currentUser?.category || '');
      setSubcategories(currentUser?.subcategories || []);
    }
  }, [visible, currentUser]);

  const handleSave = () => {
    updateProfile({ fullName:'fullName', location, category, subcategories });
    onClose();
  };

  const addSubcategory = () => {
    if (newSubcategory && !subcategories.includes(newSubcategory)) {
      setSubcategories([...subcategories, newSubcategory]);
      setNewSubcategory('');
    }
  };

  const removeSubcategory = (sub: string) => {
    setSubcategories(subcategories.filter((s) => s !== sub));
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black bg-opacity-30">
        <View className="bg-white rounded-t-xl p-4 max-h-[85%]">
          <ScrollView>
            <Text className="text-lg font-bold mb-4">Edit Profile</Text>

            <TextInput
              label="Name"
              value={name}
              onChangeText={setName}
              mode="outlined"
              className="mb-4"
            />

            <TextInput
              label="Location"
              value={location}
              onChangeText={setLocation}
              mode="outlined"
              className="mb-4"
            />

            <TextInput
              label="Category (Single Select)"
              value={category}
              onChangeText={setCategory}
              mode="outlined"
              className="mb-4"
            />

            <TextInput
              label="Add Subcategory"
              value={newSubcategory}
              onChangeText={setNewSubcategory}
              mode="outlined"
              className="mb-2"
              onSubmitEditing={addSubcategory}
              returnKeyType="done"
            />

            <View className="flex-row flex-wrap mb-4">
              {subcategories.map((sub, idx) => (
                <Chip
                  key={idx}
                  onClose={() => removeSubcategory(sub)}
                  style={{ marginRight: 4, marginBottom: 4 }}
                >
                  {sub}
                </Chip>
              ))}
            </View>
          </ScrollView>

          <View className="flex-row justify-end mt-4">
            <Button onPress={onClose} style={{ marginRight: 8 }}>Cancel</Button>
            <Button mode="contained" onPress={handleSave}>Save</Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default EditProfileModal;