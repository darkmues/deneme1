import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { notificationService } from '../services/notificationService';
import { bellService } from '../services/bellService';
import { colors, typography, spacing, borderRadius } from '../theme';
import { useI18n, LANGUAGES } from '../i18n';

const SETTINGS_KEY = '@settings_v1';
const DEFAULT = { notifications: false, bellSound: true, angelusOnly: false };

export default function SettingsScreen() {
  const [settings, setSettings] = useState(DEFAULT);
  const insets = useSafeAreaInsets();
  const { t, locale, changeLocale } = useI18n();

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    try {
      const raw = await AsyncStorage.getItem(SETTINGS_KEY);
      if (raw) setSettings({ ...DEFAULT, ...JSON.parse(raw) });
    } catch {}
  };

  const update = async (key, value) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next));

    if (key === 'notifications' && value) {
      const granted = await notificationService.requestPermission();
      if (!granted) {
        Alert.alert(t('notification_permission_title'), t('permission_deny_msg'));
        const reverted = { ...next, notifications: false };
        setSettings(reverted);
        await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(reverted));
      }
    }
  };

  const testBell = () => bellService.ring(3);

  const resetAll = () => {
    notificationService.cancelAll();
    Alert.alert(t('bg_notifications_title'), t('bg_notifications_msg'));
  };

  const reschedule = async () => {
    const granted = await notificationService.requestPermission();
    if (granted) {
      await notificationService.scheduleAll(settings);
      Alert.alert(t('bg_notifications_title'), t('bg_notifications_msg'));
    } else {
      Alert.alert(t('notification_permission_title'), t('permission_deny_msg'));
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#0D0D1A', '#13131F']} style={styles.header}>
        <Text style={styles.headerTitle}>{t('settings_title')}</Text>
        <Text style={styles.headerSub}>{t('settings_subtitle')}</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Language */}
        <Text style={styles.sectionTitle}>{t('language_section')}</Text>
        <View style={styles.langGrid}>
          {LANGUAGES.map(lang => {
            const active = locale === lang.code;
            return (
              <TouchableOpacity key={lang.code} onPress={() => changeLocale(lang.code)}
                activeOpacity={0.7} style={styles.langItem}>
                <LinearGradient
                  colors={active ? [colors.primaryFaint, colors.primaryFaint] : ['#1C1C2E', '#1C1C2E']}
                  style={[styles.langItemInner, active && { borderColor: colors.primary }]}>
                  <Text style={styles.langFlag}>{lang.flag}</Text>
                  <Text style={[styles.langName, active && { color: colors.primary }]}>{lang.name}</Text>
                  {active && <Ionicons name="checkmark-circle" size={14} color={colors.primary} />}
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Sound */}
        <Text style={styles.sectionTitle}>{t('sound_section')}</Text>
        <View style={styles.group}>
          <SettingRow icon="volume-high" label={t('bell_sound')} desc={t('bell_sound_desc')}
            value={settings.bellSound} onValueChange={v => update('bellSound', v)} />
        </View>

        <TouchableOpacity onPress={testBell} style={styles.actionButton} activeOpacity={0.8}>
          <LinearGradient colors={['#1C1C2E', '#252538']} style={styles.actionButtonInner}>
            <Text style={styles.actionIcon}>🔔</Text>
            <View style={styles.actionText}>
              <Text style={styles.actionLabel}>{t('test_bell_btn')}</Text>
              <Text style={styles.actionDesc}>{t('test_bell_desc')}</Text>
            </View>
            <Ionicons name="play-circle" size={24} color={colors.primary} />
          </LinearGradient>
        </TouchableOpacity>

        {/* Notifications */}
        <Text style={styles.sectionTitle}>{t('notifications_section')}</Text>
        <View style={styles.group}>
          <SettingRow icon="notifications" label={t('canonical_notifications')} desc={t('canonical_notifications_desc')}
            value={settings.notifications} onValueChange={v => update('notifications', v)} />
          <View style={styles.divider} />
          <SettingRow icon="time" label={t('angelus_only')} desc={t('angelus_only_desc')}
            value={settings.angelusOnly} onValueChange={v => update('angelusOnly', v)} />
        </View>

        <TouchableOpacity onPress={reschedule} style={styles.actionButton} activeOpacity={0.8}>
          <LinearGradient colors={[colors.primaryFaint, '#1C1C2E']} style={styles.actionButtonInner}>
            <Text style={styles.actionIcon}>📅</Text>
            <View style={styles.actionText}>
              <Text style={[styles.actionLabel, { color: colors.primary }]}>{t('schedule_notifications')}</Text>
              <Text style={styles.actionDesc}>{t('schedule_notifications_desc')}</Text>
            </View>
            <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
          </LinearGradient>
        </TouchableOpacity>

        {/* About */}
        <Text style={styles.sectionTitle}>{t('about_section')}</Text>
        <View style={styles.group}>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutIcon}>✝</Text>
            <View style={styles.aboutText}>
              <Text style={styles.aboutName}>{t('app_full_name')}</Text>
              <Text style={styles.aboutVersion}>{t('version')}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.aboutInfoRow}>
            <Text style={styles.aboutInfoLabel}>{t('seven_hours_label')}</Text>
            <Text style={styles.aboutInfoValue}>Matins → Completorium</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.aboutInfoRow}>
            <Text style={styles.aboutInfoLabel}>{t('angelus_times_label')}</Text>
            <Text style={styles.aboutInfoValue}>06:00 • 12:00 • 18:00</Text>
          </View>
        </View>

        <TouchableOpacity onPress={resetAll} style={[styles.actionButton, { marginTop: spacing.xl }]} activeOpacity={0.8}>
          <View style={[styles.actionButtonInner, { backgroundColor: colors.error + '15', borderColor: colors.error + '30', borderWidth: 1 }]}>
            <Ionicons name="trash-outline" size={22} color={colors.error} />
            <View style={styles.actionText}>
              <Text style={[styles.actionLabel, { color: colors.error }]}>{t('reset_notifications')}</Text>
              <Text style={styles.actionDesc}>{t('reset_notifications_desc')}</Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={{ height: insets.bottom + spacing.xxl }} />
      </ScrollView>
    </View>
  );
}

