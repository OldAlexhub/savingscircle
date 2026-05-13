import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import {
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Badge from '../../components/common/Badge';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import ProgressBar from '../../components/common/ProgressBar';
import ScreenHeader from '../../components/common/ScreenHeader';
import { useCircles } from '../../store/CircleContext';
import { Colors, FontSize, Radius, Spacing } from '../../theme';
import { Circle } from '../../types';
import { getCircleStats } from '../../utils/calculations';
import { formatDate } from '../../utils/dateUtils';
import { circleStatusColor, formatCurrency, formatFrequency } from '../../utils/formatters';

type Props = { navigation: NativeStackNavigationProp<any> };

export default function TrackerHomeScreen({ navigation }: Props) {
  const { circles } = useCircles();
  const tracked = circles.filter(c => c.status === 'active' || c.status === 'completed');
  const activeCount = tracked.filter(c => c.status === 'active').length;
  const completedCount = tracked.filter(c => c.status === 'completed').length;

  function renderCircle({ item }: { item: Circle }) {
    const sc = circleStatusColor(item.status);
    const stats = getCircleStats(item);
    const nextReceiver = stats.nextCycle
      ? item.members.find(m => m.id === stats.nextCycle?.receivingMemberId)?.name
      : undefined;

    return (
      <Card
        variant="elevated"
        style={styles.card}
        onPress={() => navigation.navigate('CircleDetail', { circleId: item.id })}>
        <View style={styles.cardHeader}>
          <View style={styles.titleWrap}>
            <Text style={styles.circleName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.circleFreq}>{formatFrequency(item.frequency)} / {item.numberOfMembers} members</Text>
          </View>
          <Badge
            label={item.status === 'active' ? 'Active' : 'Completed'}
            color={sc.text}
            bg={sc.bg}
            small
            dot
          />
        </View>

        <View style={styles.amountRow}>
          <Metric label="Payout" value={formatCurrency(item.payoutAmount, item.currency)} />
          <Metric label="Each pays" value={formatCurrency(item.contributionAmount, item.currency)} alignRight />
        </View>

        <ProgressBar
          percent={stats.progressPercent}
          label={`Cycles ${stats.completedCycles} of ${stats.totalCycles}`}
          color={item.status === 'completed' ? Colors.success : Colors.primary}
        />

        <View style={styles.nextCycle}>
          <Text style={styles.nextLabel}>{stats.nextCycle ? 'Next cycle' : 'Status'}</Text>
          <Text style={styles.nextValue} numberOfLines={1}>
            {stats.nextCycle
              ? `${formatDate(stats.nextCycle.dueDate)} / ${nextReceiver ?? 'Unassigned'}`
              : 'All cycles resolved'}
          </Text>
        </View>
      </Card>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar backgroundColor={Colors.primaryDark} barStyle="light-content" />
      <ScreenHeader title="Tracker" subtitle="Monitor active and completed circles" />

      {tracked.length === 0 ? (
        <View style={styles.emptyWrap}>
          <EmptyState
            icon="#"
            title="No tracked circles"
            subtitle="Activate a saved circle from Builder to start tracking member payment cycles."
          />
        </View>
      ) : (
        <FlatList
          data={tracked}
          keyExtractor={item => item.id}
          renderItem={renderCircle}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View>
              <View style={styles.summaryBand}>
                <SummaryBlock label="Active" value={String(activeCount)} tone="active" />
                <SummaryBlock label="Completed" value={String(completedCount)} />
                <SummaryBlock label="Tracked" value={String(tracked.length)} />
              </View>
              <Text style={styles.sectionLabel}>Your circles</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

function SummaryBlock({ label, value, tone }: { label: string; value: string; tone?: 'active' }) {
  return (
    <View style={[styles.summaryBlock, tone === 'active' && styles.summaryBlockActive]}>
      <Text style={[styles.summaryValue, tone === 'active' && styles.summaryValueActive]}>{value}</Text>
      <Text style={[styles.summaryLabel, tone === 'active' && styles.summaryLabelActive]}>{label}</Text>
    </View>
  );
}

function Metric({ label, value, alignRight }: { label: string; value: string; alignRight?: boolean }) {
  return (
    <View style={[styles.metric, alignRight && styles.metricRight]}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primaryDark },
  emptyWrap: { flex: 1, backgroundColor: Colors.background },
  list: { padding: Spacing.md, paddingBottom: Spacing.xxl, backgroundColor: Colors.background, flexGrow: 1 },
  summaryBand: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  summaryBlock: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
  },
  summaryBlockActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  summaryValue: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.primaryDark },
  summaryValueActive: { color: Colors.textOnPrimary },
  summaryLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '800', marginTop: 2 },
  summaryLabelActive: { color: Colors.textOnPrimary },
  sectionLabel: { fontSize: FontSize.xs, fontWeight: '900', color: Colors.textSecondary, marginBottom: Spacing.sm },
  card: { marginBottom: Spacing.sm },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, marginBottom: Spacing.md },
  titleWrap: { flex: 1 },
  circleName: { fontSize: FontSize.lg, fontWeight: '900', color: Colors.text },
  circleFreq: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  amountRow: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.md, marginBottom: Spacing.sm },
  metric: { flex: 1 },
  metricRight: { alignItems: 'flex-end' },
  metricLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '800' },
  metricValue: { fontSize: FontSize.md, color: Colors.primaryDark, fontWeight: '900', marginTop: 2 },
  nextCycle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  nextLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '900' },
  nextValue: { fontSize: FontSize.sm, color: Colors.primaryDark, fontWeight: '900', flex: 1, textAlign: 'right' },
});
