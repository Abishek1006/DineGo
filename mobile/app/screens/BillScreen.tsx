import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Button, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../utils/config';

type Item = {
  id: number;
  name: string;
  quantity: number;
  price: number;
};

type Group = {
  id: number;
  groupName: string;
  items: Item[];
};

export default function BillScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [group, setGroup] = useState<Group | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);

  const fetchGroup = async () => {
    setError(null);
    setLoading(true);
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      setError('Session expired. Please log in again.');
      setGroup(null);
      setLoading(false);
      setTimeout(() => router.replace('/screens/LoginScreen'), 1500);
      return;
    }
    try {
      const res = await axios.get(`${API_BASE_URL}/groups/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGroup(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load group');
      setGroup(null);
    } finally {
      setLoading(false);
    }
  };

  const closeBill = async () => {
    setError(null);
    setClosing(true);
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      setError('Session expired. Please log in again.');
      setTimeout(() => router.replace('/screens/LoginScreen'), 1500);
      setClosing(false);
      return;
    }
    try {
      await axios.put(`${API_BASE_URL}/groups/${id}/close`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      router.back();
    } catch (err) {
      setError('Error closing bill');
    } finally {
      setClosing(false);
    }
  };

  useEffect(() => {
    fetchGroup();
  }, []);

  const getTotal = () =>
    group?.items.reduce((acc, item) => acc + item.price * item.quantity, 0) ?? 0;

  const renderItem = ({ item }: { item: Item }) => (
    <View style={styles.item}>
      <Text style={styles.name}>{item.name}</Text>
      <Text>Qty: {item.quantity}</Text>
      <Text>₹{item.price} x {item.quantity}</Text>
    </View>
  );

  if (loading) return <Text style={{ textAlign: 'center', marginTop: 40 }}>Loading...</Text>;
  if (error) return <Text style={{ color: 'red', textAlign: 'center', marginTop: 40 }}>{error}</Text>;
  if (!group) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bill for {group.groupName}</Text>
      <FlatList
        data={group.items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
      />
      <Text style={styles.total}>Total: ₹{getTotal()}</Text>
      <Button title={closing ? 'Closing...' : 'Close Bill'} onPress={closeBill} disabled={closing} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  name: { fontSize: 16, fontWeight: '500' },
  total: { fontSize: 20, fontWeight: 'bold', marginVertical: 20 },
});
