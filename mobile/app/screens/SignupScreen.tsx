import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router } from 'expo-router';

export default function SignupScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('WAITER'); // default
  const [error, setError] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      const storedRole = await AsyncStorage.getItem('role');
      if (storedRole === 'MANAGER' || storedRole === 'ADMIN') {
        setIsAuthorized(true);
      } else {
        Alert.alert("Access Denied", "Only MANAGER or ADMIN can access this page.");
        router.replace('/screens/ManagerDashboard'); // Fix: redirect to appropriate dashboard
      }
    };
    checkAccess();
  }, []);

  const handleRegister = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      // Fix: Use correct API endpoint (assuming it follows REST pattern)
      const res = await axios.post(
        'http://localhost:8080/api/auth/register',
        { username, password, role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('Success', 'User registered successfully');
      // Clear form
      setUsername('');
      setPassword('');
      setRole('WAITER');
    } catch (err) {
      console.error(err);
      setError('Registration failed');
    }
  };

  if (!isAuthorized) return null; // Don't render form if not allowed

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Create New User</Text>

      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
        style={styles.input}
      />

      <TextInput
        placeholder="Role (WAITER / MANAGER / ADMIN)"
        value={role}
        onChangeText={setRole}
        style={styles.input}
        autoCapitalize="characters"
      />

      <Button title="Register User" onPress={handleRegister} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', marginBottom: 15, padding: 10 },
  heading: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  error: { color: 'red', textAlign: 'center', marginTop: 10 },
});