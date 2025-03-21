import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { useAuthStore } from '../stores/authStore';

const OTPScreen = ({ route, navigation }: any) => {
  const { phoneNumber } = route.params;
  const [otp, setOtp] = useState('');
  const { setUser } = useAuthStore();

  const handleVerifyOtp = () => {
    console.log('Verifying OTP', otp);
    // Just set the user - AppNavigator will handle the navigation
    setUser({
      id: '1',
      phoneNumber,
      username: 'testuser',
      fullName: 'Test User',
      displayName: 'Test User',
      isArtist: false,
    });
    navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
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
