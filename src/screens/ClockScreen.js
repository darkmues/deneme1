import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CANONICAL_HOURS } from '../data/prayers';
import { bellService } from '../services/bellService';
import BellAnimation from '../components/BellAnimation';
import { colors, typography, spacing, borderRadius } from '../theme';

const DAYS_TR = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
const MONTHS_TR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

function pad(n) { return String(n).padStart(2, '0'); }

function getNextHour(now) {
  const totalMins = now.getHours() * 60 + now.getMinutes();
  const sorted = [...CANONICAL_HOURS].sort((a, b) => (a.hour * 60 + a.minute) - (b.hour * 60 + b.minute));
  const next = sorted.find(h => h.hour * 60 + h.minute > totalMins);
  return next || sorted[0];
}

function getCountdown(now, targetHour) {
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const nowSecs = nowMins * 60 + now.getSeconds();
  let targetSecs = (targetHour.hour * 60 + targetHour.minute) * 60;
  if (targetSecs <= nowMins * 60) targetSecs += 24 * 3600;
  const diff = targetSecs - nowSecs;
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const s = diff % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export default function ClockScreen() {
  const [now, setNow] = useState(new Date());
  const [ringing, setRinging] = useState(false);
  const [prayerModal, setPrayerModal] = useState(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const id = setInterval(() => {
      const n = new Date();
      setNow(n);
      const h = n.getHours(), m = n.getMinutes(), s = n.getSeconds();
      if (s === 0) {
        const match = CANONICAL_HOURS.find(ch => ch.hour === h && ch.minute === m);
        if (match) {
          setRinging(true);
          setPrayerModal(match);
          bellService.ring(3).finally(() => setRinging(false));
        }
      }
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const nextHour = getNextHour(now);
  const countdown = getCountdown(now, nextHour);

  const ringManually = useCallback(async () => {
    setRinging(true);
    await bellService.ring(1);
    setRinging(false);
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header gradient strip */}
      <LinearGradient colors={['#0D0D1A', '#13131F']} style={styles.header}>
        <Text style={styles.headerTitle}>✝ Çan Saati</Text>
        <Text style={styles.headerSub}>Hristiyan Dua Takvimi</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Big clock card */}
        <LinearGradient colors={['#1C1C2E', '#13131F']} style={styles.clockCard}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.goldBorder} />

          <Text style={styles.dateText}>
            {DAYS_TR[now.getDay()]}, {now.getDate()} {MONTHS_TR[now.getMonth()]} {now.getFullYear()}
          </Text>
          <Text style={styles.clockText}>
            {pad(now.getHours())}:{pad(now.getMinutes())}:{pad(now.getSeconds())}
          </Text>

          <TouchableOpacity onPress={ringManually} activeOpacity={0.7} style={styles.bellButton}>
            <BellAnimation ringing={ringing} size={52} />
            <Text style={styles.bellHint}>Çalmak için dokun</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Next prayer */}
        <View style={styles.nextCard}>
          <LinearGradient colors={[nextHour.color + '22', nextHour.color + '08']}
            style={styles.nextCardInner}>
            <View style={styles.nextRow}>
              <Text style={styles.nextIcon}>{nextHour.icon}</Text>
              <View style={styles.nextInfo}>
                <Text style={styles.nextLabel}>Sonraki Dua Saati</Text>
                <Text style={[styles.nextName, { color: nextHour.color }]}>
                  {nextHour.turkishName} • {nextHour.time}
                </Text>
              </View>
              <View style={styles.countdownBox}>
                <Text style={styles.countdownLabel}>Kalan</Text>
                <Text style={[styles.countdown, { color: nextHour.color }]}>{countdown}</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Today's schedule */}
        <Text style={styles.sectionTitle}>BUGÜNÜN PROGRAMI</Text>
        {CANONICAL_HOURS.map(hour => {
          const passed = now.getHours() * 60 + now.getMinutes() > hour.hour * 60 + hour.minute;
          const isNext = hour.id === nextHour.id;
          return (
            <TouchableOpacity key={hour.id} style={styles.hourRow}
              onPress={() => setPrayerModal(hour)} activeOpacity={0.7}>
              <LinearGradient
                colors={isNext ? [hour.color + '25', hour.color + '08'] : ['#1C1C2E', '#1C1C2E']}
                style={[styles.hourRowInner, isNext && { borderColor: hour.color + '60' }]}>
                <Text style={[styles.hourIcon, passed && !isNext && styles.passed]}>{hour.icon}</Text>
                <View style={styles.hourInfo}>
                  <Text style={[styles.hourName, passed && !isNext && styles.passed]}>
                    {hour.turkishName}
                  </Text>
                  <Text style={styles.hourLatin}>{hour.latinName}</Text>
                </View>
                <View style={styles.hourRight}>
                  <Text style={[styles.hourTime, { color: isNext ? hour.color : passed ? colors.textMuted : colors.textSecondary }]}>
                    {hour.time}
                  </Text>
                  {hour.angelus && <Text style={styles.angelusTag}>ANGELUS</Text>}
                </View>
                <Ionicons name="chevron-forward" size={14} color={colors.textMuted} style={styles.chevron} />
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
        <View style={{ height: insets.bottom + spacing.xxl }} />
      </ScrollView>

      {/* Prayer modal */}
      <Modal visible={!!prayerModal} transparent animationType="slide" onRequestClose={() => setPrayerModal(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <LinearGradient colors={['#1C1C2E', '#0D0D1A']} style={styles.modalInner}>
              <Text style={styles.modalIcon}>{prayerModal?.icon}</Text>
              <Text style={[styles.modalTitle, { color: prayerModal?.color || colors.primary }]}>
                {prayerModal?.turkishName}
              </Text>
              <Text style={styles.modalLatin}>{prayerModal?.latinName} • {prayerModal?.time}</Text>
              <View style={styles.modalDivider} />
              <ScrollView style={styles.modalScroll}>
                <Text style={styles.modalPrayer}>{prayerModal?.prayer}</Text>
              </ScrollView>
              <TouchableOpacity style={styles.modalClose} onPress={() => setPrayerModal(null)}>
                <LinearGradient colors={colors.gradientGold} style={styles.modalCloseGrad}>
                  <Text style={styles.modalCloseText}>Kapat</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: colors.background },
  header:       { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  headerTitle:  { fontSize: typography.fontSizes.xl, fontWeight: typography.fontWeights.bold, color: colors.primary },
  headerSub:    { fontSize: typography.fontSizes.xs, color: colors.textMuted, marginTop: 2 },
  scroll:       { paddingHorizontal: spacing.lg, paddingTop: spacing.md },

  clockCard:    { borderRadius: borderRadius.xl, padding: spacing.xl, alignItems: 'center', marginBottom: spacing.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  goldBorder:   { position: 'absolute', top: 0, left: 0, right: 0, height: 2, backgroundColor: colors.primary },
  dateText:     { fontSize: typography.fontSizes.sm, color: colors.textSecondary, marginBottom: spacing.sm },
  clockText:    { fontSize: 60, fontWeight: typography.fontWeights.heavy, color: colors.primary, fontVariant: ['tabular-nums'], letterSpacing: 4 },
  bellButton:   { alignItems: 'center', marginTop: spacing.lg, gap: spacing.xs },
  bellHint:     { fontSize: typography.fontSizes.xs, color: colors.textMuted },

  nextCard:     { marginBottom: spacing.lg, borderRadius: borderRadius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  nextCardInner: { padding: spacing.md },
  nextRow:      { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  nextIcon:     { fontSize: 32 },
  nextInfo:     { flex: 1 },
  nextLabel:    { fontSize: typography.fontSizes.xs, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  nextName:     { fontSize: typography.fontSizes.md, fontWeight: typography.fontWeights.semibold, marginTop: 2 },
  countdownBox: { alignItems: 'flex-end' },
  countdownLabel: { fontSize: typography.fontSizes.xs, color: colors.textMuted },
  countdown:    { fontSize: typography.fontSizes.lg, fontWeight: typography.fontWeights.bold, fontVariant: ['tabular-nums'] },

  sectionTitle: { fontSize: typography.fontSizes.xs, color: colors.textMuted, fontWeight: typography.fontWeights.semibold, letterSpacing: 1, marginBottom: spacing.sm, textTransform: 'uppercase' },

  hourRow:      { marginBottom: spacing.sm },
  hourRowInner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border },
  hourIcon:     { fontSize: 22 },
  hourInfo:     { flex: 1 },
  hourName:     { fontSize: typography.fontSizes.sm, fontWeight: typography.fontWeights.medium, color: colors.textPrimary },
  hourLatin:    { fontSize: typography.fontSizes.xs, color: colors.textMuted, marginTop: 1 },
  hourRight:    { alignItems: 'flex-end', gap: 2 },
  hourTime:     { fontSize: typography.fontSizes.sm, fontWeight: typography.fontWeights.semibold, fontVariant: ['tabular-nums'] },
  angelusTag:   { fontSize: 9, color: colors.primary, fontWeight: typography.fontWeights.bold, letterSpacing: 0.5 },
  chevron:      { marginLeft: spacing.xs },
  passed:       { opacity: 0.35 },

  modalOverlay: { flex: 1, backgroundColor: '#000000AA', justifyContent: 'flex-end' },
  modalCard:    { borderTopLeftRadius: borderRadius.xl, borderTopRightRadius: borderRadius.xl, overflow: 'hidden', maxHeight: '80%' },
  modalInner:   { padding: spacing.xl },
  modalIcon:    { fontSize: 48, textAlign: 'center', marginBottom: spacing.sm },
  modalTitle:   { fontSize: typography.fontSizes.xl, fontWeight: typography.fontWeights.bold, textAlign: 'center' },
  modalLatin:   { fontSize: typography.fontSizes.xs, color: colors.textMuted, textAlign: 'center', marginTop: 4 },
  modalDivider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.lg },
  modalScroll:  { maxHeight: 280 },
  modalPrayer:  { fontSize: typography.fontSizes.md, color: colors.textPrimary, lineHeight: 26, textAlign: 'center' },
  modalClose:   { marginTop: spacing.lg, borderRadius: borderRadius.full, overflow: 'hidden' },
  modalCloseGrad: { paddingVertical: spacing.md, alignItems: 'center' },
  modalCloseText: { fontSize: typography.fontSizes.md, fontWeight: typography.fontWeights.bold, color: '#000' },
});
