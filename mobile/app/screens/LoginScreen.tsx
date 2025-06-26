import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../utils/config';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login`, {
        username,
        password,
      });
      const { token, role } = res.data;
      if (!token) {
        setError('No token received from server');
        setLoading(false);
        return;
      }
      if (!role) {
        setError('No role received from server');
        setLoading(false);
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
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.response) {
        setError(err.response.data?.message || `Server error: ${err.response.status}`);
      } else if (err.request) {
        setError('Cannot connect to server. Check your network connection.');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
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
        editable={!loading}
      />
      <TextInput 
        placeholder="Password" 
        value={password} 
        onChangeText={setPassword} 
        secureTextEntry 
        style={styles.input} 
        editable={!loading}
      />
      <Button title={loading ? 'Logging in...' : 'Login'} onPress={handleLogin} disabled={loading} />
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