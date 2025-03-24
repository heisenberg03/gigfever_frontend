// src/screens/profile/ReviewsModal.tsx
import React, { useState, useEffect } from 'react';
import { Modal, View, ScrollView, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Button, Avatar, Card, Surface, SegmentedButtons } from 'react-native-paper';
import { gql, useQuery } from '@apollo/client';
import { format } from 'date-fns';
import { MaterialIcons } from '@expo/vector-icons';

const GET_USER_REVIEWS = gql`
  query GetUserReviews($userId: ID!, $type: String) {
    userReviews(userId: $userId, type: $type) {
      id
      reviewerId
      reviewerName
      reviewerImage
      rating
      comment
      createdAt
      type
    }
  }
`;

interface ReviewsModalProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
  initialTab?: string;
  showTabs?: boolean;
  availableTypes: string[];
}

export const ReviewsModal = ({ 
  visible, 
  onClose, 
  userId, 
  initialTab = 'ARTIST',
  showTabs = true,
  availableTypes = ['ARTIST', 'HOST']
}: ReviewsModalProps) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);

  const { data, loading } = useQuery(GET_USER_REVIEWS, {
    variables: { userId, type: activeTab },
  });

  const handleReportReview = (reviewId: string) => {
    setSelectedReviewId(reviewId);
    setReportModalVisible(true);
  };

  const renderRatingStars = (rating: number) => {
    return (
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <MaterialIcons
            key={star}
            name={star <= rating ? 'star' : 'star-border'}
            size={16}
            color="#FFD700"
          />
        ))}
        <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
      </View>
    );
  };

  // Reset active tab when initialTab changes
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <Surface style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {!showTabs ? `${activeTab.charAt(0) + activeTab.slice(1).toLowerCase()} Reviews` : 'Reviews'}
          </Text>
          <Button onPress={onClose}>Close</Button>
        </View>

        {showTabs && availableTypes.length > 1 && (
          <SegmentedButtons
            value={activeTab}
            onValueChange={setActiveTab}
            buttons={availableTypes.map(type => ({
              value: type,
              label: `As ${type.charAt(0) + type.slice(1).toLowerCase()}`,
              style: activeTab === type ? styles.activeTab : styles.inactiveTab,
            }))}
            style={styles.tabs}
          />
        )}

        {loading ? (
          <View style={styles.centerContent}>
            <Text>Loading reviews...</Text>
          </View>
        ) : !data?.userReviews?.length ? (
          <View style={styles.centerContent}>
            <Text>No reviews yet</Text>
          </View>
        ) : (
          <ScrollView style={styles.reviewsList}>
            {data.userReviews.map((review: any) => (
              <Card key={review.id} style={styles.reviewCard}>
                <Card.Content>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewerInfo}>
                      <Avatar.Image
                        size={40}
                        source={{ uri: review.reviewerImage }}
                      />
                      <View style={styles.reviewerDetails}>
                        <Text style={styles.reviewerName}>{review.reviewerName}</Text>
                        <Text style={styles.reviewDate}>
                          {format(new Date(review.createdAt), 'MMM dd, yyyy')}
                        </Text>
                      </View>
                    </View>
                    {renderRatingStars(review.rating)}
                    <TouchableOpacity
                      style={styles.reportButton}
                      onPress={() => handleReportReview(review.id)}
                    >
                      <MaterialIcons name="flag" size={20} color="#666" />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.comment}>{review.comment}</Text>
                </Card.Content>
              </Card>
            ))}
          </ScrollView>
        )}
      </Surface>
      <Modal
        visible={reportModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setReportModalVisible(false)}
      >
        <View style={styles.reportModalContainer}>
          <View style={styles.reportModalContent}>
            <Text style={styles.reportTitle}>Report Review</Text>
            <TouchableOpacity
              style={styles.reportOption}
              onPress={() => {
                // Handle report submission
                console.log('Reported as fake');
                setReportModalVisible(false);
              }}
            >
              <Text>Fake Review</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.reportOption}
              onPress={() => {
                // Handle report submission
                console.log('Reported as abusive');
                setReportModalVisible(false);
              }}
            >
              <Text>Abusive Content</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.reportOption}
              onPress={() => {
                // Handle report submission
                console.log('Reported as spam');
                setReportModalVisible(false);
              }}
            >
              <Text>Spam</Text>
            </TouchableOpacity>
            <Button
              onPress={() => setReportModalVisible(false)}
              style={styles.cancelButton}
            >
              Cancel
            </Button>
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  reportButton: {
    padding: 4,
  },
  reportModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportModalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '80%',
    maxWidth: 400,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  reportOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cancelButton: {
    marginTop: 8,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  tabs: {
    margin: 16,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewsList: {
    padding: 16,
  },
  reviewCard: {
    marginBottom: 16,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewerDetails: {
    marginLeft: 12,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  reviewDate: {
    fontSize: 12,
    color: '#666',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
  },
  comment: {
    fontSize: 14,
    lineHeight: 20,
    color: '#444',
  },
  activeTab: {
    backgroundColor: '#6B48FF',
  },
  inactiveTab: {
    backgroundColor: '#F5F5F5',
  },
  tabText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  inactiveTabText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ReviewsModal;
