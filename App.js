import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { bellService } from './src/services/bellService';

export default function App() {
  useEffect(() => {
    bellService.init();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor="transparent" translucent />
      <AppNavigator />
    </SafeAreaProvider>
  );
}
