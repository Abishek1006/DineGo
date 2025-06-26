import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Alert, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../utils/config';

type Group = {
  id: number;
  groupName: string;
  table: { tableNumber: string };
  createdAt: string;
  submitted: boolean;
  paid: boolean;
};

type TabType = 'submitted' | 'unsubmitted' | 'all' | 'paid' | 'unpaid';

export default function ManagerDashboard() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('submitted');
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [markingPaid, setMarkingPaid] = useState<number | null>(null);

  const fetchGroups = async (type: TabType) => {
    setError(null);
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      setError('Session expired. Please log in again.');
      setGroups([]);
      setTimeout(() => router.replace('/screens/LoginScreen'), 1500);
      return;
    }
    try {
      let endpoint = '';
      switch (type) {
        case 'submitted':
          endpoint = `${API_BASE_URL}/api/groups/submitted`;
          break;
        case 'unsubmitted':
          endpoint = `${API_BASE_URL}/api/groups/unsubmitted`;
          break;
        case 'all':
          endpoint = `${API_BASE_URL}/api/groups/all`;
          break;
        case 'paid':
          endpoint = `${API_BASE_URL}/api/groups/paid`;
          break;
        case 'unpaid':
          endpoint = `${API_BASE_URL}/api/groups/unpaid`;
          break;
      }
      const res = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGroups(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch groups');
      setGroups([]);
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
      router.push(`/screens/GroupDetailsScreen?groupId=${group.id}&readOnly=true`);
    } else {
      router.push(`/screens/EditGroupScreen?groupId=${group.id}`);
    }
  };

  const handleMarkAsPaid = async (groupId: number) => {
    setMarkingPaid(groupId);
    setError(null);
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      setError('Session expired. Please log in again.');
      setTimeout(() => router.replace('/screens/LoginScreen'), 1500);
      setMarkingPaid(null);
      return;
    }
    try {
      await axios.put(`${API_BASE_URL}/api/groups/${groupId}/mark-paid`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchGroups(activeTab);
    } catch (err) {
      setError('Failed to mark as paid');
    } finally {
      setMarkingPaid(null);
    }
  };

  const handleSubmitGroup = async (groupId: number) => {
    Alert.alert(
      'Submit Group',
      'Are you sure you want to submit this group? You won\'t be able to edit it after submission.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: async () => {
            setError(null);
            try {
              const token = await AsyncStorage.getItem('token');
              if (!token) {
                setError('Session expired. Please log in again.');
                setTimeout(() => router.replace('/screens/LoginScreen'), 1500);
                return;
              }
              await axios.post(`${API_BASE_URL}/api/groups/${groupId}/submit`, {}, {
                headers: { Authorization: `Bearer ${token}` },
              });
              fetchGroups(activeTab);
            } catch (err: any) {
              if (err.response && err.response.data && err.response.data.message) {
                setError(`Failed to submit group: ${err.response.data.message}`);
              } else {
                setError('Failed to submit group');
              }
            }
          },
        },
      ]
    );
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
            if (!token) {
              setError('Session expired. Please log in again.');
              setTimeout(() => router.replace('/screens/LoginScreen'), 1500);
              return;
            }
            try {
              await axios.delete(`${API_BASE_URL}/api/groups/${groupId}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              fetchGroups(activeTab);
            } catch (err) {
              setError('Failed to delete group');
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
      <Text style={styles.groupDetail}>Table: {item.table?.tableNumber || '-'}</Text>
      <Text style={styles.groupDetail}>Created: {new Date(item.createdAt).toLocaleString()}</Text>
      <Text style={styles.groupDetail}>Paid: {item.paid ? 'Yes' : 'No'}</Text>
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
          <>
            <Pressable
              style={[styles.actionBtn, styles.deleteBtn]}
              onPress={() => handleDeleteGroup(item.id, item.groupName)}
            >
              <Text style={styles.actionBtnText}>Delete</Text>
            </Pressable>
            <Pressable
              style={[styles.actionBtn, styles.submitBtn]}
              onPress={() => handleSubmitGroup(item.id)}
            >
              <Text style={styles.actionBtnText}>Submit</Text>
            </Pressable>
          </>
        )}
        {item.submitted && !item.paid && (
          <Pressable
            style={[styles.actionBtn, styles.paidBtn]}
            onPress={() => handleMarkAsPaid(item.id)}
            disabled={markingPaid === item.id}
          >
            <Text style={styles.actionBtnText}>
              {markingPaid === item.id ? 'Marking...' : 'Mark as Paid'}
            </Text>
          </Pressable>
        )}
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manager Dashboard</Text>
      {error && (
        <Text style={{ color: 'red', textAlign: 'center', marginBottom: 10 }}>{error}</Text>
      )}
      
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
        
        <Pressable
          style={[styles.tab, activeTab === 'paid' && styles.activeTab]}
          onPress={() => handleTabChange('paid')}
        >
          <Text style={[styles.tabText, activeTab === 'paid' && styles.activeTabText]}>
            Paid
          </Text>
        </Pressable>
        
        <Pressable
          style={[styles.tab, activeTab === 'unpaid' && styles.activeTab]}
          onPress={() => handleTabChange('unpaid')}
        >
          <Text style={[styles.tabText, activeTab === 'unpaid' && styles.activeTabText]}>
            Unpaid
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
  submitBtn: {
    backgroundColor: '#10B981',
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
  paidBtn: {
    backgroundColor: '#10B981',
  },
});
