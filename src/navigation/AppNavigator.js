import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Platform, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ClockScreen from '../screens/ClockScreen';
import HoursScreen from '../screens/HoursScreen';
import RemindersScreen from '../screens/RemindersScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { colors } from '../theme';
import { useI18n } from '../i18n';

const Tab = createBottomTabNavigator();

function GoldTabIcon({ name, focused }) {
  if (focused) {
    return (
      <LinearGradient colors={colors.gradientGold} style={styles.activeIcon}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <Ionicons name={name} size={20} color="#000" />
      </LinearGradient>
    );
  }
  return <Ionicons name={name} size={22} color={colors.textMuted} />;
}

function TabLabel({ labelKey, color }) {
  const { t } = useI18n();
  return <Text style={[styles.tabLabel, { color }]}>{t(labelKey)}</Text>;
}

export default function AppNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            height: 56 + (Platform.OS === 'ios' ? insets.bottom : 0),
            paddingBottom: Platform.OS === 'ios' ? insets.bottom : 6,
            paddingTop: 6,
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
        }}
      >
        <Tab.Screen name="Clock" component={ClockScreen} options={{
          tabBarLabel: ({ color }) => <TabLabel labelKey="tab_clock" color={color} />,
          tabBarIcon: ({ focused }) => <GoldTabIcon name={focused ? 'time' : 'time-outline'} focused={focused} />,
        }} />
        <Tab.Screen name="Hours" component={HoursScreen} options={{
          tabBarLabel: ({ color }) => <TabLabel labelKey="tab_hours" color={color} />,
          tabBarIcon: ({ focused }) => <GoldTabIcon name={focused ? 'book' : 'book-outline'} focused={focused} />,
        }} />
        <Tab.Screen name="Reminders" component={RemindersScreen} options={{
          tabBarLabel: ({ color }) => <TabLabel labelKey="tab_reminders" color={color} />,
          tabBarIcon: ({ focused }) => <GoldTabIcon name={focused ? 'notifications' : 'notifications-outline'} focused={focused} />,
        }} />
        <Tab.Screen name="Settings" component={SettingsScreen} options={{
          tabBarLabel: ({ color }) => <TabLabel labelKey="tab_settings" color={color} />,
          tabBarIcon: ({ focused }) => <GoldTabIcon name={focused ? 'settings' : 'settings-outline'} focused={focused} />,
        }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  activeIcon: { width: 38, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  tabLabel:   { fontSize: 10, fontWeight: '600', marginTop: 2 },
});
