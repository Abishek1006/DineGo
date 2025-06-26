import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Button, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  const fetchGroup = async () => {
    const token = await AsyncStorage.getItem('token');
    try {
      const res = await axios.get(`http://localhost:8080/groups/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGroup(res.data);
    } catch (err) {
      console.error(err);
      Alert.alert('Failed to load group');
    }
  };

  useEffect(() => {
    fetchGroup();
  }, []);

  const getTotal = () =>
    group?.items.reduce((acc, item) => acc + item.price * item.quantity, 0) ?? 0;

  const closeBill = async () => {
    const token = await AsyncStorage.getItem('token');
    try {
      await axios.put(`http://localhost:8080/groups/${id}/close`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert('Bill Closed');
      router.back();
    } catch (err) {
      Alert.alert('Error closing bill');
    }
  };

  const renderItem = ({ item }: { item: Item }) => (
    <View style={styles.item}>
      <Text style={styles.name}>{item.name}</Text>
      <Text>Qty: {item.quantity}</Text>
      <Text>₹{item.price} x {item.quantity}</Text>
    </View>
  );

  if (!group) return <Text>Loading...</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bill for {group.groupName}</Text>
      <FlatList
        data={group.items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
      />
      <Text style={styles.total}>Total: ₹{getTotal()}</Text>
      <Button title="Close Bill" onPress={closeBill} />
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
