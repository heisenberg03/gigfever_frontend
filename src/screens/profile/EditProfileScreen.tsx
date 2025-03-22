// src/screens/profile/EditProfileModal.tsx
import React, { useState, useEffect } from 'react';
import { Modal, View, ScrollView, StyleSheet } from 'react-native';
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
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <ScrollView>
            <Text style={styles.title}>Edit Profile</Text>

            <TextInput
              label="Name"
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Location"
              value={location}
              onChangeText={setLocation}
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Category"
              value={category}
              onChangeText={setCategory}
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Add Subcategory"
              value={newSubcategory}
              onChangeText={setNewSubcategory}
              mode="outlined"
              style={styles.input}
              onSubmitEditing={addSubcategory}
              returnKeyType="done"
            />

            <View style={styles.chipContainer}>
              {subcategories.map((sub, idx) => (
                <Chip
                  key={idx}
                  onClose={() => removeSubcategory(sub)}
                  style={styles.chip}
                >
                  {sub}
                </Chip>
              ))}
            </View>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <Button onPress={onClose} style={styles.button}>
              Cancel
            </Button>
            <Button mode="contained" onPress={handleSave} style={styles.button}>
              Save
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: '85%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  button: {
    marginLeft: 8,
  },
});

export default EditProfileModal;