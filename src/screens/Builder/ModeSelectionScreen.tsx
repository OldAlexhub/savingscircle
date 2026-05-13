import React from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCircles } from '../../store/CircleContext';
import { Colors, FontSize, Radius, Shadow, Spacing } from '../../theme';
import { BuilderMode } from '../../types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

interface ModeCard {
  mode: BuilderMode;
  icon: string;
  title: string;
  subtitle: string;
  inputs: string[];
  outputs: string[];
}

const MODES: ModeCard[] = [
  {
    mode: 'A',
    icon: '🎯',
    title: 'I know the payout & duration',
    subtitle: 'Set a target payout and how long the circle runs.',
    inputs: ['Target payout amount', 'Payment frequency', 'Number of payment rounds'],
    outputs: ['Number of members needed', 'Contribution per person', 'Full schedule'],
  },
  {
    mode: 'B',
    icon: '💡',
    title: 'I know the payout & contribution',
    subtitle: "Set a target payout and the max each person can contribute.",
    inputs: ['Target payout amount', 'Max contribution per person', 'Payment frequency'],
    outputs: ['Number of members needed', 'Circle duration', 'Full schedule'],
  },
  {
    mode: 'C',
    icon: '👥',
    title: 'I know the number of people',
    subtitle: 'You already have a group — set the payout and let us do the math.',
    inputs: ['Target payout amount', 'Number of members', 'Payment frequency'],
    outputs: ['Contribution per person', 'Circle duration', 'Full schedule'],
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
      <StatusBar backgroundColor={Colors.primary} barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Planning Mode</Text>
          <Text style={styles.headerSub}>How do you want to build your circle?</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>

        {MODES.map(m => (
          <TouchableOpacity
            key={m.mode}
            activeOpacity={0.82}
            onPress={() => handleSelectMode(m.mode)}
            style={styles.modeCard}>
            <View style={styles.modeHeader}>
              <Text style={styles.modeIcon}>{m.icon}</Text>
              <View style={styles.modeTitles}>
                <Text style={styles.modeLabel}>Mode {m.mode}</Text>
                <Text style={styles.modeTitle}>{m.title}</Text>
              </View>
            </View>
            <Text style={styles.modeSub}>{m.subtitle}</Text>
            <View style={styles.divider} />
            <View style={styles.lists}>
              <View style={styles.listCol}>
                <Text style={styles.listHead}>YOU ENTER</Text>
                {m.inputs.map((inp, i) => (
                  <Text key={i} style={styles.listItem}>· {inp}</Text>
                ))}
              </View>
              <View style={[styles.listCol, { flex: 1 }]}>
                <Text style={[styles.listHead, { color: Colors.primary }]}>YOU GET</Text>
                {m.outputs.map((out, i) => (
                  <Text key={i} style={[styles.listItem, { color: Colors.primary }]}>✓ {out}</Text>
                ))}
              </View>
            </View>
            <View style={styles.cardArrow}>
              <Text style={styles.arrowText}>Choose →</Text>
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            💡 Savings Circle is a planning and bookkeeping tool only. It does not process payments or manage real money.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primary },
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  backBtn: { padding: Spacing.xs, marginTop: 2 },
  backIcon: { fontSize: 22, color: '#fff', fontWeight: '700' },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  scroll: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  modeCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadow.md,
  },
  modeHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing.sm },
  modeIcon: { fontSize: 36, marginRight: Spacing.md },
  modeTitles: { flex: 1 },
  modeLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  modeTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text, marginTop: 2 },
  modeSub: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20, marginBottom: Spacing.md },
  divider: { height: 1, backgroundColor: Colors.border, marginBottom: Spacing.md },
  lists: { flexDirection: 'row', gap: Spacing.md },
  listCol: { flex: 1 },
  listHead: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: Spacing.xs,
  },
  listItem: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 22 },
  cardArrow: { marginTop: Spacing.md, alignItems: 'flex-end' },
  arrowText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.primary },
  disclaimer: {
    backgroundColor: Colors.accentBg,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  disclaimerText: { fontSize: FontSize.sm, color: Colors.accentDark, lineHeight: 20 },
});
