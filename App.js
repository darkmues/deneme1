import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { bellService } from './src/services/bellService';
import { I18nProvider } from './src/i18n';
import { ThemeProvider } from './src/theme';
import { PrayerHoursProvider } from './src/context/PrayerHoursContext';

export default function App() {
  useEffect(() => {
    bellService.init();
  }, []);

  return (
    <I18nProvider>
      <ThemeProvider>
        <PrayerHoursProvider>
          <SafeAreaProvider>
            <StatusBar style="auto" backgroundColor="transparent" translucent />
            <AppNavigator />
          </SafeAreaProvider>
        </PrayerHoursProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}
