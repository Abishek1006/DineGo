import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const seatNumbers = ['S1', 'S2', 'S3', 'S4'];

export default function SeatSelection() {
  const { tableId } = useLocalSearchParams<{ tableId: string }>();
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  const toggleSeat = (seat: string) => {
    setSelectedSeats(prev =>
      prev.includes(seat) ? prev.filter(s => s !== seat) : [...prev, seat]
    );
  };

  const handleCreateGroup = async () => {
    if (selectedSeats.length === 0) {
      Alert.alert('Select at least one seat');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      
      // Convert seat strings to seat IDs (assuming S1=1, S2=2, etc.)
      const seatIds = selectedSeats.map(seat => parseInt(seat.replace('S', '')));
      
      // Extract table number from tableId (assuming T1=1, T2=2, etc.)
      const tableNumber = parseInt(tableId?.replace('T', '') || '1');

      // Fix: Send tableId as query parameter and seatIds as request body
      const res = await axios.post(
        `http://localhost:8080/api/groups/create?tableId=${tableNumber}`,
        seatIds, // Send array of seat IDs directly as request body
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );

      const groupId = res.data.id;
      router.push(`/screens/GroupItemsScreen?groupId=${groupId}`);
    } catch (err) {
      console.error('Error creating group:', err);
      if (err.response) {
        console.error('Error response:', err.response.data);
        Alert.alert('Error', `Failed to create group: ${err.response.data.message || err.response.status}`);
      } else {
        Alert.alert('Error', 'Failed to create group');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Select Seats for {tableId}</Text>
      <View style={styles.seatsContainer}>
        {seatNumbers.map(seat => {
          const isSelected = selectedSeats.includes(seat);
          return (
            <Pressable
              key={seat}
              style={[styles.seat, isSelected && styles.selectedSeat]}
              onPress={() => toggleSeat(seat)}
            >
              <Text style={styles.seatText}>{seat}</Text>
            </Pressable>
          );
        })}
      </View>
      <Pressable style={styles.createBtn} onPress={handleCreateGroup}>
        <Text style={styles.createText}>Create Group</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#fff' },
  heading: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  seatsContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 30 },
  seat: {
    backgroundColor: '#D1D5DB',
    padding: 20,
    borderRadius: 10,
    width: 70,
    alignItems: 'center',
  },
  selectedSeat: {
    backgroundColor: '#4F46E5',
  },
  seatText: { color: '#fff', fontWeight: 'bold' },
  createBtn: {
    backgroundColor: '#10B981',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  createText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});