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
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import { useCircles } from '../../store/CircleContext';
import { Colors, FontSize, Radius, Spacing, Shadow } from '../../theme';
import { Circle } from '../../types';
import { circleStatusColor, formatCurrency, formatFrequency } from '../../utils/formatters';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function BuilderHomeScreen({ navigation }: Props) {
  const { circles, resetDraft } = useCircles();
  const planning = circles.filter(c => c.status === 'planning');

  function handleCreate() {
    resetDraft();
    navigation.navigate('ModeSelection');
  }

  function renderCircle({ item }: { item: Circle }) {
    const sc = circleStatusColor(item.status);
    return (
      <TouchableOpacity
        activeOpacity={0.82}
        onPress={() => navigation.navigate('CircleDetail', { circleId: item.id, fromBuilder: true })}>
        <Card variant="elevated" style={styles.circleCard}>
          <View style={styles.cardTop}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.circleName} numberOfLines={1}>{item.name}</Text>
              <Badge label={sc.text === '#D97706' ? 'Planning' : item.status} color={sc.text} bg={sc.bg} small />
            </View>
            <Text style={styles.circleAmount}>
              {formatCurrency(item.payoutAmount, item.currency)}
            </Text>
          </View>
          <View style={styles.cardMeta}>
            <Text style={styles.metaItem}>👥 {item.numberOfMembers} members</Text>
            <Text style={styles.metaItem}>🔁 {formatFrequency(item.frequency)}</Text>
            <Text style={styles.metaItem}>💰 {formatCurrency(item.contributionAmount, item.currency)}/person</Text>
          </View>
        </Card>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar backgroundColor={Colors.primary} barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Builder</Text>
          <Text style={styles.headerSub}>Design your savings circle</Text>
        </View>
        <TouchableOpacity style={styles.fab} onPress={handleCreate} activeOpacity={0.8}>
          <Text style={styles.fabIcon}>＋</Text>
        </TouchableOpacity>
      </View>

      {planning.length === 0 ? (
        <EmptyState
          icon="🏗️"
          title="No circles in planning"
          subtitle="Use the Builder to design your savings circle — choose a mode, set the payout amount, add members, and generate a schedule."
          actionLabel="Build a Circle"
          onAction={handleCreate}
        />
      ) : (
        <FlatList
          data={planning}
          keyExtractor={item => item.id}
          renderItem={renderCircle}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.sectionLabel}>DRAFT CIRCLES ({planning.length})</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  fab: {
    width: 52,
    height: 52,
    borderRadius: Radius.full,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md,
  },
  fabIcon: { fontSize: 28, color: '#fff', fontWeight: '700', lineHeight: 32 },
  list: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
    backgroundColor: Colors.background,
    flexGrow: 1,
  },
  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  circleCard: { marginBottom: Spacing.sm },
  cardTop: { marginBottom: Spacing.sm },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  circleName: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text, flex: 1, marginRight: Spacing.sm },
  circleAmount: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.primary },
  cardMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  metaItem: { fontSize: FontSize.sm, color: Colors.textSecondary },
});
