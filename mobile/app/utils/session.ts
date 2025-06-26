import AsyncStorage from '@react-native-async-storage/async-storage';

// session.ts: Provides session/token helpers for robust error and session handling throughout the app.

export const getToken = async () => {
  return await AsyncStorage.getItem('token');
};

export const getRole = async () => {
  return await AsyncStorage.getItem('role');
};

export const logout = async () => {
  await AsyncStorage.removeItem('token');
  await AsyncStorage.removeItem('role');
};

export default {};
