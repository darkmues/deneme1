import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CANONICAL_HOURS } from '../data/prayers';
import { bellService } from '../services/bellService';
import { colors, typography, spacing, borderRadius } from '../theme';
import { useI18n } from '../i18n';

export default function HoursScreen() {
  const [selected, setSelected] = useState(null);
  const [showAngelus, setShowAngelus] = useState(false);
  const insets = useSafeAreaInsets();
  const { t } = useI18n();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#0D0D1A', '#13131F']} style={styles.header}>
        <Text style={styles.headerTitle}>{t('hours_title')}</Text>
        <Text style={styles.headerSub}>{t('hours_subtitle')}</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => setShowAngelus(true)} activeOpacity={0.8}>
          <LinearGradient colors={colors.gradientGold} style={styles.angelusButton}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Text style={styles.angelusIcon}>🙏</Text>
            <View style={styles.angelusText}>
              <Text style={styles.angelusTitle}>{t('angelus_prayer')}</Text>
              <Text style={styles.angelusSub}>{t('angelus_read_full')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#000" />
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>{t('seven_canonical')}</Text>

        {CANONICAL_HOURS.map((hour, idx) => (
          <TouchableOpacity key={hour.id} onPress={() => setSelected(hour)} activeOpacity={0.8}
            style={styles.card}>
            <LinearGradient colors={[hour.color + '18', '#1C1C2E']}
              style={styles.cardInner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <View style={[styles.accent, { backgroundColor: hour.color }]} />
              <Text style={styles.cardIcon}>{hour.icon}</Text>
              <View style={styles.cardBody}>
                <View style={styles.cardTop}>
                  <Text style={[styles.cardName, { color: hour.color }]}>{t(`hours.${hour.id}.name`)}</Text>
                  <Text style={styles.cardTime}>{hour.time}</Text>
                </View>
                <Text style={styles.cardLatin}>{hour.latinName}</Text>
                <Text style={styles.cardDesc} numberOfLines={2}>{t(`hours.${hour.id}.description`)}</Text>
              </View>
              <View style={styles.cardRight}>
                {hour.angelus && (
                  <View style={styles.angelusTag}>
                    <Text style={styles.angelusTagText}>ANGELUS</Text>
                  </View>
                )}
                <Text style={styles.cardNumber}>{String(idx + 1).padStart(2, '0')}</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}

        <Text style={styles.sectionTitle}>{t('ring_bell_section')}</Text>
        <View style={styles.ringRow}>
          {[1, 2, 3, 5, 7].map(n => (
            <TouchableOpacity key={n} style={styles.ringButton}
              onPress={() => bellService.ring(n)} activeOpacity={0.7}>
              <LinearGradient colors={['#1C1C2E', '#252538']} style={styles.ringButtonInner}>
                <Text style={styles.ringNumber}>{n}×</Text>
                <Text style={styles.ringBell}>🔔</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: insets.bottom + spacing.xxl }} />
      </ScrollView>

      {/* Hour detail modal */}
      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <LinearGradient colors={['#1C1C2E', '#0D0D1A']} style={styles.modalInner}>
              <View style={[styles.modalAccent, { backgroundColor: selected?.color }]} />
              <Text style={styles.modalIcon}>{selected?.icon}</Text>
              <Text style={[styles.modalTitle, { color: selected?.color }]}>
                {selected ? t(`hours.${selected.id}.name`) : ''}
              </Text>
              <Text style={styles.modalSub}>{selected?.latinName} • {selected?.time}</Text>
              {selected?.angelus && (
                <View style={styles.angelusTag2}>
                  <Text style={styles.angelusTag2Text}>{t('angelus_time_tag')}</Text>
                </View>
              )}
              <View style={styles.divider} />
              <Text style={styles.modalDescLabel}>{t('description')}</Text>
              <Text style={styles.modalDesc}>
                {selected ? t(`hours.${selected.id}.description`) : ''}
              </Text>
              <View style={styles.divider} />
              <Text style={styles.modalDescLabel}>{t('prayer_text')}</Text>
              <ScrollView style={styles.prayerScroll}>
                <Text style={styles.modalPrayer}>
                  {selected ? t(`hours.${selected.id}.prayer`) : ''}
                </Text>
              </ScrollView>
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.bellBtn} onPress={() => bellService.ring(3)} activeOpacity={0.8}>
                  <Text style={styles.bellBtnText}>{t('ring_bell_btn')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.closeBtn} onPress={() => setSelected(null)} activeOpacity={0.8}>
                  <LinearGradient colors={colors.gradientGold} style={styles.closeBtnGrad}>
                    <Text style={styles.closeBtnText}>{t('close')}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </View>
      </Modal>

      {/* Angelus full prayer modal */}
      <Modal visible={showAngelus} transparent animationType="slide" onRequestClose={() => setShowAngelus(false)}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <LinearGradient colors={['#1C1C2E', '#0D0D1A']} style={styles.modalInner}>
              <View style={[styles.modalAccent, { backgroundColor: colors.primary }]} />
              <Text style={styles.modalIcon}>🙏</Text>
              <Text style={[styles.modalTitle, { color: colors.primary }]}>{t('angelus_prayer')}</Text>
              <Text style={styles.modalSub}>06:00 • 12:00 • 18:00</Text>
              <View style={styles.divider} />
              <ScrollView style={styles.prayerScroll}>
                <Text style={styles.modalPrayer}>{t('angelus_full')}</Text>
              </ScrollView>
              <TouchableOpacity style={[styles.closeBtn, { marginTop: spacing.lg }]}
                onPress={() => setShowAngelus(false)} activeOpacity={0.8}>
                <LinearGradient colors={colors.gradientGold} style={styles.closeBtnGrad}>
                  <Text style={styles.closeBtnText}>{t('close')}</Text>
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
  container:      { flex: 1, backgroundColor: colors.background },
  header:         { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  headerTitle:    { fontSize: typography.fontSizes.xl, fontWeight: typography.fontWeights.bold, color: colors.primary },
  headerSub:      { fontSize: typography.fontSizes.xs, color: colors.textMuted, marginTop: 2 },
  scroll:         { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  sectionTitle:   { fontSize: typography.fontSizes.xs, color: colors.textMuted, fontWeight: typography.fontWeights.bold, letterSpacing: 1, textTransform: 'uppercase', marginBottom: spacing.sm, marginTop: spacing.lg },
  angelusButton:  { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: borderRadius.lg, marginBottom: spacing.sm },
  angelusIcon:    { fontSize: 28 },
  angelusText:    { flex: 1 },
  angelusTitle:   { fontSize: typography.fontSizes.md, fontWeight: typography.fontWeights.bold, color: '#000' },
  angelusSub:     { fontSize: typography.fontSizes.xs, color: '#00000088', marginTop: 2 },
  card:           { marginBottom: spacing.sm },
  cardInner:      { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, padding: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  accent:         { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3 },
  cardIcon:       { fontSize: 26, paddingTop: 2 },
  cardBody:       { flex: 1, gap: 3 },
  cardTop:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardName:       { fontSize: typography.fontSizes.md, fontWeight: typography.fontWeights.semibold },
  cardTime:       { fontSize: typography.fontSizes.sm, color: colors.textMuted, fontVariant: ['tabular-nums'] },
  cardLatin:      { fontSize: typography.fontSizes.xs, color: colors.textMuted },
  cardDesc:       { fontSize: typography.fontSizes.xs, color: colors.textSecondary, lineHeight: 16, marginTop: 2 },
  cardRight:      { alignItems: 'flex-end', gap: spacing.xs },
  cardNumber:     { fontSize: typography.fontSizes.xxl, fontWeight: typography.fontWeights.heavy, color: colors.border, opacity: 0.6 },
  angelusTag:     { backgroundColor: colors.primaryFaint, borderRadius: borderRadius.sm, paddingHorizontal: spacing.sm, paddingVertical: 2, borderWidth: 1, borderColor: colors.primary + '40' },
  angelusTagText: { fontSize: 9, color: colors.primary, fontWeight: typography.fontWeights.bold, letterSpacing: 0.5 },
  ringRow:        { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  ringButton:     { flex: 1, minWidth: 56, borderRadius: borderRadius.md, overflow: 'hidden' },
  ringButtonInner: { alignItems: 'center', paddingVertical: spacing.md, gap: spacing.xs, borderWidth: 1, borderColor: colors.border },
  ringNumber:     { fontSize: typography.fontSizes.sm, fontWeight: typography.fontWeights.bold, color: colors.primary },
  ringBell:       { fontSize: 18 },
  overlay:        { flex: 1, backgroundColor: '#000000CC', justifyContent: 'flex-end' },
  modal:          { borderTopLeftRadius: borderRadius.xl, borderTopRightRadius: borderRadius.xl, overflow: 'hidden', maxHeight: '88%' },
  modalInner:     { padding: spacing.xl },
  modalAccent:    { height: 3, marginBottom: spacing.md, borderRadius: 2 },
  modalIcon:      { fontSize: 48, textAlign: 'center', marginBottom: spacing.sm },
  modalTitle:     { fontSize: typography.fontSizes.xxl, fontWeight: typography.fontWeights.bold, textAlign: 'center' },
  modalSub:       { fontSize: typography.fontSizes.xs, color: colors.textMuted, textAlign: 'center', marginTop: 4 },
  angelusTag2:    { alignSelf: 'center', backgroundColor: colors.primaryFaint, borderRadius: borderRadius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, marginTop: spacing.sm, borderWidth: 1, borderColor: colors.primary + '40' },
  angelusTag2Text: { fontSize: typography.fontSizes.xs, color: colors.primary, fontWeight: typography.fontWeights.bold, letterSpacing: 0.5 },
  divider:        { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  modalDescLabel: { fontSize: typography.fontSizes.xs, color: colors.textMuted, fontWeight: typography.fontWeights.bold, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: spacing.xs },
  modalDesc:      { fontSize: typography.fontSizes.sm, color: colors.textSecondary, lineHeight: 20 },
  prayerScroll:   { maxHeight: 220 },
  modalPrayer:    { fontSize: typography.fontSizes.md, color: colors.textPrimary, lineHeight: 26, textAlign: 'center' },
  modalButtons:   { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  bellBtn:        { flex: 1, backgroundColor: colors.surfaceElevated, borderRadius: borderRadius.full, paddingVertical: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  bellBtnText:    { fontSize: typography.fontSizes.md, color: colors.textPrimary, fontWeight: typography.fontWeights.medium },
  closeBtn:       { flex: 1, borderRadius: borderRadius.full, overflow: 'hidden' },
  closeBtnGrad:   { paddingVertical: spacing.md, alignItems: 'center' },
  closeBtnText:   { fontSize: typography.fontSizes.md, fontWeight: typography.fontWeights.bold, color: '#000' },
});
