import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, Alert, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

type Group = {
  id: number;
  groupName: string;
  tableNumber: string;
  createdAt: string;
  submitted: boolean;
};

const tables = Array.from({ length: 10 }, (_, i) => `T${i + 1}`);

export default function WaiterDashboard() {
  const [activeGroups, setActiveGroups] = useState<Group[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showGroups, setShowGroups] = useState(false);

  const fetchActiveGroups = async () => {
    const token = await AsyncStorage.getItem('token');
    try {
      const res = await axios.get('http://localhost:8080/api/groups/unsubmitted', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setActiveGroups(res.data);
    } catch (err) {
      console.error(err);
      Alert.alert('Failed to fetch active groups');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchActiveGroups();
    setRefreshing(false);
  };

  const handleTablePress = (table: string) => {
    const tableId = table.replace('T', ''); // Extract number from T1, T2, etc.
    router.push(`/screens/SeatSelection?tableId=${tableId}`);
  };

  const handleGroupPress = (group: Group) => {
    router.push(`/screens/EditGroupScreen?groupId=${group.id}`);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('role');
    router.replace('/screens/LoginScreen');
  };

  useEffect(() => {
    fetchActiveGroups();
  }, []);

  const renderTable = ({ item }: { item: string }) => (
    <Pressable style={styles.tableButton} onPress={() => handleTablePress(item)}>
      <Text style={styles.tableText}>{item}</Text>
    </Pressable>
  );

  const renderGroup = ({ item }: { item: Group }) => (
    <Pressable
      style={styles.groupCard}
      onPress={() => handleGroupPress(item)}
    >
      <View style={styles.groupHeader}>
        <Text style={styles.groupName}>{item.groupName}</Text>
        <View style={styles.draftBadge}>
          <Text style={styles.draftText}>Draft</Text>
        </View>
      </View>
      <Text style={styles.groupDetail}>Table: {item.tableNumber}</Text>
      <Text style={styles.groupDetail}>
        Created: {new Date(item.createdAt).toLocaleString()}
      </Text>
      <Text style={styles.editHint}>Tap to edit</Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Waiter Dashboard</Text>
      
      {/* Toggle between tables and active groups */}
      <View style={styles.toggleContainer}>
        <Pressable
          style={[styles.toggleBtn, !showGroups && styles.activeToggle]}
          onPress={() => setShowGroups(false)}
        >
          <Text style={[styles.toggleText, !showGroups && styles.activeToggleText]}>
            Tables
          </Text>
        </Pressable>
        <Pressable
          style={[styles.toggleBtn, showGroups && styles.activeToggle]}
          onPress={() => setShowGroups(true)}
        >
          <Text style={[styles.toggleText, showGroups && styles.activeToggleText]}>
            Active Groups ({activeGroups.length})
          </Text>
        </Pressable>
      </View>

      {!showGroups ? (
        // Tables View
        <FlatList
          data={tables}
          keyExtractor={(item) => item}
          numColumns={2}
          contentContainerStyle={styles.tableGrid}
          renderItem={renderTable}
        />
      ) : (
        // Active Groups View
        <FlatList
          data={activeGroups}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderGroup}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No active groups</Text>
              <Text style={styles.emptySubtext}>
                Create a new group by selecting a table
              </Text>
            </View>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          contentContainerStyle={styles.groupsList}
        />
      )}
      
      <Pressable style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: '#fff' 
  },
  heading: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    marginBottom: 20 
  },
  
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeToggle: {
    backgroundColor: '#4F46E5',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeToggleText: {
    color: '#fff',
  },
  
  // Tables styles
  tableGrid: { 
    justifyContent: 'center',
    paddingBottom: 20,
  },
  tableButton: {
    backgroundColor: '#4F46E5',
    margin: 10,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
  },
  tableText: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  
  // Groups styles
  groupsList: {
    paddingBottom: 20,
  },
  groupCard: {
    backgroundColor: '#fefce8',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#EAB308',
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  groupName: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  draftBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  draftText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  groupDetail: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 2,
  },
  editHint: {
    fontSize: 12,
    color: '#8B5CF6',
    fontStyle: 'italic',
    marginTop: 5,
  },
  
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#64748b',
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  
  logoutBtn: {
    backgroundColor: '#EF4444',
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
});
