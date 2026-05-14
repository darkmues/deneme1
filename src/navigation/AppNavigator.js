import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ChatScreen from '../screens/ChatScreen';
import VoiceScreen from '../screens/VoiceScreen';
import ImageScreen from '../screens/ImageScreen';
import WritingScreen from '../screens/WritingScreen';
import LoginScreen from '../screens/LoginScreen';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';

const Tab = createBottomTabNavigator();

const TabIcon = ({ name, focused, color }) => {
  if (focused) {
    return (
      <LinearGradient
        colors={colors.gradientPrimary}
        style={styles.activeIconContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Ionicons name={name} size={22} color="#fff" />
      </LinearGradient>
    );
  }
  return <Ionicons name={name} size={22} color={color} />;
};

export default function AppNavigator() {
  const { token, isLoading } = useAuth();
  const insets = useSafeAreaInsets();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient colors={colors.gradientPrimary} style={styles.loadingLogo}>
          <Ionicons name="sparkles" size={32} color="#fff" />
        </LinearGradient>
        <ActivityIndicator color={colors.primaryLight} size="large" style={{ marginTop: 24 }} />
      </View>
    );
  }

  if (!token) {
    return <LoginScreen />;
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            height: 60 + (Platform.OS === 'ios' ? insets.bottom : 0),
            paddingBottom: Platform.OS === 'ios' ? insets.bottom : 8,
            paddingTop: 8,
          },
          tabBarActiveTintColor: colors.primaryLight,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: 2 },
        }}
      >
        <Tab.Screen
          name="Chat"
          component={ChatScreen}
          options={{
            tabBarLabel: 'Sohbet',
            tabBarIcon: ({ focused, color }) => (
              <TabIcon name={focused ? 'chatbubbles' : 'chatbubbles-outline'} focused={focused} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Voice"
          component={VoiceScreen}
          options={{
            tabBarLabel: 'Ses',
            tabBarIcon: ({ focused, color }) => (
              <TabIcon name={focused ? 'mic' : 'mic-outline'} focused={focused} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Image"
          component={ImageScreen}
          options={{
            tabBarLabel: 'Görüntü',
            tabBarIcon: ({ focused, color }) => (
              <TabIcon name={focused ? 'image' : 'image-outline'} focused={focused} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Writing"
          component={WritingScreen}
          options={{
            tabBarLabel: 'Yazı',
            tabBarIcon: ({ focused, color }) => (
              <TabIcon name={focused ? 'create' : 'create-outline'} focused={focused} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  activeIconContainer: {
    width: 40,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingLogo: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
