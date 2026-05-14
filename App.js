import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { bellService } from './src/services/bellService';
import { I18nProvider } from './src/i18n';

export default function App() {
  useEffect(() => {
    bellService.init();
  }, []);

  return (
    <I18nProvider>
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor="transparent" translucent />
        <AppNavigator />
      </SafeAreaProvider>
    </I18nProvider>
  );
}
