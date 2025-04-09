import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { useMutation } from '@apollo/client';
import { SIGN_IN_WITH_PHONE } from '../graphql/mutations';
import { useAuthStore } from '../stores/authStore';

const OTPScreen = ({ route, navigation }: any) => {
  const { phoneNumber } = route.params;
  const [otp, setOtp] = useState('');
  const [signInWithPhone, { loading, error }] = useMutation(SIGN_IN_WITH_PHONE);
  const { authenticate } = useAuthStore();

  const handleVerifyOtp = async () => {
    try {
      const { data } = await signInWithPhone({
        variables: { phone: phoneNumber, otp },
      });
      const { accessToken, refreshToken, user } = data.signInWithPhone;

      // Normalize user data to match UserProfile interface
      const normalizedUser = {
        ...user,
        categoryIDs: user.categoryIDs.map((cat: { id: string }) => cat.id),
        subCategoryIDs: user.subCategoryIDs.map((sub: { id: string }) => sub.id),
        location: user.location || undefined,
      };

      authenticate(accessToken, refreshToken, normalizedUser);
      navigation.navigate('Home');
    } catch (err) {
      console.error('OTP verification failed:', err);
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
      {error && <Text style={styles.error}>{error.message}</Text>}
      <Button
        mode="contained"
        onPress={handleVerifyOtp}
        disabled={!otp || loading}
        style={styles.button}
        loading={loading}
      >
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
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 16,
  },
});

export default OTPScreen;