function SettingRow({ icon, label, desc, value, onValueChange }) {
  const { colors: c } = { colors };
  return (
    <View style={sRow.row}>
      <View style={sRow.iconBox}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <View style={sRow.text}>
        <Text style={sRow.label}>{label}</Text>
        <Text style={sRow.desc}>{desc}</Text>
      </View>
      <Switch value={value} onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.primaryDark }}
        thumbColor={value ? colors.primary : colors.textMuted} />
    </View>
  );
}

const sRow = StyleSheet.create({
  row:     { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, paddingHorizontal: spacing.md },
  iconBox: { width: 34, height: 34, borderRadius: borderRadius.sm, backgroundColor: colors.primaryFaint, alignItems: 'center', justifyContent: 'center' },
  text:    { flex: 1 },
  label:   { fontSize: typography.fontSizes.md, fontWeight: typography.fontWeights.medium, color: colors.textPrimary },
  desc:    { fontSize: typography.fontSizes.xs, color: colors.textMuted, marginTop: 2 },
});

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: colors.background },
  header:           { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  headerTitle:      { fontSize: typography.fontSizes.xl, fontWeight: typography.fontWeights.bold, color: colors.primary },
  headerSub:        { fontSize: typography.fontSizes.xs, color: colors.textMuted, marginTop: 2 },
  scroll:           { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  sectionTitle:     { fontSize: typography.fontSizes.xs, color: colors.textMuted, fontWeight: typography.fontWeights.bold, letterSpacing: 1, textTransform: 'uppercase', marginBottom: spacing.sm, marginTop: spacing.lg },
  group:            { backgroundColor: colors.surfaceElevated, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm, overflow: 'hidden' },
  divider:          { height: 1, backgroundColor: colors.border, marginHorizontal: spacing.md },
  actionButton:     { borderRadius: borderRadius.lg, overflow: 'hidden', marginBottom: spacing.sm },
  actionButtonInner: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: borderRadius.lg },
  actionIcon:       { fontSize: 24 },
  actionText:       { flex: 1 },
  actionLabel:      { fontSize: typography.fontSizes.md, fontWeight: typography.fontWeights.medium, color: colors.textPrimary },
  actionDesc:       { fontSize: typography.fontSizes.xs, color: colors.textMuted, marginTop: 2 },
  aboutRow:         { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md },
  aboutIcon:        { fontSize: 32, color: colors.primary },
  aboutText:        { flex: 1 },
  aboutName:        { fontSize: typography.fontSizes.md, fontWeight: typography.fontWeights.bold, color: colors.textPrimary },
  aboutVersion:     { fontSize: typography.fontSizes.xs, color: colors.textMuted, marginTop: 2 },
  aboutInfoRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  aboutInfoLabel:   { fontSize: typography.fontSizes.sm, color: colors.textMuted },
  aboutInfoValue:   { fontSize: typography.fontSizes.sm, color: colors.textSecondary, fontWeight: typography.fontWeights.medium },
  langGrid:         { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm },
  langItem:         { width: '47%', borderRadius: borderRadius.md, overflow: 'hidden' },
  langItemInner:    { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, padding: spacing.sm, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border },
  langFlag:         { fontSize: 18 },
  langName:         { flex: 1, fontSize: typography.fontSizes.xs, color: colors.textSecondary, fontWeight: typography.fontWeights.medium },
});
