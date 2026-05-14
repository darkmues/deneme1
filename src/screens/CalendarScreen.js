import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, typography, spacing, borderRadius } from '../theme';
import { useI18n } from '../i18n';
import { getUpcomingFeasts, getFeastsForYear, daysUntil } from '../utils/liturgicalCalendar';

function pad(n) { return String(n).padStart(2, '0'); }

export default function CalendarScreen() {
  const { colors } = useTheme();
  const { t, locale } = useI18n();
  const insets = useSafeAreaInsets();

  const upcoming = useMemo(() => getUpcomingFeasts(12), []);
  const year = new Date().getFullYear();
  const allFeasts = useMemo(() => getFeastsForYear(year), [year]);

  const S = useMemo(() => makeStyles(colors), [colors]);

  const formatDate = (date) => date.toLocaleDateString(locale, {
    day: 'numeric', month: 'long',
  });

  return (
    <View style={[S.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={colors.gradientNight} style={S.header}>
        <Text style={S.headerTitle}>{t('calendar_title')}</Text>
        <Text style={S.headerSub}>{t('calendar_subtitle')}</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={S.scroll}>
        {/* Next feast highlight */}
        {upcoming[0] && (() => {
          const days = daysUntil(upcoming[0].date);
          return (
            <LinearGradient colors={[colors.primaryFaint, colors.gradientDark[1]]}
              style={S.nextFeastCard}>
              <Text style={S.nextFeastIcon}>{upcoming[0].icon}</Text>
              <View style={S.nextFeastInfo}>
                <Text style={S.nextFeastLabel}>{t('next_feast')}</Text>
                <Text style={[S.nextFeastName, { color: colors.primary }]}>
                  {t(upcoming[0].nameKey)}
                </Text>
                <Text style={S.nextFeastDate}>{formatDate(upcoming[0].date)}</Text>
              </View>
              <View style={S.daysBox}>
                <Text style={[S.daysNum, { color: colors.primary }]}>{days}</Text>
                <Text style={S.daysLabel}>{t('days_away')}</Text>
              </View>
            </LinearGradient>
          );
        })()}

        {/* Upcoming feasts list */}
        <Text style={S.sectionTitle}>{t('upcoming_feasts')}</Text>
        {upcoming.map((feast, idx) => {
          const days = daysUntil(feast.date);
          const isToday = days === 0;
          return (
            <View key={`${feast.nameKey}-${idx}`} style={S.feastRow}>
              <LinearGradient
                colors={isToday ? [colors.primaryFaint, colors.gradientDark[1]] : [colors.surfaceElevated, colors.surfaceElevated]}
                style={[S.feastRowInner, isToday && { borderColor: colors.primary + '60' }]}>
                <Text style={S.feastIcon}>{feast.icon}</Text>
                <View style={S.feastInfo}>
                  <Text style={[S.feastName, isToday && { color: colors.primary }]}>{t(feast.nameKey)}</Text>
                  <Text style={S.feastDate}>{formatDate(feast.date)}</Text>
                </View>
                <View style={S.feastRight}>
                  {isToday
                    ? <Text style={[S.todayTag, { color: colors.primary }]}>{t('today')}</Text>
                    : <Text style={S.daysTag}>{days} {t('days_short')}</Text>}
                </View>
              </LinearGradient>
            </View>
          );
        })}

        {/* Full year list */}
        <Text style={S.sectionTitle}>{year} {t('all_feasts')}</Text>
        {allFeasts.map((feast, idx) => {
          const days = daysUntil(feast.date);
          const isPast = days < 0;
          return (
            <View key={`all-${feast.nameKey}-${idx}`} style={[S.feastRow, isPast && { opacity: 0.4 }]}>
              <View style={S.feastRowSimple}>
                <Text style={S.feastIconSm}>{feast.icon}</Text>
                <View style={S.feastInfo}>
                  <Text style={[S.feastNameSm, isPast && { color: colors.textMuted }]}>{t(feast.nameKey)}</Text>
                  <Text style={S.feastDate}>{formatDate(feast.date)}</Text>
                </View>
                {!isPast && days === 0 && <Text style={[S.todayTag, { color: colors.primary }]}>{t('today')}</Text>}
              </View>
            </View>
          );
        })}

        <View style={{ height: insets.bottom + spacing.xxl }} />
      </ScrollView>
    </View>
  );
}

const makeStyles = (c) => StyleSheet.create({
  container:      { flex: 1, backgroundColor: c.background },
  header:         { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  headerTitle:    { fontSize: typography.fontSizes.xl, fontWeight: typography.fontWeights.bold, color: c.primary },
  headerSub:      { fontSize: typography.fontSizes.xs, color: c.textMuted, marginTop: 2 },
  scroll:         { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  sectionTitle:   { fontSize: typography.fontSizes.xs, color: c.textMuted, fontWeight: typography.fontWeights.bold, letterSpacing: 1, textTransform: 'uppercase', marginBottom: spacing.sm, marginTop: spacing.lg },
  nextFeastCard:  { borderRadius: borderRadius.xl, padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: c.border },
  nextFeastIcon:  { fontSize: 40 },
  nextFeastInfo:  { flex: 1 },
  nextFeastLabel: { fontSize: typography.fontSizes.xs, color: c.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  nextFeastName:  { fontSize: typography.fontSizes.lg, fontWeight: typography.fontWeights.bold, marginTop: 2 },
  nextFeastDate:  { fontSize: typography.fontSizes.xs, color: c.textSecondary, marginTop: 2 },
  daysBox:        { alignItems: 'center' },
  daysNum:        { fontSize: typography.fontSizes.huge, fontWeight: typography.fontWeights.heavy },
  daysLabel:      { fontSize: typography.fontSizes.xs, color: c.textMuted },
  feastRow:       { marginBottom: spacing.sm },
  feastRowInner:  { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, borderColor: c.border },
  feastRowSimple: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, backgroundColor: c.surfaceElevated, borderRadius: borderRadius.sm, borderWidth: 1, borderColor: c.border },
  feastIcon:      { fontSize: 26 },
  feastIconSm:    { fontSize: 18 },
  feastInfo:      { flex: 1 },
  feastName:      { fontSize: typography.fontSizes.md, fontWeight: typography.fontWeights.medium, color: c.textPrimary },
  feastNameSm:    { fontSize: typography.fontSizes.sm, fontWeight: typography.fontWeights.medium, color: c.textPrimary },
  feastDate:      { fontSize: typography.fontSizes.xs, color: c.textMuted, marginTop: 1 },
  feastRight:     { alignItems: 'flex-end' },
  daysTag:        { fontSize: typography.fontSizes.xs, color: c.textMuted },
  todayTag:       { fontSize: typography.fontSizes.xs, fontWeight: typography.fontWeights.bold },
});
