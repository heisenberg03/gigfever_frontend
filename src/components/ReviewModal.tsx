import React from 'react';
import { Modal, ScrollView, Text } from 'react-native';
import { Button } from 'react-native-paper';

interface ReviewModalProps {
  visible: boolean;
  onDismiss: () => void;
  reviews?: { id: string; rating: number; comment: string; reviewer: { displayName: string } }[];
  loading: boolean;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ visible, onDismiss, reviews, loading }) => (
  <Modal visible={visible} onRequestClose={onDismiss}>
    <ScrollView style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Reviews</Text>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        reviews?.map((review) => (
          <View key={review.id} style={{ marginVertical: 8 }}>
            <Text>{review.reviewer.displayName}: {review.rating} ★</Text>
            <Text>{review.comment}</Text>
          </View>
        ))
      )}
      <Button onPress={onDismiss}>Close</Button>
    </ScrollView>
  </Modal>
);

export default ReviewModal;