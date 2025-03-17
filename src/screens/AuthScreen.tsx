import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../stores/authStore';

const AuthScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const { setUser } = useAuthStore();
  const navigation = useNavigation();

  const handleSendOtp = () => {
    console.log('Sending OTP to', phoneNumber);
    setOtpSent(true);
  };

  const handleVerifyOtp = () => {
    console.log('Verifying OTP', otp);
    setUser({
      id: '1',
      phoneNumber,
      username: 'testuser',
      fullName: 'Test User',
      displayName: 'Test User',
      isArtist: false,
    });
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
        placeholderTextColor="#888"
      />
      {otpSent ? (
        <>
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
        </>
      ) : (
        <Button
          mode="contained"
          onPress={handleSendOtp}
          disabled={!phoneNumber}
          style={styles.button}
        >
          Send OTP
        </Button>
      )}
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
    marginBottom: 24,
    textAlign: 'center',
    color: '#333',
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

export default AuthScreen;