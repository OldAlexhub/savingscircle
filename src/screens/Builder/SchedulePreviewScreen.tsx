import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { useCircles } from '../../store/CircleContext';
import { Colors, FontSize, Radius, Spacing } from '../../theme';
import { Member } from '../../types';
import { generateSchedule } from '../../utils/calculations';
import { formatDate } from '../../utils/dateUtils';
import { formatCurrency, formatFrequency } from '../../utils/formatters';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = { navigation: NativeStackNavigationProp<any> };

export default function SchedulePreviewScreen({ navigation }: Props) {
  const { draft, setDraft, saveDraft } = useCircles();
  const [saving, setSaving] = useState(false);
  const [pendingSave, setPendingSave] = useState<'planning' | 'active' | null>(null);

  const cycles = useMemo(() => {
    if (!draft.startDate || !draft.frequency || !draft.members || !draft.payoutOrder) {
      return [];
    }
    return generateSchedule({
      startDate: draft.startDate,
      frequency: draft.frequency,
      payoutOrder: draft.payoutOrder,
      members: draft.members,
      contributionAmount: draft.contributionAmount ?? 0,
      payoutAmount: draft.payoutAmount ?? 0,
      numberOfMembers: draft.numberOfMembers ?? 0,
    });
  }, [draft.startDate, draft.frequency, draft.members, draft.payoutOrder,
      draft.contributionAmount, draft.payoutAmount, draft.numberOfMembers]);

  function getMember(id: string): Member | undefined {
    return draft.members?.find(m => m.id === id);
  }

  function handleSave(activate: boolean) {
    setSaving(true);
    const status: 'planning' | 'active' = activate ? 'active' : 'planning';
    setDraft({ cycles, status });
    setPendingSave(status);
  }

  useEffect(() => {
    if (!pendingSave) { return; }
    let cancelled = false;
    saveDraft().then((_id: string) => {
      if (cancelled) { return; }
      setSaving(false);
      setPendingSave(null);
      navigation.popToTop();
    }).catch(() => {
      if (cancelled) { return; }
      setSaving(false);
      setPendingSave(null);
      Alert.alert('Error', 'Could not save the circle. Please try again.');
    });
    return () => { cancelled = true; };
  }, [pendingSave]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar backgroundColor={Colors.primary} barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Schedule Preview</Text>
          <Text style={styles.headerSub}>{draft.name} · {draft.currency}</Text>
        </View>
      </View>

      <FlatList
        data={cycles}
        keyExtractor={c => c.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <Card variant="filled" style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <SummaryItem label="Payout" value={formatCurrency(draft.payoutAmount ?? 0, draft.currency ?? '')} />
                <SummaryItem label="Contribution" value={formatCurrency(draft.contributionAmount ?? 0, draft.currency ?? '')} />
                <SummaryItem label="Frequency" value={formatFrequency(draft.frequency ?? 'monthly')} />
                <SummaryItem label="Members" value={String(draft.numberOfMembers ?? 0)} />
              </View>
            </Card>
            <Text style={styles.sectionLabel}>FULL SCHEDULE ({cycles.length} cycles)</Text>
          </View>
        }
        renderItem={({ item: cycle }) => {
          const receiver = getMember(cycle.receivingMemberId);
          return (
            <Card style={styles.cycleCard}>
              <View style={styles.cycleTop}>
                <View style={styles.cycleNum}>
                  <Text style={styles.cycleNumText}>{cycle.cycleNumber}</Text>
                </View>
                <View style={styles.cycleInfo}>
                  <Text style={styles.cycleDate}>{formatDate(cycle.dueDate)}</Text>
                  <Text style={styles.cycleReceiver}>
                    {'Receiver: '}<Text style={styles.receiverName}>{receiver?.name ?? '—'}</Text>
                  </Text>
                </View>
                <View style={styles.cycleAmount}>
                  <Text style={styles.cycleAmtLabel}>Payout</Text>
                  <Text style={styles.cycleAmt}>{formatCurrency(cycle.totalPayout, draft.currency ?? '')}</Text>
                </View>
              </View>
              <View style={styles.cycleBottom}>
                <Text style={styles.cycleMeta}>
                  {cycle.payments.length} members × {formatCurrency(cycle.contributionPerMember, draft.currency ?? '')}
                </Text>
              </View>
            </Card>
          );
        }}
        ListFooterComponent={
          <View style={styles.footer}>
            <Button label={saving ? 'Saving…' : '▶ Activate Circle Now'} onPress={() => handleSave(true)} loading={saving} style={{ marginBottom: Spacing.sm }} />
            <Button label="Save as Draft" onPress={() => handleSave(false)} variant="outline" disabled={saving} />
            <View style={styles.disclaimer}>
              <Text style={styles.disclaimerText}>
                This schedule is for planning only. Savings Circle does not process payments or guarantee payouts.
              </Text>
            </View>
          </View>
        }
      />
    </SafeAreaView>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={siStyles.item}>
      <Text style={siStyles.label}>{label}</Text>
      <Text style={siStyles.value}>{value}</Text>
    </View>
  );
}

const siStyles = StyleSheet.create({
  item: { flex: 1, minWidth: '40%' },
  label: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '600' },
  value: { fontSize: FontSize.md, fontWeight: '700', color: Colors.primary, marginTop: 2 },
});

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
  list: { padding: Spacing.md, paddingBottom: Spacing.xxl, backgroundColor: Colors.background, flexGrow: 1 },
  summaryCard: { marginBottom: Spacing.md },
  summaryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  cycleCard: { marginBottom: Spacing.sm },
  cycleTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  cycleNum: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cycleNumText: { fontSize: FontSize.sm, fontWeight: '800', color: '#fff' },
  cycleInfo: { flex: 1 },
  cycleDate: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  cycleReceiver: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  receiverName: { color: Colors.primary, fontWeight: '700' },
  cycleAmount: { alignItems: 'flex-end' },
  cycleAmtLabel: { fontSize: FontSize.xs, color: Colors.textSecondary },
  cycleAmt: { fontSize: FontSize.md, fontWeight: '800', color: Colors.primary },
  cycleBottom: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  cycleMeta: { fontSize: FontSize.sm, color: Colors.textSecondary },
  footer: { marginTop: Spacing.md },
  disclaimer: {
    backgroundColor: Colors.accentBg,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  disclaimerText: { fontSize: FontSize.sm, color: Colors.accentDark, lineHeight: 20 },
});
