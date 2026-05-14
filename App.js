import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { bellService } from './src/services/bellService';
import { notificationService } from './src/services/notificationService';

export default function App() {
  useEffect(() => {
    bellService.init();
    notificationService.requestPermissions().then(granted => {
      if (granted) notificationService.scheduleCanonicalHours(true);
    });
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor="transparent" translucent />
      <AppNavigator />
    </SafeAreaProvider>
  );
}
