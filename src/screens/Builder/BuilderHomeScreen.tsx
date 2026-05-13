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
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import ScreenHeader from '../../components/common/ScreenHeader';
import { useCircles } from '../../store/CircleContext';
import { Colors, FontSize, Spacing } from '../../theme';
import { Circle } from '../../types';
import { circleStatusColor, formatCurrency, formatFrequency } from '../../utils/formatters';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function BuilderHomeScreen({ navigation }: Props) {
  const { circles, resetDraft } = useCircles();
  const planning = circles.filter(c => c.status === 'planning');
  const draftValue = planning.reduce((sum, circle) => sum + circle.payoutAmount, 0);
  const memberSlots = planning.reduce((sum, circle) => sum + circle.numberOfMembers, 0);

  function handleCreate() {
    resetDraft();
    navigation.navigate('ModeSelection');
  }

  function renderCircle({ item }: { item: Circle }) {
    const sc = circleStatusColor(item.status);

    return (
      <Card
        variant="elevated"
        style={styles.circleCard}
        onPress={() => navigation.navigate('CircleDetail', { circleId: item.id, fromBuilder: true })}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleWrap}>
            <Text style={styles.circleName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.circleMeta}>{formatFrequency(item.frequency)} / {item.numberOfMembers} members</Text>
          </View>
          <Badge label="Planning" color={sc.text} bg={sc.bg} small dot />
        </View>

        <View style={styles.moneyRow}>
          <Metric label="Payout" value={formatCurrency(item.payoutAmount, item.currency)} />
          <Metric label="Each pays" value={formatCurrency(item.contributionAmount, item.currency)} alignRight />
        </View>
      </Card>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar backgroundColor={Colors.primaryDark} barStyle="light-content" />
      <ScreenHeader
        title="Builder"
        subtitle="Draft and validate new circles"
        right={<Button label="New" onPress={handleCreate} size="sm" fullWidth={false} variant="secondary" />}
      />

      {planning.length === 0 ? (
        <View style={styles.emptyWrap}>
          <EmptyState
            icon="+"
            title="No draft circles"
            subtitle="Start a circle, calculate the schedule, add members, and save it when the plan is ready."
            actionLabel="Build a Circle"
            onAction={handleCreate}
          />
        </View>
      ) : (
        <FlatList
          data={planning}
          keyExtractor={item => item.id}
          renderItem={renderCircle}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View>
              <View style={styles.summaryBand}>
                <SummaryBlock label="Drafts" value={String(planning.length)} />
                <SummaryBlock label="Members" value={String(memberSlots)} />
                <SummaryBlock label="Planned value" value={formatCurrency(draftValue, planning[0]?.currency ?? 'USD')} />
              </View>
              <Text style={styles.sectionLabel}>Draft circles</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

function SummaryBlock({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryBlock}>
      <Text style={styles.summaryValue} numberOfLines={1}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
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
  list: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
    backgroundColor: Colors.background,
    flexGrow: 1,
  },
  summaryBand: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  summaryBlock: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: Spacing.md,
  },
  summaryValue: { fontSize: FontSize.lg, fontWeight: '900', color: Colors.primaryDark },
  summaryLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '700', marginTop: 2 },
  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 0,
    marginBottom: Spacing.sm,
  },
  circleCard: { marginBottom: Spacing.sm },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, marginBottom: Spacing.md },
  cardTitleWrap: { flex: 1 },
  circleName: { fontSize: FontSize.lg, fontWeight: '900', color: Colors.text },
  circleMeta: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  moneyRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  metric: { flex: 1 },
  metricRight: { alignItems: 'flex-end' },
  metricLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '700' },
  metricValue: { fontSize: FontSize.md, color: Colors.primary, fontWeight: '900', marginTop: 2 },
});
