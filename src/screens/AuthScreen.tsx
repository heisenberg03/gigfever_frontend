import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { useAuthStore } from '../stores/authStore';

const AuthScreen = ({ navigation }: any) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handleSendOtp = () => {
    console.log('Sending OTP to', phoneNumber);
    setOtpSent(true);
    navigation.navigate('OTPScreen', { phoneNumber }); // Navigate to OTPScreen
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
      <Button
        mode="contained"
        onPress={handleSendOtp}
        disabled={!phoneNumber}
        style={styles.button}
      >
        Send OTP
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