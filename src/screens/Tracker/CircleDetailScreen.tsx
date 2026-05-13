import React from 'react';
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
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import ProgressBar from '../../components/common/ProgressBar';
import { useCircles } from '../../store/CircleContext';
import { Colors, FontSize, Radius, Spacing } from '../../theme';
import { Circle, Cycle } from '../../types';
import { getCycleStats, getCircleStats } from '../../utils/calculations';
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
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Circle not found.</Text>
          <Button label="Go Back" onPress={() => navigation.goBack()} fullWidth={false} />
        </View>
      </SafeAreaView>
    );
  }

  const stats = getCircleStats(circle);
  const sc = circleStatusColor(circle.status);

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
        text: 'Delete', style: 'destructive',
        onPress: () => {
          deleteCircle(circleId);
          navigation.goBack();
        },
      },
    ]);
  }

  function renderCycle({ item: cycle }: { item: Cycle }) {
    const cs = getCycleStats(cycle);
    const receiver = circle!.members.find(m => m.id === cycle.receivingMemberId);
    const allDone = cs.paidCount + cs.excusedCount === cycle.payments.length;
    const statusColor = allDone ? Colors.success : cs.notPaidCount > 0 ? Colors.error : Colors.warning;
    const statusBg = allDone ? Colors.successBg : cs.notPaidCount > 0 ? Colors.errorBg : Colors.warningBg;
    const statusLabel = allDone ? 'Done' : `${cs.paidCount}/${cycle.payments.length}`;

    return (
      <TouchableOpacity
        activeOpacity={0.82}
        onPress={() => navigation.navigate('CycleDetail', { circleId, cycleId: cycle.id })}>
        <Card style={styles.cycleCard}>
          <View style={styles.cycleRow}>
            <View style={styles.cycleNum}>
              <Text style={styles.cycleNumText}>{cycle.cycleNumber}</Text>
            </View>
            <View style={styles.cycleInfo}>
              <Text style={styles.cycleDate}>{formatDate(cycle.dueDate)}</Text>
              <Text style={styles.cycleReceiver}>
                → <Text style={{ color: Colors.primary, fontWeight: '700' }}>{receiver?.name ?? '—'}</Text>
              </Text>
            </View>
            <View style={styles.cycleRight}>
              <Badge label={statusLabel} color={statusColor} bg={statusBg} small />
              <Text style={styles.cyclePaid}>{formatCurrency(cs.totalPaid, circle!.currency)}</Text>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar backgroundColor={Colors.primary} barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle} numberOfLines={1}>{circle.name}</Text>
          <Text style={styles.headerSub}>{formatFrequency(circle.frequency)} · {circle.currency}</Text>
        </View>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
          <Text style={styles.deleteTxt}>🗑</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={circle.cycles}
        keyExtractor={c => c.id}
        renderItem={renderCycle}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {/* Summary card */}
            <Card variant="elevated" style={styles.summaryCard}>
              <View style={styles.summaryTop}>
                <View>
                  <Text style={styles.payoutAmount}>{formatCurrency(circle.payoutAmount, circle.currency)}</Text>
                  <Text style={styles.payoutLabel}>per payout turn</Text>
                </View>
                <Badge label={circle.status === 'active' ? 'Active' : circle.status === 'planning' ? 'Planning' : 'Completed'} color={sc.text} bg={sc.bg} />
              </View>

              <View style={styles.metaRow}>
                <MetaItem label="Contribution" value={formatCurrency(circle.contributionAmount, circle.currency)} />
                <MetaItem label="Members" value={String(circle.numberOfMembers)} />
                <MetaItem label="Start Date" value={formatDate(circle.startDate)} />
              </View>

              <ProgressBar
                percent={stats.progressPercent}
                label={`${stats.completedCycles} / ${stats.totalCycles} cycles done`}
                color={circle.status === 'completed' ? Colors.success : Colors.primary}
              />

              {stats.nextCycle && (
                <View style={styles.nextBanner}>
                  <Text style={styles.nextBannerLabel}>🔔 Next cycle due</Text>
                  <Text style={styles.nextBannerValue}>{formatDate(stats.nextCycle.dueDate)}</Text>
                </View>
              )}
            </Card>

            {/* Action buttons */}
            {circle.status === 'planning' && (
              <Button label="▶ Activate This Circle" onPress={handleActivate} style={{ marginBottom: Spacing.sm }} />
            )}
            {circle.status === 'active' && stats.completedCycles === stats.totalCycles && (
              <Button label="✓ Mark as Completed" onPress={handleComplete} variant="ghost" style={{ marginBottom: Spacing.sm }} />
            )}

            <Text style={styles.sectionLabel}>PAYMENT CYCLES ({circle.cycles.length})</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={miStyles.wrap}>
      <Text style={miStyles.label}>{label}</Text>
      <Text style={miStyles.value}>{value}</Text>
    </View>
  );
}

const miStyles = StyleSheet.create({
  wrap: { flex: 1 },
  label: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '600' },
  value: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text, marginTop: 2 },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primary },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  notFoundText: { fontSize: FontSize.lg, color: Colors.textSecondary },
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  backBtn: { padding: Spacing.xs },
  backIcon: { fontSize: 22, color: '#fff', fontWeight: '700' },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  deleteBtn: { padding: Spacing.sm },
  deleteTxt: { fontSize: 20 },
  list: { padding: Spacing.md, paddingBottom: Spacing.xxl, backgroundColor: Colors.background, flexGrow: 1 },
  summaryCard: { marginBottom: Spacing.md },
  summaryTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.md },
  payoutAmount: { fontSize: FontSize.xxxl, fontWeight: '800', color: Colors.primary },
  payoutLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  metaRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  nextBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.primaryBg,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    marginTop: Spacing.sm,
  },
  nextBannerLabel: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '600' },
  nextBannerValue: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '700' },
  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  cycleCard: { marginBottom: Spacing.sm },
  cycleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
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
  cycleRight: { alignItems: 'flex-end', gap: 4 },
  cyclePaid: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.success },
});
