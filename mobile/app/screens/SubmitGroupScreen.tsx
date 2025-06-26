import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, FlatList } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

type Item = {
  id: number;
  name: string;
  quantity: number;
};

export default function SubmitGroupScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const [items, setItems] = useState<Item[]>([]);

  const fetchGroupItems = async () => {
    const token = await AsyncStorage.getItem('token');
    try {
      const res = await axios.get(`http://localhost:8080/api/groups/${groupId}/items`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(res.data);
    } catch (err) {
      console.error(err);
      Alert.alert('Failed to load items');
    }
  };

  const handleSubmitGroup = async () => {
    const token = await AsyncStorage.getItem('token');
    try {
      await axios.post(
        `http://localhost:8080/api/groups/${groupId}/submit`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      Alert.alert('Group submitted successfully!');
      router.replace('/screens/WaiterDashboard');
    } catch (err) {
      console.error(err);
      Alert.alert('Failed to submit group');
    }
  };

  useEffect(() => {
    fetchGroupItems();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Submit Group #{groupId}</Text>
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

      <Pressable style={styles.button} onPress={handleSubmitGroup}>
        <Text style={styles.buttonText}>Submit Group</Text>
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