import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Alert, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Group = {
  id: number;
  groupName: string;
  tableNumber: string;
  createdAt: string;
  submitted: boolean;
};

type TabType = 'submitted' | 'unsubmitted' | 'all';

export default function ManagerDashboard() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('submitted');
  const [refreshing, setRefreshing] = useState(false);

  const fetchGroups = async (type: TabType) => {
    const token = await AsyncStorage.getItem('token');
    try {
      let endpoint = '';
      switch (type) {
        case 'submitted':
          endpoint = 'http://localhost:8080/api/groups/submitted';
          break;
        case 'unsubmitted':
          endpoint = 'http://localhost:8080/api/groups/unsubmitted';
          break;
        case 'all':
          endpoint = 'http://localhost:8080/api/groups/all';
          break;
      }

      const res = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGroups(res.data);
    } catch (err) {
      console.error(err);
      Alert.alert('Failed to fetch groups');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchGroups(activeTab);
    setRefreshing(false);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    fetchGroups(tab);
  };

  const handleGroupPress = (group: Group) => {
    if (group.submitted) {
      // View submitted group details (read-only)
      router.push(`/screens/GroupDetailsScreen?groupId=${group.id}&readOnly=true`);
    } else {
      // Edit unsubmitted group
      router.push(`/screens/EditGroupScreen?groupId=${group.id}`);
    }
  };

  const handleDeleteGroup = async (groupId: number, groupName: string) => {
    Alert.alert(
      'Delete Group',
      `Are you sure you want to delete ${groupName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const token = await AsyncStorage.getItem('token');
            try {
              await axios.delete(`http://localhost:8080/api/groups/${groupId}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              Alert.alert('Group deleted successfully');
              fetchGroups(activeTab);
            } catch (err) {
              console.error(err);
              Alert.alert('Failed to delete group');
            }
          },
        },
      ]
    );
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('role');
    router.replace('/screens/LoginScreen');
  };

  useEffect(() => {
    fetchGroups(activeTab);
  }, []);

  const renderGroup = ({ item }: { item: Group }) => (
    <Pressable
      style={[
        styles.groupCard,
        item.submitted ? styles.submittedCard : styles.unsubmittedCard
      ]}
      onPress={() => handleGroupPress(item)}
    >
      <View style={styles.groupHeader}>
        <Text style={styles.groupText}>Group: {item.groupName}</Text>
        <View style={[
          styles.statusBadge,
          item.submitted ? styles.submittedBadge : styles.unsubmittedBadge
        ]}>
          <Text style={styles.statusText}>
            {item.submitted ? 'Submitted' : 'Draft'}
          </Text>
        </View>
      </View>
      <Text style={styles.groupDetail}>Table: {item.tableNumber}</Text>
      <Text style={styles.groupDetail}>Created: {new Date(item.createdAt).toLocaleString()}</Text>
      
      <View style={styles.actionButtons}>
        <Pressable
          style={[styles.actionBtn, styles.viewBtn]}
          onPress={() => handleGroupPress(item)}
        >
          <Text style={styles.actionBtnText}>
            {item.submitted ? 'View Details' : 'Edit Group'}
          </Text>
        </Pressable>
        
        {!item.submitted && (
          <Pressable
            style={[styles.actionBtn, styles.deleteBtn]}
            onPress={() => handleDeleteGroup(item.id, item.groupName)}
          >
            <Text style={styles.actionBtnText}>Delete</Text>
          </Pressable>
        )}
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manager Dashboard</Text>
      
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <Pressable
          style={[styles.tab, activeTab === 'submitted' && styles.activeTab]}
          onPress={() => handleTabChange('submitted')}
        >
          <Text style={[styles.tabText, activeTab === 'submitted' && styles.activeTabText]}>
            Submitted
          </Text>
        </Pressable>
        
        <Pressable
          style={[styles.tab, activeTab === 'unsubmitted' && styles.activeTab]}
          onPress={() => handleTabChange('unsubmitted')}
        >
          <Text style={[styles.tabText, activeTab === 'unsubmitted' && styles.activeTabText]}>
            Draft Orders
          </Text>
        </Pressable>
        
        <Pressable
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => handleTabChange('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
            All Groups
          </Text>
        </Pressable>
      </View>

      <FlatList
        data={groups}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderGroup}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No {activeTab === 'all' ? '' : activeTab} groups found
          </Text>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={styles.listContainer}
      />
      
      <Pressable style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#3B82F6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#fff',
  },
  
  listContainer: {
    paddingBottom: 20,
  },
  groupCard: {
    padding: 15,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
  },
  submittedCard: {
    backgroundColor: '#f0f9ff',
    borderColor: '#3B82F6',
  },
  unsubmittedCard: {
    backgroundColor: '#fefce8',
    borderColor: '#EAB308',
  },
  
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  groupText: { 
    fontSize: 18, 
    fontWeight: 'bold',
    flex: 1,
  },
  groupDetail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  submittedBadge: {
    backgroundColor: '#10B981',
  },
  unsubmittedBadge: {
    backgroundColor: '#F59E0B',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  actionButtons: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  viewBtn: {
    backgroundColor: '#3B82F6',
  },
  deleteBtn: {
    backgroundColor: '#EF4444',
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  
  empty: { 
    textAlign: 'center', 
    color: '#888', 
    marginTop: 50,
    fontSize: 16,
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
