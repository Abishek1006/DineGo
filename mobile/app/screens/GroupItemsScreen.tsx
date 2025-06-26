import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import axios from 'axios';
import { useLocalSearchParams, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

type FoodItem = {
  id: number;
  name: string;
  price: number;
};

type SelectedItem = {
  id: number;
  name: string;
  quantity: number;
};

export default function GroupItemsScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const [menu, setMenu] = useState<FoodItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMenu = async () => {
    const token = await AsyncStorage.getItem('token');
    try {
      const res = await axios.get('http://localhost:8080/api/foods', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMenu(res.data);
    } catch (err) {
      console.error(err);
      Alert.alert('Error fetching menu');
    }
  };

  const handleAddItem = (item: FoodItem) => {
    setSelectedItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { id: item.id, name: item.name, quantity: 1 }];
    });
  };

  const handleRemoveItem = (itemId: number) => {
    setSelectedItems(prev => prev.filter(i => i.id !== itemId));
  };

  const handleUpdateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    
    setSelectedItems(prev =>
      prev.map(i =>
        i.id === itemId ? { ...i, quantity: newQuantity } : i
      )
    );
  };

  // Option 1: Add items one by one (current approach - works with your existing backend)
  const handleUpdateGroupOneByOne = async () => {
    if (selectedItems.length === 0) {
      Alert.alert('Please select at least one item');
      return;
    }

    setIsSubmitting(true);
    const token = await AsyncStorage.getItem('token');
    
    try {
      // Add each item individually
      for (const item of selectedItems) {
        await axios.post(
          `http://localhost:8080/api/groups/${groupId}/add-item?foodId=${item.id}&quantity=${item.quantity}`,
          {},
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            } 
          }
        );
      }
      
      Alert.alert('Items added successfully!', '', [
        {
          text: 'OK',
          onPress: () => router.push(`/screens/SubmitGroupScreen?groupId=${groupId}`)
        }
      ]);
    } catch (err) {
      console.error('Error adding items:', err);
      if (err.response) {
        console.error('Error response:', err.response.data);
        Alert.alert('Error', `Failed to add items: ${err.response.data.message || err.response.status}`);
      } else {
        Alert.alert('Error', 'Failed to add items');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Option 2: Add all items in a single request (more efficient)
  const handleUpdateGroupBatch = async () => {
    if (selectedItems.length === 0) {
      Alert.alert('Please select at least one item');
      return;
    }

    setIsSubmitting(true);
    const token = await AsyncStorage.getItem('token');
    
    try {
      // Transform selected items to match backend DTO
      const foodOrders = selectedItems.map(item => ({
        foodId: item.id,
        quantity: item.quantity
      }));

      await axios.post(
        `http://localhost:8080/api/groups/${groupId}/items`,
        foodOrders,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      Alert.alert('Items added successfully!', '', [
        {
          text: 'OK',
          onPress: () => router.push(`/screens/SubmitGroupScreen?groupId=${groupId}`)
        }
      ]);
    } catch (err) {
      console.error('Error adding items:', err);
      if (err.response) {
        console.error('Error response:', err.response.data);
        Alert.alert('Error', `Failed to add items: ${err.response.data.message || err.response.status}`);
      } else {
        Alert.alert('Error', 'Failed to add items');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick add single item (immediate API call)
  const handleQuickAddItem = async (item: FoodItem) => {
    const token = await AsyncStorage.getItem('token');
    
    try {
      await axios.post(
        `http://localhost:8080/api/groups/${groupId}/add-item?foodId=${item.id}&quantity=1`,
        {},
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      Alert.alert('Item added successfully!');
    } catch (err) {
      console.error('Error adding item:', err);
      Alert.alert('Error', 'Failed to add item');
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Add Items to Group {groupId}</Text>
      
      <Text style={styles.subheading}>Menu Items</Text>
      <FlatList
        data={menu}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.menuItemContainer}>
            <Pressable style={styles.item} onPress={() => handleAddItem(item)}>
              <Text style={styles.itemText}>
                {item.name} - ₹{item.price}
              </Text>
            </Pressable>
            <Pressable 
              style={styles.quickAddBtn} 
              onPress={() => handleQuickAddItem(item)}
            >
              <Text style={styles.quickAddText}>Quick Add</Text>
            </Pressable>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No items found</Text>}
        style={styles.menuList}
      />

      <Text style={styles.subheading}>Selected Items ({selectedItems.length})</Text>
      <FlatList
        data={selectedItems}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.selectedItem}>
            <Text style={styles.selectedItemText}>
              {item.name}
            </Text>
            <View style={styles.quantityContainer}>
              <Pressable 
                style={styles.quantityBtn}
                onPress={() => handleUpdateQuantity(item.id, item.quantity - 1)}
              >
                <Text style={styles.quantityBtnText}>-</Text>
              </Pressable>
              <Text style={styles.quantityText}>{item.quantity}</Text>
              <Pressable 
                style={styles.quantityBtn}
                onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)}
              >
                <Text style={styles.quantityBtnText}>+</Text>
              </Pressable>
            </View>
            <Pressable onPress={() => handleRemoveItem(item.id)}>
              <Text style={styles.remove}>Remove</Text>
            </Pressable>
          </View>
        )}
        style={styles.selectedList}
        ListEmptyComponent={<Text style={styles.emptySelected}>No items selected</Text>}
      />

      <View style={styles.buttonContainer}>
        <Pressable 
          style={[styles.submitBtn, styles.batchBtn, isSubmitting && styles.submitBtnDisabled]} 
          onPress={handleUpdateGroupBatch}
          disabled={isSubmitting}
        >
          <Text style={styles.submitText}>
            {isSubmitting ? 'Adding Items...' : 'Add All Items (Batch)'}
          </Text>
        </Pressable>
        
        <Pressable 
          style={[styles.submitBtn, styles.oneByOneBtn, isSubmitting && styles.submitBtnDisabled]} 
          onPress={handleUpdateGroupOneByOne}
          disabled={isSubmitting}
        >
          <Text style={styles.submitText}>
            {isSubmitting ? 'Adding Items...' : 'Add Items (One by One)'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  heading: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  subheading: { fontSize: 18, fontWeight: 'bold', marginTop: 10, marginBottom: 10 },
  menuList: { maxHeight: 200, marginBottom: 20 },
  selectedList: { maxHeight: 150, marginBottom: 20 },
  menuItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
  },
  item: {
    flex: 1,
    padding: 15,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    marginRight: 10,
  },
   quickAddBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  quickAddText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  itemText: { fontSize: 16 },
  selectedItem: {
    flexDirection: 'row',
    padding: 12,
    marginTop: 5,
    backgroundColor: '#D1FAE5',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedItemText: { flex: 1, fontSize: 14 },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  quantityBtn: {
    backgroundColor: '#4F46E5',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  quantityText: { marginHorizontal: 15, fontSize: 16, fontWeight: 'bold' },
  remove: { color: 'red', fontWeight: 'bold', fontSize: 12 },
  buttonContainer: {
    gap: 10,
    marginTop: 10,
  },
  submitBtn: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  batchBtn: {
    backgroundColor: '#3B82F6',
  },
  oneByOneBtn: {
    backgroundColor: '#8B5CF6',
  },
  submitBtnDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  empty: { textAlign: 'center', color: '#888', marginTop: 20 },
  emptySelected: { textAlign: 'center', color: '#888', marginTop: 10, fontSize: 14 },
});

