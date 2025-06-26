import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, Alert, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { getToken, logout } from '../utils/session';
import axios from 'axios';
import { API_BASE_URL } from '../utils/config';

// WaiterDashboard: Fetches tables and groups dynamically from backend. Types match backend DTOs. Robust error/session handling included.

type Table = {
  id: number;
  tableNumber: number;
  seats: { id: number; seatNumber: string }[];
};

type Group = {
  id: number;
  groupName: string;
  table: { id: number; tableNumber: number };
  createdAt: string;
  submitted: boolean;
  paid: boolean;
};

export default function WaiterDashboard() {
  const [activeGroups, setActiveGroups] = useState<Group[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showGroups, setShowGroups] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittingId, setSubmittingId] = useState<number | null>(null);

  const fetchTables = async () => {
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error('Session expired. Please log in again.');
      const res = await axios.get(`${API_BASE_URL}/api/tables`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTables(res.data);
    } catch (err: any) {
      setError('Failed to fetch tables');
      setTables([]);
    }
  };

  const fetchActiveGroups = async () => {
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error('Session expired. Please log in again.');
      const res = await axios.get(`${API_BASE_URL}/api/groups/unsubmitted`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setActiveGroups(res.data);
    } catch (err: any) {
      setError('Failed to fetch active groups');
      setActiveGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchActiveGroups();
    await fetchTables();
    setRefreshing(false);
  };

  const handleTablePress = (table: Table) => {
    router.push(`/screens/SeatSelection?tableId=${table.id}`);
  };

  const handleGroupPress = (group: Group) => {
    router.push(`/screens/EditGroupScreen?groupId=${group.id}`);
  };

  const handleDeleteGroup = async (group: Group) => {
    Alert.alert(
      'Delete Group',
      `Are you sure you want to delete ${group.groupName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await getToken();
              if (!token) throw new Error('Session expired. Please log in again.');
              await axios.delete(`${API_BASE_URL}/api/groups/${group.id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              fetchActiveGroups();
            } catch (err: any) {
              if (err.response && err.response.data && err.response.data.message) {
                setError(`Failed to delete group: ${err.response.data.message}`);
              } else {
                setError('Failed to delete group');
              }
            }
          },
        },
      ]
    );
  };

  const handleSubmitGroup = async (group: Group) => {
    Alert.alert(
      'Submit Group',
      'Are you sure you want to submit this group? You won\'t be able to edit it after submission.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: async () => {
            setSubmittingId(group.id);
            setError(null);
            try {
              const token = await getToken();
              if (!token) throw new Error('Session expired. Please log in again.');
              await axios.post(`${API_BASE_URL}/api/groups/${group.id}/submit`, {}, {
                headers: { Authorization: `Bearer ${token}` },
              });
              fetchActiveGroups();
            } catch (err: any) {
              console.error('Submit error:', err);
              if (err.response && err.response.data) {
                if (err.response.data.message) {
                  setError(`Failed to submit group: ${err.response.data.message}`);
                } else if (typeof err.response.data === 'string') {
                  setError(`Failed to submit group: ${err.response.data}`);
                } else {
                  setError('Failed to submit group (unknown server error)');
                }
              } else if (err.request) {
                setError('Failed to submit group: No response from server. Check your network connection.');
              } else {
                setError(`Failed to submit group: ${err.message || 'Unknown error'}`);
              }
            } finally {
              setSubmittingId(null);
            }
          },
        },
      ]
    );
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/screens/LoginScreen');
  };

  useEffect(() => {
    fetchActiveGroups();
    fetchTables();
  }, []);

  const renderTable = ({ item }: { item: Table }) => (
    <Pressable style={styles.tableButton} onPress={() => handleTablePress(item)}>
      <Text style={styles.tableText}>Table {item.tableNumber}</Text>
    </Pressable>
  );

  const renderGroup = ({ item }: { item: Group }) => (
    <View style={styles.groupCard}>
      <Pressable onPress={() => handleGroupPress(item)}>
        <View style={styles.groupHeader}>
          <Text style={styles.groupName}>{item.groupName}</Text>
          <View style={styles.draftBadge}>
            <Text style={styles.draftText}>Draft</Text>
          </View>
        </View>
        <Text style={styles.groupDetail}>Table: {item.table?.tableNumber || '-'}</Text>
        <Text style={styles.groupDetail}>
          Created: {new Date(item.createdAt).toLocaleString()}
        </Text>
        <Text style={styles.groupDetail}>Paid: {item.paid ? 'Yes' : 'No'}</Text>
        <Text style={styles.editHint}>Tap to edit</Text>
      </Pressable>
      <View style={{ flexDirection: 'row', marginTop: 8, gap: 8 }}>
        <Pressable style={[styles.actionBtn, styles.editBtn]} onPress={() => handleGroupPress(item)}>
          <Text style={styles.actionBtnText}>Edit</Text>
        </Pressable>
        {!item.submitted && (
          <>
            <Pressable style={[styles.actionBtn, styles.deleteBtn]} onPress={() => handleDeleteGroup(item)}>
              <Text style={styles.actionBtnText}>Delete</Text>
            </Pressable>
            <Pressable style={[styles.actionBtn, styles.submitBtn, submittingId === item.id && { opacity: 0.5 }]} onPress={() => handleSubmitGroup(item)} disabled={submittingId === item.id}>
              <Text style={styles.actionBtnText}>{submittingId === item.id ? 'Submitting...' : 'Submit'}</Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Waiter Dashboard</Text>
      {error && (
        <View style={{ marginBottom: 10 }}>
          <Text style={{ color: 'red', textAlign: 'center' }}>{error}</Text>
        </View>
      )}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Loading...</Text>
        </View>
      ) : (
        <>
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
          {showGroups ? (
            <FlatList
              data={activeGroups}
              keyExtractor={item => item.id.toString()}
              renderItem={renderGroup}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
              ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>No active groups</Text>}
            />
          ) : (
            <FlatList
              data={tables}
              keyExtractor={item => item.id.toString()}
              renderItem={renderTable}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
              ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>No tables found</Text>}
            />
          )}
          <Pressable style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        </>
      )}
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
  actionBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#4F46E5',
  },
  editBtn: {
    backgroundColor: '#4F46E5',
  },
  deleteBtn: {
    backgroundColor: '#EF4444',
  },
  submitBtn: {
    backgroundColor: '#2563EB',
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
