import React from 'react';
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
import ProgressBar from '../../components/common/ProgressBar';
import ScreenHeader from '../../components/common/ScreenHeader';
import { useCircles } from '../../store/CircleContext';
import { Colors, FontSize, Radius, Spacing } from '../../theme';
import { Circle, Cycle } from '../../types';
import { getCircleStats, getCycleStats } from '../../utils/calculations';
import { formatDate } from '../../utils/dateUtils';
import { circleStatusColor, formatCurrency, formatFrequency } from '../../utils/formatters';

type Props = {
  navigation: any;
  route: any;
};

export default function CircleDetailScreen({ navigation, route }: Props) {
  const { circleId } = route.params;
  const { getCircle, activateCircle, completeCircle, deleteCircle } = useCircles();
  const circle = getCircle(circleId) as Circle | undefined;

  if (!circle) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <StatusBar backgroundColor={Colors.primaryDark} barStyle="light-content" />
        <ScreenHeader title="Circle" subtitle="Not found" onBack={() => navigation.goBack()} />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Circle not found.</Text>
          <Button label="Go Back" onPress={() => navigation.goBack()} fullWidth={false} />
        </View>
      </SafeAreaView>
    );
  }

  const currentCircle = circle;
  const stats = getCircleStats(currentCircle);
  const sc = circleStatusColor(currentCircle.status);

  function handleActivate() {
    Alert.alert('Activate Circle', 'Mark this circle as active and start tracking payments?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Activate', onPress: () => activateCircle(circleId) },
    ]);
  }

  function handleComplete() {
    Alert.alert('Mark as Completed', 'Mark this circle as fully completed?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Complete', onPress: () => completeCircle(circleId) },
    ]);
  }

  function handleDelete() {
    Alert.alert('Delete Circle', 'This will permanently delete the circle and all its data. This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteCircle(circleId);
          navigation.goBack();
        },
      },
    ]);
  }

  function renderCycle({ item: cycle }: { item: Cycle }) {
    const cycleStats = getCycleStats(cycle);
    const receiver = currentCircle.members.find(m => m.id === cycle.receivingMemberId);
    const allDone = cycleStats.paidCount + cycleStats.excusedCount === cycle.payments.length;
    const statusColor = allDone ? Colors.success : cycleStats.notPaidCount > 0 ? Colors.error : Colors.warning;
    const statusBg = allDone ? Colors.successBg : cycleStats.notPaidCount > 0 ? Colors.errorBg : Colors.warningBg;
    const statusLabel = allDone ? 'Done' : `${cycleStats.paidCount}/${cycle.payments.length}`;

    return (
      <Card
        style={styles.cycleCard}
        onPress={() => navigation.navigate('CycleDetail', { circleId, cycleId: cycle.id })}>
        <View style={styles.cycleRow}>
          <View style={styles.cycleNum}>
            <Text style={styles.cycleNumText}>{cycle.cycleNumber}</Text>
          </View>
          <View style={styles.cycleInfo}>
            <Text style={styles.cycleDate}>{formatDate(cycle.dueDate)}</Text>
            <Text style={styles.cycleReceiver} numberOfLines={1}>
              Receiver: <Text style={styles.receiverName}>{receiver?.name ?? 'Unassigned'}</Text>
            </Text>
          </View>
          <View style={styles.cycleRight}>
            <Badge label={statusLabel} color={statusColor} bg={statusBg} small />
            <Text style={styles.cyclePaid}>{formatCurrency(cycleStats.totalPaid, currentCircle.currency)}</Text>
          </View>
        </View>
      </Card>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar backgroundColor={Colors.primaryDark} barStyle="light-content" />
      <ScreenHeader
        title={currentCircle.name}
        subtitle={`${formatFrequency(currentCircle.frequency)} / ${currentCircle.currency}`}
        onBack={() => navigation.goBack()}
        right={<Button label="Delete" onPress={handleDelete} size="sm" fullWidth={false} variant="danger" />}
      />

      <FlatList
        data={currentCircle.cycles}
        keyExtractor={cycle => cycle.id}
        renderItem={renderCycle}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <Card variant="elevated" style={styles.summaryCard}>
              <View style={styles.summaryTop}>
                <View style={styles.summaryTitleWrap}>
                  <Text style={styles.payoutAmount}>{formatCurrency(currentCircle.payoutAmount, currentCircle.currency)}</Text>
                  <Text style={styles.payoutLabel}>Payout per turn</Text>
                </View>
                <Badge
                  label={currentCircle.status === 'active' ? 'Active' : currentCircle.status === 'planning' ? 'Planning' : 'Completed'}
                  color={sc.text}
                  bg={sc.bg}
                  dot
                />
              </View>

              <View style={styles.metaGrid}>
                <MetaItem label="Contribution" value={formatCurrency(currentCircle.contributionAmount, currentCircle.currency)} />
                <MetaItem label="Members" value={String(currentCircle.numberOfMembers)} />
                <MetaItem label="Start" value={formatDate(currentCircle.startDate)} />
              </View>

              <ProgressBar
                percent={stats.progressPercent}
                label={`${stats.completedCycles} of ${stats.totalCycles} cycles complete`}
                color={currentCircle.status === 'completed' ? Colors.success : Colors.primary}
              />

              <View style={styles.nextBanner}>
                <Text style={styles.nextBannerLabel}>{stats.nextCycle ? 'Next cycle due' : 'Cycle status'}</Text>
                <Text style={styles.nextBannerValue}>
                  {stats.nextCycle ? formatDate(stats.nextCycle.dueDate) : 'All cycles resolved'}
                </Text>
              </View>
            </Card>

            {currentCircle.status === 'planning' && (
              <Button label="Activate Circle" onPress={handleActivate} style={styles.actionBtn} />
            )}
            {currentCircle.status === 'active' && stats.completedCycles === stats.totalCycles && (
              <Button label="Mark as Completed" onPress={handleComplete} variant="ghost" style={styles.actionBtn} />
            )}

            <Text style={styles.sectionLabel}>Payment cycles</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaItem}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primaryDark },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, backgroundColor: Colors.background },
  notFoundText: { fontSize: FontSize.lg, color: Colors.textSecondary, fontWeight: '800' },
  list: { padding: Spacing.md, paddingBottom: Spacing.xxl, backgroundColor: Colors.background, flexGrow: 1 },
  summaryCard: { marginBottom: Spacing.md },
  summaryTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: Spacing.md, marginBottom: Spacing.md },
  summaryTitleWrap: { flex: 1 },
  payoutAmount: { fontSize: FontSize.xxl, fontWeight: '900', color: Colors.primaryDark },
  payoutLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  metaGrid: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  metaItem: {
    flex: 1,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: Spacing.sm,
  },
  metaLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '800' },
  metaValue: { fontSize: FontSize.sm, fontWeight: '900', color: Colors.text, marginTop: 3 },
  nextBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.primaryBg,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
    padding: Spacing.sm,
    marginTop: Spacing.sm,
    gap: Spacing.md,
  },
  nextBannerLabel: { fontSize: FontSize.sm, color: Colors.primaryDark, fontWeight: '800' },
  nextBannerValue: { fontSize: FontSize.sm, color: Colors.primaryDark, fontWeight: '900', flexShrink: 1, textAlign: 'right' },
  actionBtn: { marginBottom: Spacing.sm },
  sectionLabel: { fontSize: FontSize.xs, fontWeight: '900', color: Colors.textSecondary, marginBottom: Spacing.sm },
  cycleCard: { marginBottom: Spacing.sm },
  cycleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
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
  cycleRight: { alignItems: 'flex-end', gap: 4 },
  cyclePaid: { fontSize: FontSize.sm, fontWeight: '900', color: Colors.success },
});
