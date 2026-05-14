import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { notificationService } from '../services/notificationService';
import { bellService } from '../services/bellService';
import { useTheme, THEME_META, typography, spacing, borderRadius } from '../theme';
import { useI18n, LANGUAGES } from '../i18n';

const SETTINGS_KEY = '@settings_v1';
const DEFAULT = { notifications: false, bellSound: true, angelusOnly: false };

export default function SettingsScreen() {
  const [settings, setSettings] = useState(DEFAULT);
  const insets = useSafeAreaInsets();
  const { colors, themeName, changeTheme } = useTheme();
  const { t, locale, changeLocale } = useI18n();
  const S = useMemo(() => makeStyles(colors), [colors]);

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
    <View style={[S.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={colors.gradientNight} style={S.header}>
        <Text style={S.headerTitle}>{t('settings_title')}</Text>
        <Text style={S.headerSub}>{t('settings_subtitle')}</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={S.scroll}>
        {/* Language */}
        <Text style={S.sectionTitle}>{t('language_section')}</Text>
        <View style={S.langGrid}>
          {LANGUAGES.map(lang => {
            const active = locale === lang.code;
            return (
              <TouchableOpacity key={lang.code} onPress={() => changeLocale(lang.code)}
                activeOpacity={0.7} style={S.langItem}>
                <LinearGradient
                  colors={active ? [colors.primaryFaint, colors.primaryFaint] : [colors.surfaceElevated, colors.surfaceElevated]}
                  style={[S.langItemInner, active && { borderColor: colors.primary }]}>
                  <Text style={S.langFlag}>{lang.flag}</Text>
                  <Text style={[S.langName, active && { color: colors.primary }]}>{lang.name}</Text>
                  {active && <Ionicons name="checkmark-circle" size={14} color={colors.primary} />}
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Theme */}
        <Text style={S.sectionTitle}>{t('theme_section')}</Text>
        <View style={S.themeGrid}>
          {THEME_META.map(meta => {
            const active = themeName === meta.key;
            return (
              <TouchableOpacity key={meta.key} onPress={() => changeTheme(meta.key)}
                activeOpacity={0.7} style={S.themeItem}>
                <View style={[S.themeCard, active && { borderColor: colors.primary, borderWidth: 2 }]}>
                  <LinearGradient colors={meta.preview} style={S.themePreview} />
                  <Text style={[S.themeName, { color: active ? colors.primary : colors.textSecondary }]}>
                    {t(meta.labelKey)}
                  </Text>
                  {active && <Ionicons name="checkmark-circle" size={16} color={colors.primary} style={S.themeCheck} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Sound */}
        <Text style={S.sectionTitle}>{t('sound_section')}</Text>
        <View style={S.group}>
          <SettingRow colors={colors} icon="volume-high" label={t('bell_sound')} desc={t('bell_sound_desc')}
            value={settings.bellSound} onValueChange={v => update('bellSound', v)} />
        </View>

        <TouchableOpacity onPress={testBell} style={S.actionButton} activeOpacity={0.8}>
          <LinearGradient colors={[colors.surfaceElevated, colors.surfaceHigh]} style={S.actionButtonInner}>
            <Text style={S.actionIcon}>🔔</Text>
            <View style={S.actionText}>
              <Text style={S.actionLabel}>{t('test_bell_btn')}</Text>
              <Text style={S.actionDesc}>{t('test_bell_desc')}</Text>
            </View>
            <Ionicons name="play-circle" size={24} color={colors.primary} />
          </LinearGradient>
        </TouchableOpacity>

        {/* Notifications */}
        <Text style={S.sectionTitle}>{t('notifications_section')}</Text>
        <View style={S.group}>
          <SettingRow colors={colors} icon="notifications" label={t('canonical_notifications')} desc={t('canonical_notifications_desc')}
            value={settings.notifications} onValueChange={v => update('notifications', v)} />
          <View style={S.divider} />
          <SettingRow colors={colors} icon="time" label={t('angelus_only')} desc={t('angelus_only_desc')}
            value={settings.angelusOnly} onValueChange={v => update('angelusOnly', v)} />
        </View>

        <TouchableOpacity onPress={reschedule} style={S.actionButton} activeOpacity={0.8}>
          <LinearGradient colors={[colors.primaryFaint, colors.surfaceElevated]} style={S.actionButtonInner}>
            <Text style={S.actionIcon}>📅</Text>
            <View style={S.actionText}>
              <Text style={[S.actionLabel, { color: colors.primary }]}>{t('schedule_notifications')}</Text>
              <Text style={S.actionDesc}>{t('schedule_notifications_desc')}</Text>
            </View>
            <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
          </LinearGradient>
        </TouchableOpacity>

        {/* About */}
        <Text style={S.sectionTitle}>{t('about_section')}</Text>
        <View style={S.group}>
          <View style={S.aboutRow}>
            <Text style={[S.aboutIcon, { color: colors.primary }]}>✝</Text>
            <View style={S.aboutText}>
              <Text style={S.aboutName}>{t('app_full_name')}</Text>
              <Text style={S.aboutVersion}>{t('version')}</Text>
            </View>
          </View>
          <View style={S.divider} />
          <View style={S.aboutInfoRow}>
            <Text style={S.aboutInfoLabel}>{t('seven_hours_label')}</Text>
            <Text style={S.aboutInfoValue}>Matins → Completorium</Text>
          </View>
          <View style={S.divider} />
          <View style={S.aboutInfoRow}>
            <Text style={S.aboutInfoLabel}>{t('angelus_times_label')}</Text>
            <Text style={S.aboutInfoValue}>06:00 • 12:00 • 18:00</Text>
          </View>
        </View>

        <TouchableOpacity onPress={resetAll} style={[S.actionButton, { marginTop: spacing.xl }]} activeOpacity={0.8}>
          <View style={[S.actionButtonInner, { backgroundColor: colors.error + '15', borderColor: colors.error + '30', borderWidth: 1 }]}>
            <Ionicons name="trash-outline" size={22} color={colors.error} />
            <View style={S.actionText}>
              <Text style={[S.actionLabel, { color: colors.error }]}>{t('reset_notifications')}</Text>
              <Text style={S.actionDesc}>{t('reset_notifications_desc')}</Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={{ height: insets.bottom + spacing.xxl }} />
      </ScrollView>
    </View>
  );
}

function SettingRow({ colors, icon, label, desc, value, onValueChange }) {
  return (
    <View style={sRow(colors).row}>
      <View style={sRow(colors).iconBox}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <View style={sRow(colors).text}>
        <Text style={sRow(colors).label}>{label}</Text>
        <Text style={sRow(colors).desc}>{desc}</Text>
      </View>
      <Switch value={value} onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.primaryDark }}
        thumbColor={value ? colors.primary : colors.textMuted} />
    </View>
  );
}

const sRow = (c) => StyleSheet.create({
  row:     { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, paddingHorizontal: spacing.md },
  iconBox: { width: 34, height: 34, borderRadius: borderRadius.sm, backgroundColor: c.primaryFaint, alignItems: 'center', justifyContent: 'center' },
  text:    { flex: 1 },
  label:   { fontSize: typography.fontSizes.md, fontWeight: typography.fontWeights.medium, color: c.textPrimary },
  desc:    { fontSize: typography.fontSizes.xs, color: c.textMuted, marginTop: 2 },
});

const makeStyles = (c) => StyleSheet.create({
  container:        { flex: 1, backgroundColor: c.background },
  header:           { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  headerTitle:      { fontSize: typography.fontSizes.xl, fontWeight: typography.fontWeights.bold, color: c.primary },
  headerSub:        { fontSize: typography.fontSizes.xs, color: c.textMuted, marginTop: 2 },
  scroll:           { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  sectionTitle:     { fontSize: typography.fontSizes.xs, color: c.textMuted, fontWeight: typography.fontWeights.bold, letterSpacing: 1, textTransform: 'uppercase', marginBottom: spacing.sm, marginTop: spacing.lg },
  group:            { backgroundColor: c.surfaceElevated, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: c.border, marginBottom: spacing.sm, overflow: 'hidden' },
  divider:          { height: 1, backgroundColor: c.border, marginHorizontal: spacing.md },
  actionButton:     { borderRadius: borderRadius.lg, overflow: 'hidden', marginBottom: spacing.sm },
  actionButtonInner: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: borderRadius.lg },
  actionIcon:       { fontSize: 24 },
  actionText:       { flex: 1 },
  actionLabel:      { fontSize: typography.fontSizes.md, fontWeight: typography.fontWeights.medium, color: c.textPrimary },
  actionDesc:       { fontSize: typography.fontSizes.xs, color: c.textMuted, marginTop: 2 },
  aboutRow:         { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md },
  aboutIcon:        { fontSize: 32 },
  aboutText:        { flex: 1 },
  aboutName:        { fontSize: typography.fontSizes.md, fontWeight: typography.fontWeights.bold, color: c.textPrimary },
  aboutVersion:     { fontSize: typography.fontSizes.xs, color: c.textMuted, marginTop: 2 },
  aboutInfoRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  aboutInfoLabel:   { fontSize: typography.fontSizes.sm, color: c.textMuted },
  aboutInfoValue:   { fontSize: typography.fontSizes.sm, color: c.textSecondary, fontWeight: typography.fontWeights.medium },
  langGrid:         { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm },
  langItem:         { width: '47%', borderRadius: borderRadius.md, overflow: 'hidden' },
  langItemInner:    { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, padding: spacing.sm, borderRadius: borderRadius.md, borderWidth: 1, borderColor: c.border },
  langFlag:         { fontSize: 18 },
  langName:         { flex: 1, fontSize: typography.fontSizes.xs, color: c.textSecondary, fontWeight: typography.fontWeights.medium },
  themeGrid:        { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  themeItem:        { flex: 1 },
  themeCard:        { borderRadius: borderRadius.md, overflow: 'hidden', borderWidth: 1, borderColor: c.border, backgroundColor: c.surfaceElevated },
  themePreview:     { height: 48, width: '100%' },
  themeName:        { fontSize: typography.fontSizes.xs, fontWeight: typography.fontWeights.medium, textAlign: 'center', paddingVertical: spacing.xs },
  themeCheck:       { position: 'absolute', top: 4, right: 4 },
});
