import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, Button, Alert, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Food = {
  id: number;
  name: string;
  price: number;
};

export default function FoodManagementScreen() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');

  const fetchFoods = async () => {
    const token = await AsyncStorage.getItem('token');
    try {
      const res = await axios.get('http://localhost:8080/foods', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFoods(res.data);
    } catch (err) {
      Alert.alert('Failed to fetch food menu');
    }
  };

  const addFood = async () => {
    const token = await AsyncStorage.getItem('token');
    try {
      await axios.post(
        'http://localhost:8080/foods',
        { name: newName, price: parseFloat(newPrice) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewName('');
      setNewPrice('');
      fetchFoods();
    } catch (err) {
      Alert.alert('Failed to add food item');
    }
  };

  const deleteFood = async (id: number) => {
    const token = await AsyncStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:8080/foods/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchFoods();
    } catch (err) {
      Alert.alert('Failed to delete food item');
    }
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Food Menu Management</Text>

      <View style={styles.inputRow}>
        <TextInput
          placeholder="Food Name"
          value={newName}
          onChangeText={setNewName}
          style={styles.input}
        />
        <TextInput
          placeholder="Price"
          value={newPrice}
          onChangeText={setNewPrice}
          keyboardType="numeric"
          style={styles.input}
        />
        <Button title="Add" onPress={addFood} />
      </View>

      <FlatList
        data={foods}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <Text style={styles.itemText}>
              {item.name} - ₹{item.price}
            </Text>
            <Button title="Delete" onPress={() => deleteFood(item.id)} />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  heading: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, gap: 10 },
  input: { borderWidth: 1, padding: 10, width: '30%' },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  itemText: { fontSize: 16 },
});
