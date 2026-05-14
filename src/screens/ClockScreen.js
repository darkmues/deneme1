import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { bellService } from '../services/bellService';
import BellAnimation from '../components/BellAnimation';
import { useTheme, typography, spacing, borderRadius } from '../theme';
import { useI18n } from '../i18n';
import { usePrayerHours } from '../context/PrayerHoursContext';
import { useResponsive } from '../utils/responsive';

function pad(n) { return String(n).padStart(2, '0'); }

function getNextHour(now, hours) {
  const totalMins = now.getHours() * 60 + now.getMinutes();
  const sorted = [...hours].sort((a, b) => (a.hour * 60 + a.minute) - (b.hour * 60 + b.minute));
  return sorted.find(h => h.hour * 60 + h.minute > totalMins) || sorted[0];
}

function getCountdown(now, target) {
  const nowSecs = (now.getHours() * 60 + now.getMinutes()) * 60 + now.getSeconds();
  let targetSecs = (target.hour * 60 + target.minute) * 60;
  if (targetSecs <= nowSecs - 1) targetSecs += 24 * 3600;
  const diff = targetSecs - nowSecs;
  return `${pad(Math.floor(diff / 3600))}:${pad(Math.floor((diff % 3600) / 60))}:${pad(diff % 60)}`;
}

