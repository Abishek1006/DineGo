import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, FlatList } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '../utils/config';

type Item = {
  id: number;
  name: string;
  quantity: number;
};

export default function SubmitGroupScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchGroupItems = async () => {
    setError(null);
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      setError('Session expired. Please log in again.');
      setItems([]);
      setTimeout(() => router.replace('/screens/LoginScreen'), 1500);
      return;
    }
    try {
      const res = await axios.get(`${API_BASE_URL}/api/groups/${groupId}/items`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load items');
      setItems([]);
    }
  };

  const handleSubmitGroup = async () => {
    setError(null);
    setLoading(true);
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      setError('Session expired. Please log in again.');
      setTimeout(() => router.replace('/screens/LoginScreen'), 1500);
      setLoading(false);
      return;
    }
    try {
      await axios.post(
        `${API_BASE_URL}/api/groups/${groupId}/submit`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      router.replace('/screens/WaiterDashboard');
    } catch (err) {
      console.error(err);
      setError('Failed to submit group');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupItems();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Submit Group #{groupId}</Text>
      {error && (
        <Text style={{ color: 'red', textAlign: 'center', marginBottom: 10 }}>{error}</Text>
      )}
      <FlatList
        data={items}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <Text style={styles.item}>
            {item.name} x {item.quantity}
          </Text>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No items found</Text>}
      />
      <Pressable style={styles.button} onPress={handleSubmitGroup} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Submitting...' : 'Submit Group'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  item: { fontSize: 16, marginBottom: 8 },
  empty: { color: '#888', textAlign: 'center', marginTop: 30 },
  button: {
    backgroundColor: '#10B981',
    padding: 15,
    borderRadius: 10,
    marginTop: 30,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});