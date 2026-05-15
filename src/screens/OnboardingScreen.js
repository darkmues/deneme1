import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDenomination } from '../context/DenominationContext';
import { useI18n } from '../i18n';
import { useTheme, typography, spacing, borderRadius } from '../theme';

const DENOMINATIONS = [
  { key: 'catholic',   icon: '✝',  labelKey: 'denomination_catholic',   descKey: 'denomination_catholic_desc' },
  { key: 'orthodox',   icon: '☦',  labelKey: 'denomination_orthodox',   descKey: 'denomination_orthodox_desc' },
  { key: 'protestant', icon: '🕊',  labelKey: 'denomination_protestant', descKey: 'denomination_protestant_desc' },
];

export default function OnboardingScreen() {
  const { setDenomination } = useDenomination();
  const { t } = useI18n();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState(null);

  const confirm = async () => {
    if (!selected) return;
    await setDenomination(selected);
  };

  return (
    <LinearGradient colors={colors.gradientNight} style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom + spacing.lg }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.cross, { color: colors.primary }]}>✝</Text>
        <Text style={[styles.title, { color: colors.primary }]}>{t('onboarding_welcome')}</Text>
        <Text style={[styles.sub, { color: colors.textMuted }]}>{t('onboarding_select')}</Text>

        {DENOMINATIONS.map(d => {
          const active = selected === d.key;
          return (
            <TouchableOpacity key={d.key} onPress={() => setSelected(d.key)} activeOpacity={0.8}
              style={[styles.card, { borderColor: active ? colors.primary : colors.border, backgroundColor: active ? colors.primaryFaint : colors.surfaceElevated }]}>
              <Text style={styles.cardIcon}>{d.icon}</Text>
              <View style={styles.cardText}>
                <Text style={[styles.cardTitle, { color: active ? colors.primary : colors.textPrimary }]}>
                  {t(d.labelKey)}
                </Text>
                <Text style={[styles.cardDesc, { color: colors.textMuted }]}>{t(d.descKey)}</Text>
              </View>
              <View style={[styles.radio, { borderColor: active ? colors.primary : colors.border }]}>
                {active && <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />}
              </View>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity onPress={confirm} activeOpacity={selected ? 0.8 : 1}
          style={[styles.confirmBtn, { opacity: selected ? 1 : 0.4 }]}>
          <LinearGradient colors={colors.gradientGold} style={styles.confirmInner}>
            <Text style={[styles.confirmText, { color: colors.isDark ? '#000' : '#fff' }]}>
              {t('onboarding_confirm')}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root:        { flex: 1 },
  scroll:      { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, alignItems: 'center' },
  cross:       { fontSize: 48, marginBottom: spacing.sm },
  title:       { fontSize: typography.fontSizes.xxl, fontWeight: typography.fontWeights.bold, textAlign: 'center', marginBottom: spacing.sm },
  sub:         { fontSize: typography.fontSizes.sm, textAlign: 'center', marginBottom: spacing.xl, lineHeight: 22 },
  card:        { width: '100%', flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: borderRadius.lg, borderWidth: 2, marginBottom: spacing.sm },
  cardIcon:    { fontSize: 32 },
  cardText:    { flex: 1 },
  cardTitle:   { fontSize: typography.fontSizes.md, fontWeight: typography.fontWeights.bold },
  cardDesc:    { fontSize: typography.fontSizes.xs, marginTop: 2, lineHeight: 18 },
  radio:       { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioDot:    { width: 12, height: 12, borderRadius: 6 },
  confirmBtn:  { width: '100%', borderRadius: borderRadius.full, overflow: 'hidden', marginTop: spacing.xl },
  confirmInner: { paddingVertical: spacing.md, alignItems: 'center' },
  confirmText: { fontSize: typography.fontSizes.md, fontWeight: typography.fontWeights.bold },
});
