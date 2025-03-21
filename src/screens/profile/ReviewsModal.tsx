// src/screens/profile/ReviewsModal.tsx
import React from 'react';
import { Modal, View, Text, FlatList, Pressable } from 'react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const dummyReviews = [
  { id: '1', reviewer: 'Ankit', text: 'Great performance!', role: 'Host' },
  { id: '2', reviewer: 'Priya', text: 'Very responsive artist.', role: 'Host' },
  { id: '3', reviewer: 'Kabir', text: 'Would love to work again.', role: 'Artist' },
];

const ReviewsModal = ({ visible, onClose }: Props) => {
  const handleReport = (id: string) => {
    // Report review logic here (mutation or alert)
    alert(`Reported review ID: ${id}`);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black bg-opacity-30">
        <View className="bg-white rounded-t-xl p-4 max-h-[80%]">
          <Text className="text-lg font-bold mb-4">User Reviews</Text>
          <FlatList
            data={dummyReviews}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View className="mb-4 border-b border-gray-200 pb-2">
                <Text className="font-semibold">{item.reviewer} ({item.role})</Text>
                <Text className="text-gray-700 mt-1">{item.text}</Text>
                <Pressable onPress={() => handleReport(item.id)}>
                  <Text className="text-xs text-red-500 mt-1">Report false review</Text>
                </Pressable>
              </View>
            )}
          />

          <Pressable onPress={onClose} className="mt-4 items-end">
            <Text className="text-blue-500">Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

export default ReviewsModal;
