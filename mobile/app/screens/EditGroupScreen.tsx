import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
  RefreshControl,
} from 'react-native';
import axios from 'axios';
import { useLocalSearchParams, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../utils/config';
import { getToken } from '../utils/session';

type OrderItem = {
  id: number;
  food: {
    id: number;
    name: string;
    price: number;
  };
  quantity: number;
};

type Group = {
  id: number;
  groupName: string;
  submitted: boolean;
  paid: boolean;
  createdAt: string;
  table: { tableNumber: string };
};

export default function EditGroupScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const [group, setGroup] = useState<Group | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGroupDetails = async () => {
    setError(null);
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      setError('Session expired. Please log in again.');
      setGroup(null);
      setItems([]);
      setLoading(false);
      setTimeout(() => router.replace('/screens/LoginScreen'), 1500);
      return;
    }
    try {
      // Fetch group info
      const groupRes = await axios.get(`${API_BASE_URL}/api/groups/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGroup(groupRes.data);

      // Fetch group items
      const itemsRes = await axios.get(`${API_BASE_URL}/api/groups/${groupId}/items`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(itemsRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch group details');
      setGroup(null);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchGroupDetails();
    setRefreshing(false);
  };

  const handleUpdateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      setError('Session expired. Please log in again.');
      setTimeout(() => router.replace('/screens/LoginScreen'), 1500);
      return;
    }
    try {
      await axios.put(
        `${API_BASE_URL}/api/groups/${groupId}/items/${itemId}?quantity=${newQuantity}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setItems(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (err) {
      console.error(err);
      setError('Failed to update quantity');
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
              setError('Session expired. Please log in again.');
              setTimeout(() => router.replace('/screens/LoginScreen'), 1500);
              return;
            }
            try {
              await axios.delete(`${API_BASE_URL}/api/groups/${groupId}/items/${itemId}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              setItems(prev => prev.filter(item => item.id !== itemId));
              Alert.alert('Success', 'Item removed successfully');
            } catch (err) {
              console.error(err);
              setError('Failed to remove item');
            }
          },
        },
      ]
    );
  };

  const handleAddMoreItems = () => {
    router.push(`/screens/GroupItemsScreen?groupId=${groupId}`);
  };

  const handleSubmitGroup = async () => {
    if (items.length === 0) {
      setError('Cannot submit group without any items');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        setError('Session expired. Please log in again.');
        setTimeout(() => router.replace('/screens/LoginScreen'), 1500);
        setLoading(false);
        return;
      }
      await axios.post(
        `${API_BASE_URL}/api/groups/${groupId}/submit`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      Alert.alert('Success', 'Group submitted successfully!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(`Failed to submit group: ${err.response.data.message}`);
      } else {
        setError('Failed to submit group');
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => total + (item.food.price * item.quantity), 0);
  };

  useEffect(() => {
    fetchGroupDetails();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={{ color: 'red', textAlign: 'center' }}>{error}</Text>
      </View>
    );
  }

  if (!group) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Group not found</Text>
      </View>
    );
  }

  const isPaid = group.paid;

  const renderItem = ({ item }: { item: OrderItem }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemName}>{item.food.name}</Text>
        <Text style={styles.itemPrice}>₹{item.food.price}</Text>
      </View>
      
      <View style={styles.itemControls}>
        <View style={styles.quantityContainer}>
          <Pressable
            style={styles.quantityBtn}
            onPress={() => !isPaid && handleUpdateQuantity(item.id, item.quantity - 1)}
            disabled={isPaid}
          >
            <Text style={styles.quantityBtnText}>-</Text>
          </Pressable>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <Pressable
            style={styles.quantityBtn}
            onPress={() => !isPaid && handleUpdateQuantity(item.id, item.quantity + 1)}
            disabled={isPaid}
          >
            <Text style={styles.quantityBtnText}>+</Text>
          </Pressable>
        </View>
        
        <View style={styles.itemActions}>
          <Text style={styles.subtotal}>₹{item.food.price * item.quantity}</Text>
          <Pressable onPress={() => !isPaid && handleRemoveItem(item.id)} disabled={isPaid}>
            <Text style={[styles.removeText, isPaid && { color: '#ccc' }]}>Remove</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Group</Text>
      
      <View style={styles.groupInfo}>
        <Text style={styles.groupName}>{group.groupName}</Text>
        <Text style={styles.groupDetail}>Table: {group.table?.tableNumber || '-'}</Text>
        <Text style={styles.groupDetail}>Created: {new Date(group.createdAt).toLocaleString()}</Text>
        <Text style={styles.groupDetail}>Status: {group.submitted ? 'Submitted' : 'Draft'}</Text>
        <Text style={styles.groupDetail}>Paid: {group.paid ? 'Yes' : 'No'}</Text>
        {isPaid && <Text style={{ color: 'green', fontWeight: 'bold', marginTop: 8 }}>This group is paid. Editing is disabled.</Text>}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Order Items ({items.length})</Text>
        {!isPaid && (
          <Pressable style={styles.addBtn} onPress={handleAddMoreItems}>
            <Text style={styles.addBtnText}>+ Add Items</Text>
          </Pressable>
        )}
      </View>

      <FlatList
        data={items}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No items in this group</Text>
            {!isPaid && (
              <Pressable style={styles.addItemsBtn} onPress={handleAddMoreItems}>
                <Text style={styles.addItemsBtnText}>Add Items</Text>
              </Pressable>
            )}
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        style={styles.itemsList}
      />

      {items.length > 0 && (
        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>Total: ₹{calculateTotal()}</Text>
        </View>
      )}

      <View style={styles.actionButtons}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Back</Text>
        </Pressable>
        
        {items.length > 0 && !group.submitted && !isPaid && (
          <Pressable style={styles.submitBtn} onPress={handleSubmitGroup}>
            <Text style={styles.submitBtnText}>Submit Group</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff', 
    padding: 20 
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 20, 
    textAlign: 'center' 
  },
  
  groupInfo: {
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  groupDetail: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 2,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  
  itemsList: {
    flex: 1,
    marginBottom: 20,
  },
  itemCard: {
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  itemPrice: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  
  itemControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityBtn: {
    backgroundColor: '#3B82F6',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  quantityText: {
    marginHorizontal: 15,
    fontSize: 16,
    fontWeight: 'bold',
    minWidth: 20,
    textAlign: 'center',
  },
  
  itemActions: {
    alignItems: 'flex-end',
  },
  subtotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 5,
  },
  removeText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
  },
  
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 20,
  },
  addItemsBtn: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addItemsBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  
  totalContainer: {
    backgroundColor: '#f0f9ff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  totalText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1e40af',
  },
  
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  backBtn: {
    flex: 1,
    backgroundColor: '#6B7280',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  backBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitBtn: {
    flex: 1,
    backgroundColor: '#059669',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
