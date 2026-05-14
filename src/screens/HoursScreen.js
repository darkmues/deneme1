import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, Alert, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { bellService } from '../services/bellService';
import { useTheme, typography, spacing, borderRadius } from '../theme';
import { useI18n } from '../i18n';
import { usePrayerHours } from '../context/PrayerHoursContext';

function pad(n) { return String(n).padStart(2, '0'); }

export default function HoursScreen() {
  const [selected, setSelected] = useState(null);
  const [showAngelus, setShowAngelus] = useState(false);
  const [editTimeHour, setEditTimeHour] = useState(null); // { hour obj, hVal, mVal }
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useI18n();
  const { hours, updateHour, resetHours } = usePrayerHours();
  const S = useMemo(() => makeStyles(colors), [colors]);

  const openEditTime = (h) => setEditTimeHour({ hour: h, hVal: pad(h.hour), mVal: pad(h.minute) });

  const confirmEditTime = async () => {
    const hNum = parseInt(editTimeHour.hVal, 10);
    const mNum = parseInt(editTimeHour.mVal, 10);
    if (isNaN(hNum) || hNum < 0 || hNum > 23 || isNaN(mNum) || mNum < 0 || mNum > 59) {
      Alert.alert(t('invalid_time'), t('invalid_time_msg'));
      return;
    }
    await updateHour(editTimeHour.hour.id, hNum, mNum);
    setEditTimeHour(null);
  };

  return (
    <View style={[S.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={colors.gradientNight} style={S.header}>
        <Text style={S.headerTitle}>{t('hours_title')}</Text>
        <Text style={S.headerSub}>{t('hours_subtitle')}</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={S.scroll}>
        {/* Angelus button */}
        <TouchableOpacity onPress={() => setShowAngelus(true)} activeOpacity={0.8}>
          <LinearGradient colors={colors.gradientGold} style={S.angelusButton}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Text style={S.angelusIcon}>🙏</Text>
            <View style={S.angelusText}>
              <Text style={[S.angelusTitle, { color: colors.isDark ? '#000' : '#fff' }]}>{t('angelus_prayer')}</Text>
              <Text style={[S.angelusSub, { color: colors.isDark ? '#00000088' : '#ffffff88' }]}>{t('angelus_read_full')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.isDark ? '#000' : '#fff'} />
          </LinearGradient>
        </TouchableOpacity>

        <Text style={S.sectionTitle}>{t('seven_canonical')}</Text>

        {hours.map((hour, idx) => (
          <TouchableOpacity key={hour.id} onPress={() => setSelected(hour)} activeOpacity={0.8} style={S.card}>
            <LinearGradient colors={[hour.color + '18', colors.surfaceElevated]}
              style={S.cardInner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <View style={[S.accent, { backgroundColor: hour.color }]} />
              <Text style={S.cardIcon}>{hour.icon}</Text>
              <View style={S.cardBody}>
                <View style={S.cardTop}>
                  <Text style={[S.cardName, { color: hour.color }]}>{t(`hours.${hour.id}.name`)}</Text>
                  <TouchableOpacity onPress={() => openEditTime(hour)} style={S.timeButton}>
                    <Text style={[S.cardTime, { color: colors.primary }]}>{hour.time}</Text>
                    <Ionicons name="pencil" size={10} color={colors.primary} style={{ marginLeft: 2 }} />
                  </TouchableOpacity>
                </View>
                <Text style={S.cardLatin}>{hour.latinName}</Text>
                <Text style={S.cardDesc} numberOfLines={2}>{t(`hours.${hour.id}.description`)}</Text>
              </View>
              <View style={S.cardRight}>
                {hour.angelus && (
                  <View style={[S.angelusTag, { backgroundColor: colors.primaryFaint, borderColor: colors.primary + '40' }]}>
                    <Text style={[S.angelusTagText, { color: colors.primary }]}>ANGELUS</Text>
                  </View>
                )}
                <Text style={[S.cardNumber, { color: colors.border }]}>{String(idx + 1).padStart(2, '0')}</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}

        {/* Ring section */}
        <Text style={S.sectionTitle}>{t('ring_bell_section')}</Text>
        <View style={S.ringRow}>
          {[1, 2, 3, 5, 7].map(n => (
            <TouchableOpacity key={n} style={S.ringButton} onPress={() => bellService.ring(n)} activeOpacity={0.7}>
              <LinearGradient colors={[colors.surfaceElevated, colors.surfaceHigh]} style={S.ringButtonInner}>
                <Text style={[S.ringNumber, { color: colors.primary }]}>{n}×</Text>
                <Text style={S.ringBell}>🔔</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Reset times */}
        <TouchableOpacity onPress={() => Alert.alert(t('reset_times'), t('reset_times_confirm'), [
          { text: t('cancel'), style: 'cancel' },
          { text: t('reset'), style: 'destructive', onPress: resetHours },
        ])} style={S.resetBtn} activeOpacity={0.8}>
          <Text style={[S.resetBtnText, { color: colors.textMuted }]}>↩ {t('reset_times')}</Text>
        </TouchableOpacity>

        <View style={{ height: insets.bottom + spacing.xxl }} />
      </ScrollView>

      {/* Hour detail modal */}
      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={S.overlay}>
          <View style={S.modal}>
            <LinearGradient colors={colors.gradientDark} style={S.modalInner}>
              <View style={[S.modalAccent, { backgroundColor: selected?.color }]} />
              <Text style={S.modalIcon}>{selected?.icon}</Text>
              <Text style={[S.modalTitle, { color: selected?.color }]}>{selected ? t(`hours.${selected.id}.name`) : ''}</Text>
              <Text style={S.modalSub}>{selected?.latinName} • {selected?.time}</Text>
              {selected?.angelus && (
                <View style={[S.angelusTag2, { backgroundColor: colors.primaryFaint, borderColor: colors.primary + '40' }]}>
                  <Text style={[S.angelusTag2Text, { color: colors.primary }]}>{t('angelus_time_tag')}</Text>
                </View>
              )}
              <View style={S.divider} />
              <Text style={S.modalDescLabel}>{t('description')}</Text>
              <Text style={S.modalDesc}>{selected ? t(`hours.${selected.id}.description`) : ''}</Text>
              <View style={S.divider} />
              <Text style={S.modalDescLabel}>{t('prayer_text')}</Text>
              <ScrollView style={S.prayerScroll}>
                <Text style={S.modalPrayer}>{selected ? t(`hours.${selected.id}.prayer`) : ''}</Text>
              </ScrollView>
              <View style={S.modalButtons}>
                <TouchableOpacity style={S.bellBtn} onPress={() => bellService.ring(3)} activeOpacity={0.8}>
                  <Text style={[S.bellBtnText, { color: colors.textPrimary }]}>{t('ring_bell_btn')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={S.closeBtn} onPress={() => setSelected(null)} activeOpacity={0.8}>
                  <LinearGradient colors={colors.gradientGold} style={S.closeBtnGrad}>
                    <Text style={[S.closeBtnText, { color: colors.isDark ? '#000' : '#fff' }]}>{t('close')}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </View>
      </Modal>

      {/* Angelus modal */}
      <Modal visible={showAngelus} transparent animationType="slide" onRequestClose={() => setShowAngelus(false)}>
        <View style={S.overlay}>
          <View style={S.modal}>
            <LinearGradient colors={colors.gradientDark} style={S.modalInner}>
              <View style={[S.modalAccent, { backgroundColor: colors.primary }]} />
              <Text style={S.modalIcon}>🙏</Text>
              <Text style={[S.modalTitle, { color: colors.primary }]}>{t('angelus_prayer')}</Text>
              <Text style={S.modalSub}>06:00 • 12:00 • 18:00</Text>
              <View style={S.divider} />
              <ScrollView style={S.prayerScroll}>
                <Text style={S.modalPrayer}>{t('angelus_full')}</Text>
              </ScrollView>
              <TouchableOpacity style={[S.closeBtn, { marginTop: spacing.lg }]}
                onPress={() => setShowAngelus(false)} activeOpacity={0.8}>
                <LinearGradient colors={colors.gradientGold} style={S.closeBtnGrad}>
                  <Text style={[S.closeBtnText, { color: colors.isDark ? '#000' : '#fff' }]}>{t('close')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      </Modal>

      {/* Edit time modal */}
      <Modal visible={!!editTimeHour} transparent animationType="fade" onRequestClose={() => setEditTimeHour(null)}>
        <View style={S.editOverlay}>
          <View style={[S.editCard, { backgroundColor: colors.surfaceElevated }]}>
            <Text style={[S.editTitle, { color: colors.primary }]}>
              {editTimeHour ? t(`hours.${editTimeHour.hour.id}.name`) : ''} — {t('edit_time')}
            </Text>
            <View style={S.editTimeRow}>
              <TextInput style={[S.editTimeInput, { color: colors.primary, borderColor: colors.border, backgroundColor: colors.surface }]}
                value={editTimeHour?.hVal} keyboardType="numeric" maxLength={2}
                onChangeText={v => setEditTimeHour(prev => ({ ...prev, hVal: v.replace(/\D/g, '').slice(0, 2) }))} />
              <Text style={[S.editTimeSep, { color: colors.primary }]}>:</Text>
              <TextInput style={[S.editTimeInput, { color: colors.primary, borderColor: colors.border, backgroundColor: colors.surface }]}
                value={editTimeHour?.mVal} keyboardType="numeric" maxLength={2}
                onChangeText={v => setEditTimeHour(prev => ({ ...prev, mVal: v.replace(/\D/g, '').slice(0, 2) }))} />
            </View>
            <View style={S.editButtons}>
              <TouchableOpacity style={[S.editCancelBtn, { borderColor: colors.border }]} onPress={() => setEditTimeHour(null)}>
                <Text style={{ color: colors.textSecondary }}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={S.editSaveBtn} onPress={confirmEditTime}>
                <LinearGradient colors={colors.gradientGold} style={S.editSaveBtnGrad}>
                  <Text style={{ color: colors.isDark ? '#000' : '#fff', fontWeight: '700' }}>{t('save')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
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
  sectionTitle:   { fontSize: typography.fontSizes.xs, color: c.textMuted, fontWeight: typography.fontWeights.bold, letterSpacing: 1, textTransform: 'uppercase', marginBottom: spacing.sm, marginTop: spacing.lg },
  angelusButton:  { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: borderRadius.lg, marginBottom: spacing.sm },
  angelusIcon:    { fontSize: 28 },
  angelusText:    { flex: 1 },
  angelusTitle:   { fontSize: typography.fontSizes.md, fontWeight: typography.fontWeights.bold },
  angelusSub:     { fontSize: typography.fontSizes.xs, marginTop: 2 },
  card:           { marginBottom: spacing.sm },
  cardInner:      { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, padding: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, borderColor: c.border, overflow: 'hidden' },
  accent:         { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3 },
  cardIcon:       { fontSize: 26, paddingTop: 2 },
  cardBody:       { flex: 1, gap: 3 },
  cardTop:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardName:       { fontSize: typography.fontSizes.md, fontWeight: typography.fontWeights.semibold, flex: 1 },
  timeButton:     { flexDirection: 'row', alignItems: 'center' },
  cardTime:       { fontSize: typography.fontSizes.sm, fontVariant: ['tabular-nums'] },
  cardLatin:      { fontSize: typography.fontSizes.xs, color: c.textMuted },
  cardDesc:       { fontSize: typography.fontSizes.xs, color: c.textSecondary, lineHeight: 16, marginTop: 2 },
  cardRight:      { alignItems: 'flex-end', gap: spacing.xs },
  cardNumber:     { fontSize: typography.fontSizes.xxl, fontWeight: typography.fontWeights.heavy, opacity: 0.6 },
  angelusTag:     { borderRadius: borderRadius.sm, paddingHorizontal: spacing.sm, paddingVertical: 2, borderWidth: 1 },
  angelusTagText: { fontSize: 9, fontWeight: typography.fontWeights.bold, letterSpacing: 0.5 },
  ringRow:        { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  ringButton:     { flex: 1, minWidth: 56, borderRadius: borderRadius.md, overflow: 'hidden' },
  ringButtonInner: { alignItems: 'center', paddingVertical: spacing.md, gap: spacing.xs, borderWidth: 1, borderColor: c.border },
  ringNumber:     { fontSize: typography.fontSizes.sm, fontWeight: typography.fontWeights.bold },
  ringBell:       { fontSize: 18 },
  resetBtn:       { marginTop: spacing.lg, alignItems: 'center', paddingVertical: spacing.md },
  resetBtnText:   { fontSize: typography.fontSizes.sm },
  overlay:        { flex: 1, backgroundColor: '#000000CC', justifyContent: 'flex-end' },
  modal:          { borderTopLeftRadius: borderRadius.xl, borderTopRightRadius: borderRadius.xl, overflow: 'hidden', maxHeight: '88%' },
  modalInner:     { padding: spacing.xl },
  modalAccent:    { height: 3, marginBottom: spacing.md, borderRadius: 2 },
  modalIcon:      { fontSize: 48, textAlign: 'center', marginBottom: spacing.sm },
  modalTitle:     { fontSize: typography.fontSizes.xxl, fontWeight: typography.fontWeights.bold, textAlign: 'center' },
  modalSub:       { fontSize: typography.fontSizes.xs, color: c.textMuted, textAlign: 'center', marginTop: 4 },
  angelusTag2:    { alignSelf: 'center', borderRadius: borderRadius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, marginTop: spacing.sm, borderWidth: 1 },
  angelusTag2Text: { fontSize: typography.fontSizes.xs, fontWeight: typography.fontWeights.bold, letterSpacing: 0.5 },
  divider:        { height: 1, backgroundColor: c.border, marginVertical: spacing.md },
  modalDescLabel: { fontSize: typography.fontSizes.xs, color: c.textMuted, fontWeight: typography.fontWeights.bold, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: spacing.xs },
  modalDesc:      { fontSize: typography.fontSizes.sm, color: c.textSecondary, lineHeight: 20 },
  prayerScroll:   { maxHeight: 220 },
  modalPrayer:    { fontSize: typography.fontSizes.md, color: c.textPrimary, lineHeight: 26, textAlign: 'center' },
  modalButtons:   { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  bellBtn:        { flex: 1, backgroundColor: c.surfaceHigh, borderRadius: borderRadius.full, paddingVertical: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: c.border },
  bellBtnText:    { fontSize: typography.fontSizes.md, fontWeight: typography.fontWeights.medium },
  closeBtn:       { flex: 1, borderRadius: borderRadius.full, overflow: 'hidden' },
  closeBtnGrad:   { paddingVertical: spacing.md, alignItems: 'center' },
  closeBtnText:   { fontSize: typography.fontSizes.md, fontWeight: typography.fontWeights.bold },
  editOverlay:    { flex: 1, backgroundColor: '#000000AA', justifyContent: 'center', alignItems: 'center' },
  editCard:       { width: 280, borderRadius: borderRadius.xl, padding: spacing.xl },
  editTitle:      { fontSize: typography.fontSizes.md, fontWeight: typography.fontWeights.bold, textAlign: 'center', marginBottom: spacing.lg },
  editTimeRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.md, marginBottom: spacing.lg },
  editTimeInput:  { fontSize: typography.fontSizes.huge, fontWeight: typography.fontWeights.heavy, textAlign: 'center', width: 80, borderWidth: 1, borderRadius: borderRadius.md, padding: spacing.sm, fontVariant: ['tabular-nums'] },
  editTimeSep:    { fontSize: typography.fontSizes.huge, fontWeight: typography.fontWeights.heavy },
  editButtons:    { flexDirection: 'row', gap: spacing.sm },
  editCancelBtn:  { flex: 1, borderWidth: 1, borderRadius: borderRadius.full, paddingVertical: spacing.md, alignItems: 'center' },
  editSaveBtn:    { flex: 1, borderRadius: borderRadius.full, overflow: 'hidden' },
  editSaveBtnGrad: { paddingVertical: spacing.md, alignItems: 'center' },
});