export default function ClockScreen() {
  const [now, setNow] = useState(new Date());
  const [ringing, setRinging] = useState(false);
  const [prayerModal, setPrayerModal] = useState(null);
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t, locale } = useI18n();
  const { hours } = usePrayerHours();
  const { isTablet } = useResponsive();
  const S = useMemo(() => makeStyles(colors), [colors]);

  useEffect(() => {
    const id = setInterval(() => {
      const n = new Date();
      setNow(n);
      const [h, m, s] = [n.getHours(), n.getMinutes(), n.getSeconds()];
      if (s === 0) {
        const match = hours.find(ch => ch.hour === h && ch.minute === m);
        if (match) {
          setRinging(true);
          setPrayerModal(match);
          bellService.ring(3).finally(() => setRinging(false));
        }
      }
    }, 1000);
    return () => clearInterval(id);
  }, [hours]);

  const nextHour = getNextHour(now, hours);
  const countdown = getCountdown(now, nextHour);

  const ringManually = useCallback(async () => {
    setRinging(true);
    await bellService.ring(1);
    setRinging(false);
  }, []);

  const dateStr = now.toLocaleDateString(locale, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <View style={[S.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={colors.gradientNight} style={S.header}>
        <Text style={S.headerTitle}>{t('app_name')}</Text>
        <Text style={S.headerSub}>{t('subtitle')}</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={[S.scroll, isTablet && S.scrollTablet]}>
        <LinearGradient colors={colors.gradientDark} style={S.clockCard}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={[S.goldBorder, { backgroundColor: colors.primary }]} />
          <Text style={S.dateText}>{dateStr}</Text>
          <Text style={[S.clockText, { color: colors.primary }]}>
            {pad(now.getHours())}:{pad(now.getMinutes())}:{pad(now.getSeconds())}
          </Text>
          <TouchableOpacity onPress={ringManually} activeOpacity={0.7} style={S.bellButton}>
            <BellAnimation ringing={ringing} size={52} />
            <Text style={S.bellHint}>{t('tap_to_ring')}</Text>
          </TouchableOpacity>
        </LinearGradient>

        <View style={S.nextCard}>
          <LinearGradient colors={[nextHour.color + '22', nextHour.color + '08']} style={S.nextCardInner}>
            <View style={S.nextRow}>
              <Text style={S.nextIcon}>{nextHour.icon}</Text>
              <View style={S.nextInfo}>
                <Text style={S.nextLabel}>{t('next_prayer')}</Text>
                <Text style={[S.nextName, { color: nextHour.color }]}>
                  {t(`hours.${nextHour.id}.name`)} • {nextHour.time}
                </Text>
              </View>
              <View style={S.countdownBox}>
                <Text style={S.countdownLabel}>{t('remaining')}</Text>
                <Text style={[S.countdown, { color: nextHour.color }]}>{countdown}</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        <Text style={S.sectionTitle}>{t('todays_schedule')}</Text>
        {hours.map(hour => {
          const passed = now.getHours() * 60 + now.getMinutes() > hour.hour * 60 + hour.minute;
          const isNext = hour.id === nextHour.id;
          return (
            <TouchableOpacity key={hour.id} style={S.hourRow}
              onPress={() => setPrayerModal(hour)} activeOpacity={0.7}>
              <LinearGradient
                colors={isNext ? [hour.color + '25', hour.color + '08'] : [colors.surfaceElevated, colors.surfaceElevated]}
                style={[S.hourRowInner, { borderColor: isNext ? hour.color + '60' : colors.border }]}>
                <Text style={[S.hourIcon, passed && !isNext && S.passed]}>{hour.icon}</Text>
                <View style={S.hourInfo}>
                  <Text style={[S.hourName, { color: passed && !isNext ? colors.textMuted : colors.textPrimary }]}>
                    {t(`hours.${hour.id}.name`)}
                  </Text>
                  <Text style={S.hourLatin}>{hour.latinName}</Text>
                </View>
                <View style={S.hourRight}>
                  <Text style={[S.hourTime, { color: isNext ? hour.color : passed ? colors.textMuted : colors.textSecondary }]}>
                    {hour.time}
                  </Text>
                  {hour.angelus && <Text style={[S.angelusTag, { color: colors.primary }]}>ANGELUS</Text>}
                </View>
                <Ionicons name="chevron-forward" size={14} color={colors.textMuted} style={S.chevron} />
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
        <View style={{ height: insets.bottom + spacing.xxl }} />
      </ScrollView>

      <Modal visible={!!prayerModal} transparent animationType="slide" onRequestClose={() => setPrayerModal(null)}>
        <View style={S.modalOverlay}>
          <View style={S.modalCard}>
            <LinearGradient colors={colors.gradientDark} style={S.modalInner}>
              <Text style={S.modalIcon}>{prayerModal?.icon}</Text>
              <Text style={[S.modalTitle, { color: prayerModal?.color || colors.primary }]}>
                {prayerModal ? t(`hours.${prayerModal.id}.name`) : ''}
              </Text>
              <Text style={S.modalLatin}>{prayerModal?.latinName} • {prayerModal?.time}</Text>
              <View style={S.modalDivider} />
              <ScrollView style={S.modalScroll}>
                <Text style={S.modalPrayer}>{prayerModal ? t(`hours.${prayerModal.id}.prayer`) : ''}</Text>
              </ScrollView>
              <TouchableOpacity style={S.modalClose} onPress={() => setPrayerModal(null)}>
                <LinearGradient colors={colors.gradientGold} style={S.modalCloseGrad}>
                  <Text style={[S.modalCloseText, { color: colors.isDark ? '#000' : '#fff' }]}>{t('close')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const makeStyles = (c) => StyleSheet.create({
  container:      { flex: 1, backgroundColor: c.background },
  header:         { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  headerTitle:    { fontSize: typography.fontSizes.xl, fontWeight: typography.fontWeights.bold, color: c.primary },
  headerSub:      { fontSize: typography.fontSizes.xs, color: c.textMuted, marginTop: 2 },
  scroll:         { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  scrollTablet:   { paddingHorizontal: spacing.xl * 2 },
  clockCard:      { borderRadius: borderRadius.xl, padding: spacing.xl, alignItems: 'center', marginBottom: spacing.lg, overflow: 'hidden', borderWidth: 1, borderColor: c.border },
  goldBorder:     { position: 'absolute', top: 0, left: 0, right: 0, height: 2 },
  dateText:       { fontSize: typography.fontSizes.sm, color: c.textSecondary, marginBottom: spacing.sm, textAlign: 'center' },
  clockText:      { fontSize: 60, fontWeight: typography.fontWeights.heavy, fontVariant: ['tabular-nums'], letterSpacing: 4 },
  bellButton:     { alignItems: 'center', marginTop: spacing.lg, gap: spacing.xs },
  bellHint:       { fontSize: typography.fontSizes.xs, color: c.textMuted },
  nextCard:       { marginBottom: spacing.lg, borderRadius: borderRadius.lg, overflow: 'hidden', borderWidth: 1, borderColor: c.border },
  nextCardInner:  { padding: spacing.md },
  nextRow:        { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  nextIcon:       { fontSize: 32 },
  nextInfo:       { flex: 1 },
  nextLabel:      { fontSize: typography.fontSizes.xs, color: c.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  nextName:       { fontSize: typography.fontSizes.md, fontWeight: typography.fontWeights.semibold, marginTop: 2 },
  countdownBox:   { alignItems: 'flex-end' },
  countdownLabel: { fontSize: typography.fontSizes.xs, color: c.textMuted },
  countdown:      { fontSize: typography.fontSizes.lg, fontWeight: typography.fontWeights.bold, fontVariant: ['tabular-nums'] },
  sectionTitle:   { fontSize: typography.fontSizes.xs, color: c.textMuted, fontWeight: typography.fontWeights.semibold, letterSpacing: 1, marginBottom: spacing.sm, textTransform: 'uppercase' },
  hourRow:        { marginBottom: spacing.sm },
  hourRowInner:   { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, borderRadius: borderRadius.md, borderWidth: 1 },
  hourIcon:       { fontSize: 22 },
  hourInfo:       { flex: 1 },
  hourName:       { fontSize: typography.fontSizes.sm, fontWeight: typography.fontWeights.medium },
  hourLatin:      { fontSize: typography.fontSizes.xs, color: c.textMuted, marginTop: 1 },
  hourRight:      { alignItems: 'flex-end', gap: 2 },
  hourTime:       { fontSize: typography.fontSizes.sm, fontWeight: typography.fontWeights.semibold, fontVariant: ['tabular-nums'] },
  angelusTag:     { fontSize: 9, fontWeight: typography.fontWeights.bold, letterSpacing: 0.5 },
  chevron:        { marginLeft: spacing.xs },
  passed:         { opacity: 0.35 },
  modalOverlay:   { flex: 1, backgroundColor: '#000000AA', justifyContent: 'flex-end' },
  modalCard:      { borderTopLeftRadius: borderRadius.xl, borderTopRightRadius: borderRadius.xl, overflow: 'hidden', maxHeight: '80%' },
  modalInner:     { padding: spacing.xl },
  modalIcon:      { fontSize: 48, textAlign: 'center', marginBottom: spacing.sm },
  modalTitle:     { fontSize: typography.fontSizes.xl, fontWeight: typography.fontWeights.bold, textAlign: 'center' },
  modalLatin:     { fontSize: typography.fontSizes.xs, color: c.textMuted, textAlign: 'center', marginTop: 4 },
  modalDivider:   { height: 1, backgroundColor: c.border, marginVertical: spacing.lg },
  modalScroll:    { maxHeight: 280 },
  modalPrayer:    { fontSize: typography.fontSizes.md, color: c.textPrimary, lineHeight: 26, textAlign: 'center' },
  modalClose:     { marginTop: spacing.lg, borderRadius: borderRadius.full, overflow: 'hidden' },
  modalCloseGrad: { paddingVertical: spacing.md, alignItems: 'center' },
  modalCloseText: { fontSize: typography.fontSizes.md, fontWeight: typography.fontWeights.bold },
});
