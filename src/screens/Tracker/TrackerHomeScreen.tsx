import React from 'react';
import {
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Badge from '../../components/common/Badge';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import ProgressBar from '../../components/common/ProgressBar';
import { useCircles } from '../../store/CircleContext';
import { Colors, FontSize, Radius, Spacing } from '../../theme';
import { Circle } from '../../types';
import { getCircleStats } from '../../utils/calculations';
import { formatDate } from '../../utils/dateUtils';
import { circleStatusColor, formatCurrency, formatFrequency } from '../../utils/formatters';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = { navigation: NativeStackNavigationProp<any> };

export default function TrackerHomeScreen({ navigation }: Props) {
  const { circles } = useCircles();
  const tracked = circles.filter(c => c.status === 'active' || c.status === 'completed');

  function renderCircle({ item }: { item: Circle }) {
    const sc = circleStatusColor(item.status);
    const stats = getCircleStats(item);

    return (
      <TouchableOpacity
        activeOpacity={0.82}
        onPress={() => navigation.navigate('CircleDetail', { circleId: item.id })}>
        <Card variant="elevated" style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.circleName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.circleFreq}>{formatFrequency(item.frequency)} · {item.numberOfMembers} members</Text>
            </View>
            <Badge label={item.status === 'active' ? 'Active' : 'Completed'} color={sc.text} bg={sc.bg} />
          </View>

          <View style={styles.amountRow}>
            <View>
              <Text style={styles.amtLabel}>Payout / Turn</Text>
              <Text style={styles.amtValue}>{formatCurrency(item.payoutAmount, item.currency)}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.amtLabel}>Contribution</Text>
              <Text style={styles.amtValue}>{formatCurrency(item.contributionAmount, item.currency)}</Text>
            </View>
          </View>

          <ProgressBar
            percent={stats.progressPercent}
            label={`Cycle ${stats.completedCycles} of ${stats.totalCycles}`}
            color={item.status === 'completed' ? Colors.success : Colors.primary}
          />

          {stats.nextCycle && (
            <View style={styles.nextCycle}>
              <Text style={styles.nextLabel}>Next cycle:</Text>
              <Text style={styles.nextValue}>
                {formatDate(stats.nextCycle.dueDate)} — {item.members.find(m => m.id === stats.nextCycle!.receivingMemberId)?.name ?? '—'}
              </Text>
            </View>
          )}
        </Card>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar backgroundColor={Colors.primary} barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Circle Tracker</Text>
        <Text style={styles.headerSub}>Monitor your active groups</Text>
      </View>

      {tracked.length === 0 ? (
        <View style={{ flex: 1, backgroundColor: Colors.background }}>
          <EmptyState
            icon="📊"
            title="No active circles yet"
            subtitle="Activate a circle from the Builder tab to start tracking payment cycles."
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
            <Text style={styles.sectionLabel}>YOUR CIRCLES ({tracked.length})</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primary },
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  list: { padding: Spacing.md, paddingBottom: Spacing.xxl, backgroundColor: Colors.background, flexGrow: 1 },
  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  card: { marginBottom: Spacing.sm },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing.sm },
  circleName: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },
  circleFreq: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  amountRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  amtLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '600' },
  amtValue: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.primary, marginTop: 2 },
  nextCycle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
    backgroundColor: Colors.primaryBg,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
  },
  nextLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '600' },
  nextValue: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '700', flex: 1 },
});
