import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      // Replace with your actual IP
      const res = await axios.post('http://localhost:8080/auth/login', {
        username,
        password,
      });
      
      console.log('Backend response:', res.data); // Debug log
      
      const { token, role } = res.data;

      // Check if token and role exist
      if (!token) {
        setError('No token received from server');
        return;
      }

      if (!role) {
        setError('No role received from server');
        return;
      }

      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('role', role);

      if (role === 'WAITER') {
        router.replace('/screens/WaiterDashboard');
      } else if (role === 'MANAGER') {
        router.replace('/screens/ManagerDashboard');
      } else {
        setError(`Unknown role: ${role}`);
      }
    } catch (err) {
      console.error('Login error:', err);
      
      // Better error handling
      if (err.response) {
        // Server responded with error status
        console.log('Error response:', err.response.data);
        setError(`Server error: ${err.response.status}`);
      } else if (err.request) {
        // Request was made but no response received
        setError('Cannot connect to server. Check your network connection.');
      } else {
        // Something else happened
        setError('Login failed. Please try again.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Login</Text>
      <TextInput 
        placeholder="Username" 
        value={username} 
        onChangeText={setUsername} 
        style={styles.input} 
      />
      <TextInput 
        placeholder="Password" 
        value={password} 
        onChangeText={setPassword} 
        secureTextEntry 
        style={styles.input} 
      />
      <Button title="Login" onPress={handleLogin} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', marginBottom: 15, padding: 10 },
  heading: { fontSize: 28, marginBottom: 20, textAlign: 'center' },
  error: { color: 'red', textAlign: 'center', marginTop: 10 },
});