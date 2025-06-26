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
  createdAt: string;
  submittedAt?: string;
};

export default function GroupDetailsScreen() {
  const { groupId, readOnly } = useLocalSearchParams<{ 
    groupId: string; 
    readOnly?: string; 
  }>();
  const [group, setGroup] = useState<Group | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const isReadOnly = readOnly === 'true';

  const fetchGroupDetails = async () => {
    const token = await AsyncStorage.getItem('token');
    try {
      // Fetch group info
      const groupRes = await axios.get(`http://localhost:8080/api/groups/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGroup(groupRes.data);

      // Fetch group items
      const itemsRes = await axios.get(`http://localhost:8080/api/groups/${groupId}/items`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(itemsRes.data);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to fetch group details');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchGroupDetails();
    setRefreshing(false);
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => total + (item.food.price * item.quantity), 0);
  };

  const calculateItemTotal = (item: OrderItem) => {
    return item.food.price * item.quantity;
  };

  useEffect(() => {
    fetchGroupDetails();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!group) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Group not found</Text>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const renderItem = ({ item }: { item: OrderItem }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemName}>{item.food.name}</Text>
        <Text style={styles.itemPrice}>₹{item.food.price} each</Text>
      </View>
      
      <View style={styles.itemDetails}>
        <Text style={styles.quantityInfo}>Quantity: {item.quantity}</Text>
        <Text style={styles.itemTotal}>₹{calculateItemTotal(item)}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isReadOnly ? 'Group Details' : 'Order Summary'}
      </Text>
      
      <View style={[
        styles.groupInfo,
        group.submitted ? styles.submittedGroup : styles.draftGroup
      ]}>
        <Text style={styles.groupName}>{group.groupName}</Text>
        <Text style={styles.groupDetail}>
          Created: {new Date(group.createdAt).toLocaleString()}
        </Text>
        {group.submittedAt && (
          <Text style={styles.groupDetail}>
            Submitted: {new Date(group.submittedAt).toLocaleString()}
          </Text>
        )}
        <View style={[
          styles.statusBadge,
          group.submitted ? styles.submittedBadge : styles.draftBadge
        ]}>
          <Text style={styles.statusText}>
            {group.submitted ? 'Submitted' : 'Draft'}
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>
        Order Items ({items.length})
      </Text>

      <FlatList
        data={items}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No items in this order</Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        style={styles.itemsList}
        showsVerticalScrollIndicator={false}
      />

      {items.length > 0 && (
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Items:</Text>
            <Text style={styles.summaryValue}>
              {items.reduce((sum, item) => sum + item.quantity, 0)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Amount:</Text>
            <Text style={styles.totalAmount}>₹{calculateTotal()}</Text>
          </View>
        </View>
      )}

      <View style={styles.actionButtons}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Back</Text>
        </Pressable>
        
        {!isReadOnly && !group.submitted && (
          <Pressable 
            style={styles.editBtn} 
            onPress={() => router.push(`/screens/EditGroupScreen?groupId=${groupId}`)}
          >
            <Text style={styles.editBtnText}>Edit Order</Text>
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
    textAlign: 'center',
    color: '#1f2937',
  },
  
  loadingText: {
    fontSize: 18,
    color: '#6b7280',
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
    marginBottom: 20,
  },
  
  groupInfo: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 2,
    position: 'relative',
  },
  submittedGroup: {
    backgroundColor: '#f0f9ff',
    borderColor: '#3b82f6',
  },
  draftGroup: {
    backgroundColor: '#fefce8',
    borderColor: '#eab308',
  },
  groupName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1f2937',
  },
  groupDetail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  
  statusBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  submittedBadge: {
    backgroundColor: '#10b981',
  },
  draftBadge: {
    backgroundColor: '#f59e0b',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#1f2937',
  },
  
  itemsList: {
    flex: 1,
    marginBottom: 20,
  },
  itemCard: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    color: '#1f2937',
  },
  itemPrice: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityInfo: {
    fontSize: 14,
    color: '#6b7280',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
  },
  
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
  },
  
  summaryContainer: {
    backgroundColor: '#f0f9ff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  backBtn: {
    flex: 1,
    backgroundColor: '#6b7280',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  backBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  editBtn: {
    flex: 1,
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  editBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});