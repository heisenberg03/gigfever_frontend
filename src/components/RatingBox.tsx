import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

interface RatingBoxProps {
  type: string;
  rating?: number;
  count?: number;
  icon: string;
  onPress: (type: string) => void;
}

export const RatingBox = ({ type, rating, count, icon, onPress }: RatingBoxProps) => {
  const theme = useTheme();

  return (
    <TouchableOpacity
      style={styles.ratingBox}
      onPress={() => onPress(type.toUpperCase())}
    >
      <View style={styles.ratingHeader}>
        <MaterialIcons name={icon} size={16} color={theme.colors.primary} />
        <Text style={styles.ratingLabel}>{type} Rating</Text>
      </View>
      <View style={styles.ratingContent}>
        <MaterialIcons name="star" size={16} color="#FFD700" />
        <Text style={styles.ratingValue}>
          {rating?.toFixed(1) || 'N/A'}
        </Text>
        <Text style={styles.reviewCount}>
          ({count || 0})
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  ratingBox: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  ratingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  ratingLabel: {
    fontSize: 12,
    color: '#666',
  },
  ratingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  reviewCount: {
    fontSize: 12,
    color: '#666',
  },
});

export default RatingBox;