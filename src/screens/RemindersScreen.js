import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal,
  TextInput, Switch, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { notificationService } from '../services/notificationService'; // stub — bildirimler devre dışı
import { bellService } from '../services/bellService';
import { colors, typography, spacing, borderRadius } from '../theme';

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

  useEffect(() => {
    load();
  }, []);

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
    setEditItem(null);
    setLabel('');
    setHour('08');
    setMinute('00');
    setRepeat(true);
    setModalVisible(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setLabel(item.label);
    setHour(pad(item.hour));
    setMinute(pad(item.minute));
    setRepeat(item.repeat);
    setModalVisible(true);
  };

  const confirmSave = async () => {
    const h = parseInt(hour, 10);
    const m = parseInt(minute, 10);
    if (isNaN(h) || h < 0 || h > 23 || isNaN(m) || m < 0 || m > 59) {
      Alert.alert('Geçersiz Saat', 'Lütfen geçerli bir saat girin (00-23 : 00-59)');
      return;
    }
    const name = label.trim() || `${pad(h)}:${pad(m)} Duası`;
    let list;
    if (editItem) {
      await notificationService.cancelCustomReminder(editItem.id);
      list = reminders.map(r => r.id === editItem.id ? { ...r, label: name, hour: h, minute: m, repeat } : r);
    } else {
      const id = Date.now().toString();
      list = [...reminders, { id, label: name, hour: h, minute: m, repeat, enabled: true }];
    }
    // schedule notification
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
    if (updated.enabled) {
      await notificationService.scheduleCustomReminder(updated);
    } else {
      await notificationService.cancelCustomReminder(item.id);
    }
    await save(list);
  };

  const remove = (item) => {
    Alert.alert('Hatırlatıcıyı Sil', `"${item.label}" silinsin mi?`, [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil', style: 'destructive', onPress: async () => {
          await notificationService.cancelCustomReminder(item.id);
          await save(reminders.filter(r => r.id !== item.id));
        }
      },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#0D0D1A', '#13131F']} style={styles.header}>
        <Text style={styles.headerTitle}>🔔 Hatırlatıcılar</Text>
        <Text style={styles.headerSub}>Özel çan hatırlatıcıları ekle</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={openNew} activeOpacity={0.8} style={styles.addButton}>
          <LinearGradient colors={colors.gradientGold} style={styles.addButtonInner}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Ionicons name="add-circle" size={22} color="#000" />
            <Text style={styles.addButtonText}>Yeni Hatırlatıcı Ekle</Text>
          </LinearGradient>
        </TouchableOpacity>

        {reminders.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔕</Text>
            <Text style={styles.emptyText}>Henüz hatırlatıcı yok</Text>
            <Text style={styles.emptySub}>Yukarıdaki butonu kullanarak özel dua hatırlatıcısı ekleyin</Text>
          </View>
        ) : (
          reminders.map(item => (
            <View key={item.id} style={styles.reminderCard}>
              <LinearGradient
                colors={item.enabled ? [colors.primaryFaint, '#1C1C2E'] : ['#1C1C2E', '#1C1C2E']}
                style={styles.reminderInner}>
                <View style={styles.reminderLeft}>
                  <Text style={[styles.reminderTime, { color: item.enabled ? colors.primary : colors.textMuted }]}>
                    {pad(item.hour)}:{pad(item.minute)}
                  </Text>
                  <Text style={[styles.reminderLabel, !item.enabled && styles.disabledText]}>
                    {item.label}
                  </Text>
                  <Text style={styles.reminderRepeat}>
                    {item.repeat ? '🔁 Her gün' : '1️⃣ Bir kez'}
                  </Text>
                </View>
                <View style={styles.reminderRight}>
                  <Switch
                    value={item.enabled}
                    onValueChange={() => toggle(item)}
                    trackColor={{ false: colors.border, true: colors.primaryDark }}
                    thumbColor={item.enabled ? colors.primary : colors.textMuted}
                  />
                  <TouchableOpacity onPress={() => openEdit(item)} style={styles.iconBtn}>
                    <Ionicons name="pencil" size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => remove(item)} style={styles.iconBtn}>
                    <Ionicons name="trash-outline" size={16} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>
          ))
        )}
        <View style={{ height: insets.bottom + spacing.xxl }} />
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <LinearGradient colors={['#1C1C2E', '#0D0D1A']} style={styles.modalInner}>
              <Text style={styles.modalTitle}>{editItem ? 'Hatırlatıcıyı Düzenle' : 'Yeni Hatırlatıcı'}</Text>

              <Text style={styles.fieldLabel}>Başlık</Text>
              <View style={styles.inputBox}>
                <TextInput
                  style={styles.input}
                  value={label}
                  onChangeText={setLabel}
                  placeholder="örn: Akşam duam"
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              <Text style={styles.fieldLabel}>Saat</Text>
              <View style={styles.timeRow}>
                <View style={styles.timeBox}>
                  <TextInput
                    style={styles.timeInput}
                    value={hour}
                    onChangeText={t => setHour(t.replace(/[^0-9]/g, '').slice(0, 2))}
                    keyboardType="numeric"
                    maxLength={2}
                    placeholder="08"
                    placeholderTextColor={colors.textMuted}
                  />
                  <Text style={styles.timeLabel}>saat</Text>
                </View>
                <Text style={styles.timeSep}>:</Text>
                <View style={styles.timeBox}>
                  <TextInput
                    style={styles.timeInput}
                    value={minute}
                    onChangeText={t => setMinute(t.replace(/[^0-9]/g, '').slice(0, 2))}
                    keyboardType="numeric"
                    maxLength={2}
                    placeholder="00"
                    placeholderTextColor={colors.textMuted}
                  />
                  <Text style={styles.timeLabel}>dakika</Text>
                </View>
              </View>

              <View style={styles.repeatRow}>
                <Text style={styles.fieldLabel}>Her gün tekrarla</Text>
                <Switch
                  value={repeat}
                  onValueChange={setRepeat}
                  trackColor={{ false: colors.border, true: colors.primaryDark }}
                  thumbColor={repeat ? colors.primary : colors.textMuted}
                />
              </View>

              <View style={styles.testRow}>
                <TouchableOpacity style={styles.testBtn} onPress={() => bellService.ring(1)} activeOpacity={0.8}>
                  <Text style={styles.testBtnText}>🔔 Çanı Test Et</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)} activeOpacity={0.8}>
                  <Text style={styles.cancelBtnText}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={confirmSave} activeOpacity={0.8}>
                  <LinearGradient colors={colors.gradientGold} style={styles.saveBtnGrad}>
                    <Text style={styles.saveBtnText}>Kaydet</Text>
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

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: colors.background },
  header:         { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  headerTitle:    { fontSize: typography.fontSizes.xl, fontWeight: typography.fontWeights.bold, color: colors.primary },
  headerSub:      { fontSize: typography.fontSizes.xs, color: colors.textMuted, marginTop: 2 },
  scroll:         { paddingHorizontal: spacing.lg, paddingTop: spacing.md },

  addButton:      { borderRadius: borderRadius.lg, overflow: 'hidden', marginBottom: spacing.lg },
  addButtonInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingVertical: spacing.md },
  addButtonText:  { fontSize: typography.fontSizes.md, fontWeight: typography.fontWeights.bold, color: '#000' },

  empty:          { alignItems: 'center', paddingVertical: spacing.xxl * 2 },
  emptyIcon:      { fontSize: 56, marginBottom: spacing.md },
  emptyText:      { fontSize: typography.fontSizes.lg, fontWeight: typography.fontWeights.semibold, color: colors.textSecondary },
  emptySub:       { fontSize: typography.fontSizes.sm, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm, lineHeight: 20 },

  reminderCard:   { marginBottom: spacing.sm, borderRadius: borderRadius.md, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  reminderInner:  { flexDirection: 'row', alignItems: 'center', padding: spacing.md },
  reminderLeft:   { flex: 1 },
  reminderTime:   { fontSize: typography.fontSizes.xxl, fontWeight: typography.fontWeights.heavy, fontVariant: ['tabular-nums'] },
  reminderLabel:  { fontSize: typography.fontSizes.md, fontWeight: typography.fontWeights.medium, color: colors.textPrimary, marginTop: 2 },
  reminderRepeat: { fontSize: typography.fontSizes.xs, color: colors.textMuted, marginTop: 4 },
  disabledText:   { color: colors.textMuted },
  reminderRight:  { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  iconBtn:        { padding: spacing.xs },

  overlay:        { flex: 1, backgroundColor: '#000000CC', justifyContent: 'flex-end' },
  modal:          { borderTopLeftRadius: borderRadius.xl, borderTopRightRadius: borderRadius.xl, overflow: 'hidden' },
  modalInner:     { padding: spacing.xl },
  modalTitle:     { fontSize: typography.fontSizes.xl, fontWeight: typography.fontWeights.bold, color: colors.primary, marginBottom: spacing.lg },
  fieldLabel:     { fontSize: typography.fontSizes.xs, color: colors.textMuted, fontWeight: typography.fontWeights.semibold, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.xs },
  inputBox:       { backgroundColor: colors.surfaceElevated, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, marginBottom: spacing.lg },
  input:          { fontSize: typography.fontSizes.md, color: colors.textPrimary, paddingVertical: spacing.md },
  timeRow:        { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  timeBox:        { flex: 1, backgroundColor: colors.surfaceElevated, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, alignItems: 'center' },
  timeInput:      { fontSize: typography.fontSizes.huge, fontWeight: typography.fontWeights.heavy, color: colors.primary, textAlign: 'center', fontVariant: ['tabular-nums'] },
  timeLabel:      { fontSize: typography.fontSizes.xs, color: colors.textMuted, marginTop: 4 },
  timeSep:        { fontSize: typography.fontSizes.huge, fontWeight: typography.fontWeights.heavy, color: colors.primary },
  repeatRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  testRow:        { marginBottom: spacing.lg },
  testBtn:        { backgroundColor: colors.surfaceElevated, borderRadius: borderRadius.full, paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  testBtnText:    { fontSize: typography.fontSizes.sm, color: colors.textSecondary },
  modalButtons:   { flexDirection: 'row', gap: spacing.sm },
  cancelBtn:      { flex: 1, backgroundColor: colors.surfaceElevated, borderRadius: borderRadius.full, paddingVertical: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  cancelBtnText:  { fontSize: typography.fontSizes.md, color: colors.textSecondary },
  saveBtn:        { flex: 1, borderRadius: borderRadius.full, overflow: 'hidden' },
  saveBtnGrad:    { paddingVertical: spacing.md, alignItems: 'center' },
  saveBtnText:    { fontSize: typography.fontSizes.md, fontWeight: typography.fontWeights.bold, color: '#000' },
});
