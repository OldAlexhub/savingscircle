import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AdsProvider } from './src/ads/AdsContext';
import { CircleProvider } from './src/store/CircleContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AdsProvider>
        <CircleProvider>
          <AppNavigator />
        </CircleProvider>
      </AdsProvider>
    </SafeAreaProvider>
  );
}
