import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import ScreenHeader from '../../components/common/ScreenHeader';
import { useCircles } from '../../store/CircleContext';
import { Colors, FontSize, Radius, Spacing } from '../../theme';
import { Member } from '../../types';
import { generateSchedule } from '../../utils/calculations';
import { formatDate } from '../../utils/dateUtils';
import { formatCurrency, formatFrequency } from '../../utils/formatters';

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
  }, [
    draft.startDate,
    draft.frequency,
    draft.members,
    draft.payoutOrder,
    draft.contributionAmount,
    draft.payoutAmount,
    draft.numberOfMembers,
  ]);

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
    saveDraft()
      .then(() => {
        if (cancelled) { return; }
        setSaving(false);
        setPendingSave(null);
        navigation.popToTop();
      })
      .catch(() => {
        if (cancelled) { return; }
        setSaving(false);
        setPendingSave(null);
        Alert.alert('Error', 'Could not save the circle. Please try again.');
      });
    return () => { cancelled = true; };
  }, [pendingSave, saveDraft, navigation]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar backgroundColor={Colors.primaryDark} barStyle="light-content" />
      <ScreenHeader
        title="Schedule Preview"
        subtitle={`${draft.name ?? 'Untitled circle'} / ${draft.currency ?? 'USD'}`}
        onBack={() => navigation.goBack()}
      />

      <FlatList
        data={cycles}
        keyExtractor={cycle => cycle.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <View style={styles.stepBand}>
              <Step label="Mode" done />
              <Step label="Details" done />
              <Step label="Members" done />
              <Step label="Order" done />
              <Step label="Preview" active />
            </View>

            <Card variant="elevated" style={styles.summaryCard}>
              <View style={styles.summaryTop}>
                <View>
                  <Text style={styles.summaryTitle}>Ready to save</Text>
                  <Text style={styles.summarySub}>Review the generated cycle dates and payout order.</Text>
                </View>
                <Badge label={`${cycles.length} cycles`} color={Colors.primary} bg={Colors.primaryBg} small dot />
              </View>
              <View style={styles.summaryGrid}>
                <SummaryItem label="Payout" value={formatCurrency(draft.payoutAmount ?? 0, draft.currency ?? '')} />
                <SummaryItem label="Contribution" value={formatCurrency(draft.contributionAmount ?? 0, draft.currency ?? '')} />
                <SummaryItem label="Frequency" value={formatFrequency(draft.frequency ?? 'monthly')} />
                <SummaryItem label="Members" value={String(draft.numberOfMembers ?? 0)} />
              </View>
            </Card>

            <Text style={styles.sectionLabel}>Generated schedule</Text>
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
                  <Text style={styles.cycleReceiver} numberOfLines={1}>
                    Receiver: <Text style={styles.receiverName}>{receiver?.name ?? 'Unassigned'}</Text>
                  </Text>
                </View>
                <View style={styles.cycleAmount}>
                  <Text style={styles.cycleAmtLabel}>Payout</Text>
                  <Text style={styles.cycleAmt}>{formatCurrency(cycle.totalPayout, draft.currency ?? '')}</Text>
                </View>
              </View>
              <View style={styles.cycleBottom}>
                <Text style={styles.cycleMeta}>
                  {cycle.payments.length} members x {formatCurrency(cycle.contributionPerMember, draft.currency ?? '')}
                </Text>
              </View>
            </Card>
          );
        }}
        ListFooterComponent={
          <View style={styles.footer}>
            <Button
              label={saving ? 'Saving...' : 'Activate Circle Now'}
              onPress={() => handleSave(true)}
              loading={saving}
              style={styles.primarySave}
            />
            <Button label="Save as Draft" onPress={() => handleSave(false)} variant="outline" disabled={saving} />
            <View style={styles.notice}>
              <Text style={styles.noticeText}>
                Savings Circle creates the schedule only. It does not collect contributions or guarantee payouts.
              </Text>
            </View>
          </View>
        }
      />
    </SafeAreaView>
  );
}

function Step({ label, active, done }: { label: string; active?: boolean; done?: boolean }) {
  return (
    <View style={[styles.step, done && styles.stepDone, active && styles.stepActive]}>
      <Text style={[styles.stepText, active && styles.stepTextActive, done && styles.stepTextDone]}>{label}</Text>
    </View>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryItem}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue} numberOfLines={2}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primaryDark },
  list: { padding: Spacing.md, paddingBottom: Spacing.xxl, backgroundColor: Colors.background, flexGrow: 1 },
  stepBand: { flexDirection: 'row', gap: Spacing.xs, marginBottom: Spacing.lg },
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
  stepDone: { backgroundColor: Colors.primaryBg, borderColor: Colors.primaryBorder },
  stepActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  stepText: { fontSize: FontSize.xxs, fontWeight: '800', color: Colors.textSecondary },
  stepTextActive: { color: Colors.textOnPrimary },
  stepTextDone: { color: Colors.primaryDark },
  summaryCard: { marginBottom: Spacing.md },
  summaryTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.md, marginBottom: Spacing.md },
  summaryTitle: { fontSize: FontSize.lg, fontWeight: '900', color: Colors.text },
  summarySub: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2, lineHeight: 19 },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  summaryItem: {
    flexGrow: 1,
    flexBasis: '46%',
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 8,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  summaryLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '800' },
  summaryValue: { fontSize: FontSize.md, fontWeight: '900', color: Colors.primaryDark, marginTop: 3 },
  sectionLabel: { fontSize: FontSize.xs, fontWeight: '900', color: Colors.textSecondary, marginBottom: Spacing.sm },
  cycleCard: { marginBottom: Spacing.sm },
  cycleTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  cycleNum: {
    width: 34,
    height: 34,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cycleNumText: { fontSize: FontSize.sm, fontWeight: '900', color: Colors.textOnPrimary },
  cycleInfo: { flex: 1 },
  cycleDate: { fontSize: FontSize.md, fontWeight: '900', color: Colors.text },
  cycleReceiver: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  receiverName: { color: Colors.primaryDark, fontWeight: '900' },
  cycleAmount: { alignItems: 'flex-end', maxWidth: '35%' },
  cycleAmtLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '700' },
  cycleAmt: { fontSize: FontSize.sm, fontWeight: '900', color: Colors.primaryDark, textAlign: 'right' },
  cycleBottom: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  cycleMeta: { fontSize: FontSize.sm, color: Colors.textSecondary },
  footer: { marginTop: Spacing.md },
  primarySave: { marginBottom: Spacing.sm },
  notice: {
    backgroundColor: Colors.accentBg,
    borderRadius: 8,
    padding: Spacing.md,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.accentBorder,
  },
  noticeText: { fontSize: FontSize.sm, color: Colors.accentDark, lineHeight: 20 },
});
