import AsyncStorage from '@react-native-async-storage/async-storage';
import { Circle } from '../types';

const KEY = '@SavingsCircle:v1:circles';

export async function loadCircles(): Promise<Circle[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Circle[]) : [];
  } catch {
    return [];
  }
}

export async function saveCircles(circles: Circle[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(circles));
}

export async function clearAllData(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}
