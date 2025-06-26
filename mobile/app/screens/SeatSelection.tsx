import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import axios from 'axios';
import { getToken } from '../utils/session';
import { API_BASE_URL } from '../utils/config';

// SeatSelection: Fetches seats for the selected table dynamically from backend. Uses correct seat IDs. Types match backend DTOs. Robust error/session handling included.

type Seat = { id: number; seatNumber: string };

type Table = { id: number; tableNumber: number; seats: Seat[] };

export default function SeatSelection() {
  const { tableId } = useLocalSearchParams<{ tableId: string }>();
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSeats = async () => {
      setError(null);
      try {
        const token = await getToken();
        if (!token) throw new Error('Session expired. Please log in again.');
        const res = await axios.get(`${API_BASE_URL}/api/tables`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const table = res.data.find((t: Table) => t.id.toString() === tableId);
        if (!table) {
          setError('Table not found');
          setSeats([]);
        } else {
          setSeats(table.seats);
        }
      } catch (err) {
        setError('Failed to fetch seats');
        setSeats([]);
      }
    };
    fetchSeats();
  }, [tableId]);

  const toggleSeat = (seatId: number) => {
    setSelectedSeats(prev =>
      prev.includes(seatId) ? prev.filter(s => s !== seatId) : [...prev, seatId]
    );
  };

  const handleCreateGroup = async () => {
    if (selectedSeats.length === 0) {
      setError('Select at least one seat');
      return;
    }
    try {
      const token = await getToken();
      if (!token) {
        setError('Session expired. Please log in again.');
        setTimeout(() => router.replace('/screens/LoginScreen'), 1500);
        return;
      }
      const res = await axios.post(
        `${API_BASE_URL}/api/groups/create?tableId=${tableId}`,
        selectedSeats,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const groupId = res.data.id;
      router.push(`/screens/GroupItemsScreen?groupId=${groupId}`);
    } catch (err: any) {
      if (err.response) {
        setError(`Failed to create group: ${err.response.data.message || err.response.status}`);
      } else {
        setError('Failed to create group');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Select Seats</Text>
      {error && (
        <Text style={{ color: 'red', textAlign: 'center', marginBottom: 10 }}>{error}</Text>
      )}
      <View style={styles.seatsContainer}>
        {seats.map(seat => {
          const isSelected = selectedSeats.includes(seat.id);
          return (
            <Pressable
              key={seat.id}
              style={[styles.seat, isSelected && styles.selectedSeat]}
              onPress={() => toggleSeat(seat.id)}
            >
              <Text style={styles.seatText}>{seat.seatNumber}</Text>
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