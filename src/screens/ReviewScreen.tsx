import React, { useState } from 'react';
import { View, TextInput } from 'react-native';
import { Appbar, Button, Rating } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useMutation } from '@apollo/client';
import { SUBMIT_REVIEW } from '../graphql/mutations';

const ReviewScreen = ({ route }) => {
  const { eventId } = route.params;
  const navigation = useNavigation();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitReview] = useMutation(SUBMIT_REVIEW);

  const handleSubmit = () => {
    submitReview({ variables: { eventId, rating, comment } });
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Submit Review" />
      </Appbar.Header>
      <Rating rating={rating} onRate={setRating} />
      <TextInput
        value={comment}
        onChangeText={setComment}
        placeholder="Write your review"
        multiline
        style={{ marginVertical: 16 }}
      />
      <Button mode="contained" onPress={handleSubmit}>Submit</Button>
    </View>
  );
};

export default ReviewScreen;