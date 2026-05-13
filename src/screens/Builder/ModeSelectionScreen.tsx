import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Badge from '../../components/common/Badge';
import Card from '../../components/common/Card';
import ScreenHeader from '../../components/common/ScreenHeader';
import { useCircles } from '../../store/CircleContext';
import { Colors, FontSize, Radius, Spacing } from '../../theme';
import { BuilderMode } from '../../types';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

interface ModeCard {
  mode: BuilderMode;
  title: string;
  subtitle: string;
  inputs: string[];
  outputs: string[];
  accent: string;
  accentBg: string;
}

const MODES: ModeCard[] = [
  {
    mode: 'A',
    title: 'Payout and duration',
    subtitle: 'Use this when the group already knows the target payout and how many rounds it should run.',
    inputs: ['Target payout', 'Payment frequency', 'Number of rounds'],
    outputs: ['Members needed', 'Contribution per person', 'Complete schedule'],
    accent: Colors.primary,
    accentBg: Colors.primaryBg,
  },
  {
    mode: 'B',
    title: 'Payout and contribution',
    subtitle: 'Use this when each member has a maximum amount they can contribute per cycle.',
    inputs: ['Target payout', 'Max contribution', 'Payment frequency'],
    outputs: ['Members needed', 'Circle duration', 'Complete schedule'],
    accent: Colors.accentDark,
    accentBg: Colors.accentBg,
  },
  {
    mode: 'C',
    title: 'Fixed group size',
    subtitle: 'Use this when the member list is known and the app should calculate the contribution.',
    inputs: ['Target payout', 'Member count', 'Payment frequency'],
    outputs: ['Contribution per person', 'Circle duration', 'Complete schedule'],
    accent: Colors.info,
    accentBg: Colors.infoBg,
  },
];

export default function ModeSelectionScreen({ navigation }: Props) {
  const { setDraft } = useCircles();

  function handleSelectMode(mode: BuilderMode) {
    setDraft({ builderMode: mode });
    navigation.navigate('BuilderForm');
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar backgroundColor={Colors.primaryDark} barStyle="light-content" />
      <ScreenHeader
        title="Planning Mode"
        subtitle="Choose the inputs you already know"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.stepBand}>
          <Step active label="Mode" />
          <Step label="Details" />
          <Step label="Members" />
          <Step label="Order" />
          <Step label="Preview" />
        </View>

        {MODES.map(m => (
          <Card
            key={m.mode}
            variant="elevated"
            style={styles.modeCard}
            onPress={() => handleSelectMode(m.mode)}>
            <View style={styles.modeHeader}>
              <View style={[styles.modeBadge, { backgroundColor: m.accentBg, borderColor: m.accent }]}>
                <Text style={[styles.modeBadgeText, { color: m.accent }]}>{m.mode}</Text>
              </View>
              <View style={styles.modeTitles}>
                <Text style={styles.modeTitle}>{m.title}</Text>
                <Text style={styles.modeSub}>{m.subtitle}</Text>
              </View>
              <Text style={[styles.choose, { color: m.accent }]}>Choose</Text>
            </View>

            <View style={styles.modeGrid}>
              <ModeList title="You enter" items={m.inputs} />
              <ModeList title="You get" items={m.outputs} accent={m.accent} />
            </View>
          </Card>
        ))}

        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>Planning note</Text>
          <Text style={styles.noticeText}>
            Savings Circle helps with group planning and bookkeeping. It does not process payments or hold money.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Step({ label, active }: { label: string; active?: boolean }) {
  return (
    <View style={[styles.step, active && styles.stepActive]}>
      <Text style={[styles.stepText, active && styles.stepTextActive]}>{label}</Text>
    </View>
  );
}

function ModeList({ title, items, accent }: { title: string; items: string[]; accent?: string }) {
  return (
    <View style={styles.listCol}>
      <Text style={[styles.listHead, accent ? { color: accent } : null]}>{title}</Text>
      {items.map(item => (
        <View key={item} style={styles.listItemRow}>
          <Badge label="" color={accent ?? Colors.textLight} bg={accent ? Colors.primaryBg : Colors.surfaceInset} small />
          <Text style={[styles.listItem, accent ? { color: Colors.text } : null]}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primaryDark },
  scroll: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  stepBand: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  step: {
    flex: 1,
    minHeight: 30,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xs,
  },
  stepActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  stepText: { fontSize: FontSize.xxs, fontWeight: '800', color: Colors.textSecondary },
  stepTextActive: { color: Colors.textOnPrimary },
  modeCard: { marginBottom: Spacing.md },
  modeHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md, marginBottom: Spacing.md },
  modeBadge: {
    width: 42,
    height: 42,
    borderRadius: Radius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeBadgeText: { fontSize: FontSize.lg, fontWeight: '900' },
  modeTitles: { flex: 1 },
  modeTitle: { fontSize: FontSize.lg, fontWeight: '900', color: Colors.text },
  modeSub: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20, marginTop: 3 },
  choose: { fontSize: FontSize.sm, fontWeight: '900' },
  modeGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: Spacing.md,
  },
  listCol: { flex: 1 },
  listHead: {
    fontSize: FontSize.xs,
    fontWeight: '900',
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  listItemRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: Spacing.xs },
  listItem: { flex: 1, fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 19 },
  notice: {
    backgroundColor: Colors.accentBg,
    borderRadius: 8,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.accentBorder,
  },
  noticeTitle: { fontSize: FontSize.sm, fontWeight: '900', color: Colors.accentDark, marginBottom: 2 },
  noticeText: { fontSize: FontSize.sm, color: Colors.accentDark, lineHeight: 20 },
});
