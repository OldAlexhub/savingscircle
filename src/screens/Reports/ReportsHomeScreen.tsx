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
import { Colors, FontSize, Spacing } from '../../theme';
import { Circle } from '../../types';
import { getCircleStats } from '../../utils/calculations';
import { circleStatusColor, formatCurrency, formatFrequency } from '../../utils/formatters';

type Props = { navigation: NativeStackNavigationProp<any> };

export default function ReportsHomeScreen({ navigation }: Props) {
  const { circles } = useCircles();
  const active = circles.filter(c => c.status === 'active').length;
  const planning = circles.filter(c => c.status === 'planning').length;
  const completed = circles.filter(c => c.status === 'completed').length;

  function renderCircle({ item }: { item: Circle }) {
    const sc = circleStatusColor(item.status);
    const stats = getCircleStats(item);

    return (
      <Card
        variant="elevated"
        style={styles.card}
        onPress={() => navigation.navigate('CircleReport', { circleId: item.id })}>
        <View style={styles.cardHeader}>
          <View style={styles.titleWrap}>
            <Text style={styles.circleName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.circleFreq}>{formatFrequency(item.frequency)} / {item.members.length} members</Text>
          </View>
          <Badge
            label={item.status === 'active' ? 'Active' : item.status === 'planning' ? 'Planning' : 'Completed'}
            color={sc.text}
            bg={sc.bg}
            small
            dot
          />
        </View>

        <View style={styles.reportRow}>
          <View>
            <Text style={styles.amtLabel}>Payout per turn</Text>
            <Text style={styles.amtValue}>{formatCurrency(item.payoutAmount, item.currency)}</Text>
          </View>
          <Text style={styles.viewReport}>Open report</Text>
        </View>

        <ProgressBar
          percent={stats.progressPercent}
          label={`${stats.completedCycles} of ${stats.totalCycles} cycles`}
          color={item.status === 'completed' ? Colors.success : Colors.primary}
        />
      </Card>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar backgroundColor={Colors.primaryDark} barStyle="light-content" />
      <ScreenHeader title="Reports" subtitle="Summaries, member history, and cycle breakdowns" />

      {circles.length === 0 ? (
        <View style={styles.emptyWrap}>
          <EmptyState
            icon="="
            title="No reports yet"
            subtitle="Build or activate a circle to generate reports and review payment history."
          />
        </View>
      ) : (
        <FlatList
          data={circles}
          keyExtractor={circle => circle.id}
          renderItem={renderCircle}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View>
              <View style={styles.summaryBand}>
                <SummaryBlock label="Planning" value={String(planning)} />
                <SummaryBlock label="Active" value={String(active)} highlight />
                <SummaryBlock label="Completed" value={String(completed)} />
              </View>
              <Text style={styles.sectionLabel}>All circles</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

function SummaryBlock({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={[styles.summaryBlock, highlight && styles.summaryBlockHighlight]}>
      <Text style={[styles.summaryValue, highlight && styles.summaryValueHighlight]}>{value}</Text>
      <Text style={[styles.summaryLabel, highlight && styles.summaryLabelHighlight]}>{label}</Text>
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
  summaryBlockHighlight: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  summaryValue: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.primaryDark },
  summaryValueHighlight: { color: Colors.textOnPrimary },
  summaryLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '800', marginTop: 2 },
  summaryLabelHighlight: { color: Colors.textOnPrimary },
  sectionLabel: { fontSize: FontSize.xs, fontWeight: '900', color: Colors.textSecondary, marginBottom: Spacing.sm },
  card: { marginBottom: Spacing.sm },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, marginBottom: Spacing.md },
  titleWrap: { flex: 1 },
  circleName: { fontSize: FontSize.lg, fontWeight: '900', color: Colors.text },
  circleFreq: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  reportRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: Spacing.md, marginBottom: Spacing.sm },
  amtLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '800' },
  amtValue: { fontSize: FontSize.lg, fontWeight: '900', color: Colors.primaryDark, marginTop: 2 },
  viewReport: { fontSize: FontSize.sm, color: Colors.primaryDark, fontWeight: '900' },
});
