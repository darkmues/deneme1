import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal,
  TextInput, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CANONICAL_HOURS } from '../data/prayers';
import { useTheme, typography, spacing, borderRadius } from '../theme';
import { useI18n } from '../i18n';

const STORAGE_KEY = '@journal_v1';

export default function JournalScreen() {
  const [entries, setEntries] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [taggedHour, setTaggedHour] = useState(null);
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t, locale } = useI18n();
  const S = useMemo(() => makeStyles(colors), [colors]);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) setEntries(JSON.parse(raw));
    } catch {}
  };

  const persist = async (list) => {
    setEntries(list);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  };

  const openNew = () => {
    setEditItem(null); setTitle(''); setBody(''); setTaggedHour(null);
    setModalVisible(true);
  };

  const openEdit = (item) => {
    setEditItem(item); setTitle(item.title); setBody(item.body);
    setTaggedHour(item.taggedHour ?? null);
    setModalVisible(true);
  };

  const confirmSave = async () => {
    if (!title.trim() && !body.trim()) return;
    const now = new Date().toISOString();
    if (editItem) {
      await persist(entries.map(e => e.id === editItem.id
        ? { ...e, title: title.trim(), body: body.trim(), taggedHour, updatedAt: now }
        : e));
    } else {
      await persist([
        { id: Date.now().toString(), title: title.trim(), body: body.trim(), taggedHour, createdAt: now, updatedAt: now },
        ...entries,
      ]);
    }
    setModalVisible(false);
  };

  const remove = (item) => {
    Alert.alert(t('delete_journal_title'), t('delete_confirm', { label: item.title || t('untitled') }), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('delete'), style: 'destructive', onPress: () => persist(entries.filter(e => e.id !== item.id)) },
    ]);
  };

  const formatDate = (iso) => new Date(iso).toLocaleDateString(locale, {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  const taggedHourObj = taggedHour ? CANONICAL_HOURS.find(h => h.id === taggedHour) : null;

  return (
    <View style={[S.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={colors.gradientNight} style={S.header}>
        <Text style={S.headerTitle}>{t('journal_title')}</Text>
        <Text style={S.headerSub}>{t('journal_subtitle')}</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={S.scroll}>
        <TouchableOpacity onPress={openNew} activeOpacity={0.8} style={S.addButton}>
          <LinearGradient colors={colors.gradientGold} style={S.addButtonInner}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Ionicons name="add-circle" size={22} color={colors.isDark ? '#000' : '#fff'} />
            <Text style={[S.addButtonText, { color: colors.isDark ? '#000' : '#fff' }]}>{t('add_journal_entry')}</Text>
          </LinearGradient>
        </TouchableOpacity>

        {entries.length === 0 ? (
          <View style={S.empty}>
            <Text style={S.emptyIcon}>📖</Text>
            <Text style={S.emptyText}>{t('no_journal_entries')}</Text>
            <Text style={S.emptySub}>{t('no_journal_sub')}</Text>
          </View>
        ) : entries.map(item => {
          const hourObj = item.taggedHour ? CANONICAL_HOURS.find(h => h.id === item.taggedHour) : null;
          return (
            <View key={item.id} style={S.card}>
              <LinearGradient
                colors={hourObj ? [hourObj.color + '18', colors.surfaceElevated] : [colors.surfaceElevated, colors.surfaceElevated]}
                style={S.cardInner}>
                {hourObj && <View style={[S.accent, { backgroundColor: hourObj.color }]} />}
                <View style={S.cardHeader}>
                  <Text style={S.cardTitle} numberOfLines={1}>
                    {item.title || t('untitled')}
                  </Text>
                  <View style={S.cardActions}>
                    <TouchableOpacity onPress={() => openEdit(item)} style={S.actionBtn}>
                      <Ionicons name="pencil" size={15} color={colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => remove(item)} style={S.actionBtn}>
                      <Ionicons name="trash-outline" size={15} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
                {item.body ? <Text style={S.cardBody} numberOfLines={3}>{item.body}</Text> : null}
                <View style={S.cardFooter}>
                  {hourObj && (
                    <View style={S.hourTag}>
                      <Text style={[S.hourTagText, { color: hourObj.color }]}>
                        {hourObj.icon} {t(`hours.${hourObj.id}.name`)}
                      </Text>
                    </View>
                  )}
                  <Text style={S.cardDate}>{formatDate(item.updatedAt)}</Text>
                </View>
              </LinearGradient>
            </View>
          );
        })}
        <View style={{ height: insets.bottom + spacing.xxl }} />
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={S.overlay}>
          <View style={S.modal}>
            <LinearGradient colors={colors.gradientDark} style={S.modalInner}>
              <Text style={S.modalTitle}>{editItem ? t('edit_journal_entry') : t('new_journal_entry')}</Text>

              <Text style={S.fieldLabel}>{t('journal_title_field')}</Text>
              <View style={S.inputBox}>
                <TextInput style={S.input} value={title} onChangeText={setTitle}
                  placeholder={t('journal_title_placeholder')} placeholderTextColor={colors.textMuted}
                  maxLength={100} />
              </View>

              <Text style={S.fieldLabel}>{t('journal_body_field')}</Text>
              <View style={[S.inputBox, S.textAreaBox]}>
                <TextInput style={[S.input, S.textArea]} value={body} onChangeText={setBody}
                  placeholder={t('journal_body_placeholder')} placeholderTextColor={colors.textMuted}
                  multiline textAlignVertical="top" />
              </View>

              <Text style={S.fieldLabel}>{t('journal_tag_hour')}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={S.tagRow}>
                <TouchableOpacity onPress={() => setTaggedHour(null)}
                  style={[S.tagChip, !taggedHour && { backgroundColor: colors.primaryFaint, borderColor: colors.primary }]}>
                  <Text style={[S.tagChipText, !taggedHour && { color: colors.primary }]}>{t('none')}</Text>
                </TouchableOpacity>
                {CANONICAL_HOURS.map(h => (
                  <TouchableOpacity key={h.id} onPress={() => setTaggedHour(h.id)}
                    style={[S.tagChip, taggedHour === h.id && { backgroundColor: h.color + '25', borderColor: h.color }]}>
                    <Text style={[S.tagChipText, taggedHour === h.id && { color: h.color }]}>
                      {h.icon} {t(`hours.${h.id}.name`)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={S.modalButtons}>
                <TouchableOpacity style={S.cancelBtn} onPress={() => setModalVisible(false)} activeOpacity={0.8}>
                  <Text style={S.cancelBtnText}>{t('cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={S.saveBtn} onPress={confirmSave} activeOpacity={0.8}>
                  <LinearGradient colors={colors.gradientGold} style={S.saveBtnGrad}>
                    <Text style={[S.saveBtnText, { color: colors.isDark ? '#000' : '#fff' }]}>{t('save')}</Text>
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
  addButtonText:  { fontSize: typography.fontSizes.md, fontWeight: typography.fontWeights.bold },
  empty:          { alignItems: 'center', paddingVertical: spacing.xxl * 2 },
  emptyIcon:      { fontSize: 56, marginBottom: spacing.md },
  emptyText:      { fontSize: typography.fontSizes.lg, fontWeight: typography.fontWeights.semibold, color: c.textSecondary },
  emptySub:       { fontSize: typography.fontSizes.sm, color: c.textMuted, textAlign: 'center', marginTop: spacing.sm, lineHeight: 20 },
  card:           { marginBottom: spacing.sm },
  cardInner:      { borderRadius: borderRadius.md, borderWidth: 1, borderColor: c.border, overflow: 'hidden', padding: spacing.md },
  accent:         { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3 },
  cardHeader:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle:      { flex: 1, fontSize: typography.fontSizes.md, fontWeight: typography.fontWeights.semibold, color: c.textPrimary },
  cardActions:    { flexDirection: 'row', gap: spacing.xs },
  actionBtn:      { padding: spacing.xs },
  cardBody:       { fontSize: typography.fontSizes.sm, color: c.textSecondary, marginTop: spacing.xs, lineHeight: 20 },
  cardFooter:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
  hourTag:        { backgroundColor: c.surfaceHigh, borderRadius: borderRadius.full, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  hourTagText:    { fontSize: 10, fontWeight: typography.fontWeights.semibold },
  cardDate:       { fontSize: typography.fontSizes.xs, color: c.textMuted },
  overlay:        { flex: 1, backgroundColor: '#000000CC', justifyContent: 'flex-end' },
  modal:          { borderTopLeftRadius: borderRadius.xl, borderTopRightRadius: borderRadius.xl, overflow: 'hidden' },
  modalInner:     { padding: spacing.xl },
  modalTitle:     { fontSize: typography.fontSizes.xl, fontWeight: typography.fontWeights.bold, color: c.primary, marginBottom: spacing.lg },
  fieldLabel:     { fontSize: typography.fontSizes.xs, color: c.textMuted, fontWeight: typography.fontWeights.semibold, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.xs },
  inputBox:       { backgroundColor: c.surfaceElevated, borderRadius: borderRadius.md, borderWidth: 1, borderColor: c.border, paddingHorizontal: spacing.md, marginBottom: spacing.lg },
  textAreaBox:    { height: 120 },
  input:          { fontSize: typography.fontSizes.md, color: c.textPrimary, paddingVertical: spacing.md },
  textArea:       { height: 100 },
  tagRow:         { marginBottom: spacing.lg },
  tagChip:        { borderRadius: borderRadius.full, borderWidth: 1, borderColor: c.border, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, marginRight: spacing.sm, backgroundColor: c.surfaceElevated },
  tagChipText:    { fontSize: typography.fontSizes.xs, color: c.textMuted },
  modalButtons:   { flexDirection: 'row', gap: spacing.sm },
  cancelBtn:      { flex: 1, backgroundColor: c.surfaceElevated, borderRadius: borderRadius.full, paddingVertical: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: c.border },
  cancelBtnText:  { fontSize: typography.fontSizes.md, color: c.textSecondary },
  saveBtn:        { flex: 1, borderRadius: borderRadius.full, overflow: 'hidden' },
  saveBtnGrad:    { paddingVertical: spacing.md, alignItems: 'center' },
  saveBtnText:    { fontSize: typography.fontSizes.md, fontWeight: typography.fontWeights.bold },
});
