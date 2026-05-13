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
import { Colors, FontSize, Spacing } from '../../theme';
import { Circle } from '../../types';
import { getCircleStats } from '../../utils/calculations';
import { circleStatusColor, formatCurrency, formatFrequency } from '../../utils/formatters';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = { navigation: NativeStackNavigationProp<any> };

export default function ReportsHomeScreen({ navigation }: Props) {
  const { circles } = useCircles();

  function renderCircle({ item }: { item: Circle }) {
    const sc = circleStatusColor(item.status);
    const stats = getCircleStats(item);

    return (
      <TouchableOpacity
        activeOpacity={0.82}
        onPress={() => navigation.navigate('CircleReport', { circleId: item.id })}>
        <Card variant="elevated" style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.circleName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.circleFreq}>{formatFrequency(item.frequency)} · {item.members.length} members</Text>
            </View>
            <Badge
              label={item.status === 'active' ? 'Active' : item.status === 'planning' ? 'Planning' : 'Completed'}
              color={sc.text} bg={sc.bg} small
            />
          </View>
          <View style={styles.amountRow}>
            <Text style={styles.amtValue}>{formatCurrency(item.payoutAmount, item.currency)}</Text>
            <Text style={styles.amtLabel}> per turn</Text>
          </View>
          <ProgressBar
            percent={stats.progressPercent}
            label={`${stats.completedCycles}/${stats.totalCycles} cycles`}
            color={Colors.primary}
          />
          <Text style={styles.viewReport}>View Full Report →</Text>
        </Card>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar backgroundColor={Colors.primary} barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reports</Text>
        <Text style={styles.headerSub}>View summaries and payment history</Text>
      </View>

      {circles.length === 0 ? (
        <View style={{ flex: 1, backgroundColor: Colors.background }}>
          <EmptyState
            icon="📋"
            title="No circles yet"
            subtitle="Build a savings circle to generate reports and track your group's progress."
          />
        </View>
      ) : (
        <FlatList
          data={circles}
          keyExtractor={c => c.id}
          renderItem={renderCircle}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.sectionLabel}>ALL CIRCLES ({circles.length})</Text>
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
  amountRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: Spacing.xs },
  amtValue: { fontSize: FontSize.xl, fontWeight: '800', color: Colors.primary },
  amtLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  viewReport: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '700', marginTop: Spacing.sm, textAlign: 'right' },
});
