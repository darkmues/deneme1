import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import OnboardingScreen from './src/screens/OnboardingScreen';
import { bellService } from './src/services/bellService';
import { I18nProvider } from './src/i18n';
import { ThemeProvider } from './src/theme';
import { PrayerHoursProvider } from './src/context/PrayerHoursContext';
import { DenominationProvider, useDenomination } from './src/context/DenominationContext';

function Root() {
  const { denomination, isReady } = useDenomination();
  if (!isReady) return <View style={{ flex: 1 }} />;
  if (!denomination) return <OnboardingScreen />;
  return <AppNavigator />;
}

export default function App() {
  useEffect(() => { bellService.init(); }, []);

  return (
    <I18nProvider>
      <ThemeProvider>
        <DenominationProvider>
          <PrayerHoursProvider>
            <SafeAreaProvider>
              <StatusBar style="auto" backgroundColor="transparent" translucent />
              <Root />
            </SafeAreaProvider>
          </PrayerHoursProvider>
        </DenominationProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}
