import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { useAuthStore } from '../stores/authStore';

const OTPScreen = ({ route, navigation }: any) => {
  const { phoneNumber } = route.params;
  const [otp, setOtp] = useState('');
  const { authenticate } = useAuthStore();

  const handleVerifyOtp = async () => {
    try {
      // Here you would normally make an API call to verify OTP
      // For now, we'll simulate a successful verification
      const mockToken = 'mock-jwt-token';
      const mockUser = {
        id: 'u1',
        phone: '9783776837',
        profilePicture: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
        email:'dumjubmummy.jefhuowiucehbmy@email.som',
        fullName: 'Test User',
        username: 'Test',
        isArtist: false,
        bio: 'Event organizer with a passion for music.',
        budget: 5000,
        location: 'Mumbai',
        artistType: 'band',
        categoryIDs: ['1'],
        artistRating: 4.5,
        artistReviewCount: 10,
        hostRating: 4.3,
        hostReviewCount: 5,
        subCategoryIDs: ['1','4'],
      };

    authenticate(mockUser, mockToken);

  } catch (error) {
      console.error('OTP verification failed:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify OTP</Text>
      <Text style={styles.subtitle}>OTP sent to {phoneNumber}</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter OTP"
        value={otp}
        onChangeText={setOtp}
        keyboardType="numeric"
        placeholderTextColor="#888"
      />
      <Button mode="contained" onPress={handleVerifyOtp} style={styles.button}>
        Verify OTP
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  button: {
    paddingVertical: 8,
    borderRadius: 8,
  },
});

export default OTPScreen;
