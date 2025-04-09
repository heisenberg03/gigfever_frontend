import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { useMutation } from '@apollo/client';
import { SIGN_UP } from '../graphql/mutations';

const AuthScreen = ({ navigation }: any) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [signUp, { loading, error }] = useMutation(SIGN_UP);

  const handleSendOtp = async () => {
    try {
      const { data } = await signUp({
        variables: { phone: phoneNumber, username, fullName },
      });
      console.log('User signed up:', data.signUp);
      navigation.navigate('OTPScreen', { phoneNumber });
    } catch (err) {
      console.error('Sign-up failed:', err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up / Sign In</Text>
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={fullName}
        onChangeText={setFullName}
        placeholderTextColor="#888"
      />
      {error && <Text style={styles.error}>{error.message}</Text>}
      <Button
        mode="contained"
        onPress={handleSendOtp}
        disabled={!phoneNumber || !username || !fullName || loading}
        style={styles.button}
        loading={loading}
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
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 16,
  },
});

export default AuthScreen;