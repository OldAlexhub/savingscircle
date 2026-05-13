import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CircleProvider } from './src/store/CircleContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <CircleProvider>
        <AppNavigator />
      </CircleProvider>
    </SafeAreaProvider>
  );
}
