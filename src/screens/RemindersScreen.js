import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal,
  TextInput, Switch, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { notificationService } from '../services/notificationService';
import { bellService } from '../services/bellService';
import { useTheme, typography, spacing, borderRadius } from '../theme';
import { useI18n } from '../i18n';

const STORAGE_KEY = '@reminders_v1';
function pad(n) { return String(n).padStart(2, '0'); }

export default function RemindersScreen() {
  const [reminders, setReminders] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [label, setLabel] = useState('');
  const [hour, setHour] = useState('08');
  const [minute, setMinute] = useState('00');
  const [repeat, setRepeat] = useState(true);
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const { colors } = useTheme();
  const S = useMemo(() => makeStyles(colors), [colors]);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) setReminders(JSON.parse(raw));
    } catch {}
  };

  const save = async (list) => {
    setReminders(list);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  };

  const openNew = () => {
    setEditItem(null); setLabel(''); setHour('08'); setMinute('00'); setRepeat(true);
    setModalVisible(true);
  };

  const openEdit = (item) => {
    setEditItem(item); setLabel(item.label); setHour(pad(item.hour));
    setMinute(pad(item.minute)); setRepeat(item.repeat);
    setModalVisible(true);
  };

  const confirmSave = async () => {
    const h = parseInt(hour, 10);
    const m = parseInt(minute, 10);
    if (isNaN(h) || h < 0 || h > 23 || isNaN(m) || m < 0 || m > 59) {
      Alert.alert(t('invalid_time'), t('invalid_time_msg'));
      return;
    }
    const name = label.trim() || `${pad(h)}:${pad(m)}`;
    let list;
    if (editItem) {
      await notificationService.cancelCustomReminder(editItem.id);
      list = reminders.map(r => r.id === editItem.id ? { ...r, label: name, hour: h, minute: m, repeat } : r);
    } else {
      const id = Date.now().toString();
      list = [...reminders, { id, label: name, hour: h, minute: m, repeat, enabled: true }];
    }
    const target = list.find(r => r.label === name && r.hour === h && r.minute === m);
    if (target?.enabled) {
      await notificationService.scheduleCustomReminder({ id: target.id, label: name, hour: h, minute: m, repeat });
    }
    await save(list);
    setModalVisible(false);
  };

  const toggle = async (item) => {
    const updated = { ...item, enabled: !item.enabled };
    const list = reminders.map(r => r.id === item.id ? updated : r);
    if (updated.enabled) await notificationService.scheduleCustomReminder(updated);
    else await notificationService.cancelCustomReminder(item.id);
    await save(list);
  };

  const remove = (item) => {
    Alert.alert(t('delete_reminder_title'), t('delete_confirm', { label: item.label }), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('delete'), style: 'destructive', onPress: async () => {
        await notificationService.cancelCustomReminder(item.id);
        await save(reminders.filter(r => r.id !== item.id));
      }},
    ]);
  };

  return (
    <View style={[S.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={colors.gradientNight} style={S.header}>
        <Text style={S.headerTitle}>{t('reminders_title')}</Text>
        <Text style={S.headerSub}>{t('reminders_subtitle')}</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={S.scroll}>
        <TouchableOpacity onPress={openNew} activeOpacity={0.8} style={S.addButton}>
          <LinearGradient colors={colors.gradientGold} style={S.addButtonInner}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Ionicons name="add-circle" size={22} color={colors.isDark ? '#000' : '#fff'} />
            <Text style={S.addButtonText}>{t('add_reminder')}</Text>
          </LinearGradient>
        </TouchableOpacity>

        {reminders.length === 0 ? (
          <View style={S.empty}>
            <Text style={S.emptyIcon}>🔕</Text>
            <Text style={S.emptyText}>{t('no_reminders')}</Text>
            <Text style={S.emptySub}>{t('no_reminders_sub')}</Text>
          </View>
        ) : (
          reminders.map(item => (
            <View key={item.id} style={S.reminderCard}>
              <LinearGradient
                colors={item.enabled ? [colors.primaryFaint, colors.surfaceElevated] : [colors.surfaceElevated, colors.surfaceElevated]}
                style={S.reminderInner}>
                <View style={S.reminderLeft}>
                  <Text style={[S.reminderTime, { color: item.enabled ? colors.primary : colors.textMuted }]}>
                    {pad(item.hour)}:{pad(item.minute)}
                  </Text>
                  <Text style={[S.reminderLabel, !item.enabled && S.disabledText]}>
                    {item.label}
                  </Text>
                  <Text style={S.reminderRepeat}>
                    {item.repeat ? t('every_day') : t('once_only')}
                  </Text>
                </View>
                <View style={S.reminderRight}>
                  <Switch value={item.enabled} onValueChange={() => toggle(item)}
                    trackColor={{ false: colors.border, true: colors.primaryDark }}
                    thumbColor={item.enabled ? colors.primary : colors.textMuted} />
                  <TouchableOpacity onPress={() => openEdit(item)} style={S.iconBtn}>
                    <Ionicons name="pencil" size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => remove(item)} style={S.iconBtn}>
                    <Ionicons name="trash-outline" size={16} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>
          ))
        )}
        <View style={{ height: insets.bottom + spacing.xxl }} />
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={S.overlay}>
          <View style={S.modal}>
            <LinearGradient colors={colors.gradientDark} style={S.modalInner}>
              <Text style={S.modalTitle}>
                {editItem ? t('edit_reminder_title') : t('new_reminder_title')}
              </Text>

              <Text style={S.fieldLabel}>{t('reminder_name_field')}</Text>
              <View style={S.inputBox}>
                <TextInput style={S.input} value={label} onChangeText={setLabel}
                  placeholder={t('name_placeholder')} placeholderTextColor={colors.textMuted} />
              </View>

              <Text style={S.fieldLabel}>{t('time_field')}</Text>
              <View style={S.timeRow}>
                <View style={S.timeBox}>
                  <TextInput style={S.timeInput} value={hour}
                    onChangeText={t2 => setHour(t2.replace(/[^0-9]/g, '').slice(0, 2))}
                    keyboardType="numeric" maxLength={2} placeholder="08"
                    placeholderTextColor={colors.textMuted} />
                  <Text style={S.timeLabel}>{t('hour_label')}</Text>
                </View>
                <Text style={S.timeSep}>:</Text>
                <View style={S.timeBox}>
                  <TextInput style={S.timeInput} value={minute}
                    onChangeText={t2 => setMinute(t2.replace(/[^0-9]/g, '').slice(0, 2))}
                    keyboardType="numeric" maxLength={2} placeholder="00"
                    placeholderTextColor={colors.textMuted} />
                  <Text style={S.timeLabel}>{t('minute_label')}</Text>
                </View>
              </View>

              <View style={S.repeatRow}>
                <Text style={S.fieldLabel}>{t('repeat_daily')}</Text>
                <Switch value={repeat} onValueChange={setRepeat}
                  trackColor={{ false: colors.border, true: colors.primaryDark }}
                  thumbColor={repeat ? colors.primary : colors.textMuted} />
              </View>

              <View style={S.testRow}>
                <TouchableOpacity style={S.testBtn} onPress={() => bellService.ring(1)} activeOpacity={0.8}>
                  <Text style={S.testBtnText}>{t('test_bell')}</Text>
                </TouchableOpacity>
              </View>

              <View style={S.modalButtons}>
                <TouchableOpacity style={S.cancelBtn} onPress={() => setModalVisible(false)} activeOpacity={0.8}>
                  <Text style={S.cancelBtnText}>{t('cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={S.saveBtn} onPress={confirmSave} activeOpacity={0.8}>
                  <LinearGradient colors={colors.gradientGold} style={S.saveBtnGrad}>
                    <Text style={S.saveBtnText}>{t('save')}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
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
  addButton:      { borderRadius: borderRadius.lg, overflow: 'hidden', marginBottom: spacing.lg },
  addButtonInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingVertical: spacing.md },
  addButtonText:  { fontSize: typography.fontSizes.md, fontWeight: typography.fontWeights.bold, color: c.isDark ? '#000' : '#fff' },
  empty:          { alignItems: 'center', paddingVertical: spacing.xxl * 2 },
  emptyIcon:      { fontSize: 56, marginBottom: spacing.md },
  emptyText:      { fontSize: typography.fontSizes.lg, fontWeight: typography.fontWeights.semibold, color: c.textSecondary },
  emptySub:       { fontSize: typography.fontSizes.sm, color: c.textMuted, textAlign: 'center', marginTop: spacing.sm, lineHeight: 20 },
  reminderCard:   { marginBottom: spacing.sm, borderRadius: borderRadius.md, overflow: 'hidden', borderWidth: 1, borderColor: c.border },
  reminderInner:  { flexDirection: 'row', alignItems: 'center', padding: spacing.md },
  reminderLeft:   { flex: 1 },
  reminderTime:   { fontSize: typography.fontSizes.xxl, fontWeight: typography.fontWeights.heavy, fontVariant: ['tabular-nums'] },
  reminderLabel:  { fontSize: typography.fontSizes.md, fontWeight: typography.fontWeights.medium, color: c.textPrimary, marginTop: 2 },
  reminderRepeat: { fontSize: typography.fontSizes.xs, color: c.textMuted, marginTop: 4 },
  disabledText:   { color: c.textMuted },
  reminderRight:  { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  iconBtn:        { padding: spacing.xs },
  overlay:        { flex: 1, backgroundColor: '#000000CC', justifyContent: 'flex-end' },
  modal:          { borderTopLeftRadius: borderRadius.xl, borderTopRightRadius: borderRadius.xl, overflow: 'hidden' },
  modalInner:     { padding: spacing.xl },
  modalTitle:     { fontSize: typography.fontSizes.xl, fontWeight: typography.fontWeights.bold, color: c.primary, marginBottom: spacing.lg },
  fieldLabel:     { fontSize: typography.fontSizes.xs, color: c.textMuted, fontWeight: typography.fontWeights.semibold, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.xs },
  inputBox:       { backgroundColor: c.surfaceElevated, borderRadius: borderRadius.md, borderWidth: 1, borderColor: c.border, paddingHorizontal: spacing.md, marginBottom: spacing.lg },
  input:          { fontSize: typography.fontSizes.md, color: c.textPrimary, paddingVertical: spacing.md },
  timeRow:        { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  timeBox:        { flex: 1, backgroundColor: c.surfaceElevated, borderRadius: borderRadius.md, borderWidth: 1, borderColor: c.border, padding: spacing.md, alignItems: 'center' },
  timeInput:      { fontSize: typography.fontSizes.huge, fontWeight: typography.fontWeights.heavy, color: c.primary, textAlign: 'center', fontVariant: ['tabular-nums'] },
  timeLabel:      { fontSize: typography.fontSizes.xs, color: c.textMuted, marginTop: 4 },
  timeSep:        { fontSize: typography.fontSizes.huge, fontWeight: typography.fontWeights.heavy, color: c.primary },
  repeatRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  testRow:        { marginBottom: spacing.lg },
  testBtn:        { backgroundColor: c.surfaceElevated, borderRadius: borderRadius.full, paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, alignItems: 'center', borderWidth: 1, borderColor: c.border },
  testBtnText:    { fontSize: typography.fontSizes.sm, color: c.textSecondary },
  modalButtons:   { flexDirection: 'row', gap: spacing.sm },
  cancelBtn:      { flex: 1, backgroundColor: c.surfaceElevated, borderRadius: borderRadius.full, paddingVertical: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: c.border },
  cancelBtnText:  { fontSize: typography.fontSizes.md, color: c.textSecondary },
  saveBtn:        { flex: 1, borderRadius: borderRadius.full, overflow: 'hidden' },
  saveBtnGrad:    { paddingVertical: spacing.md, alignItems: 'center' },
  saveBtnText:    { fontSize: typography.fontSizes.md, fontWeight: typography.fontWeights.bold, color: c.isDark ? '#000' : '#fff' },
});
