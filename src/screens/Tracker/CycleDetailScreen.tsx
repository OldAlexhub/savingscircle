import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import ScreenHeader from '../../components/common/ScreenHeader';
import { useCircles } from '../../store/CircleContext';
import { Colors, FontSize, Radius, Spacing } from '../../theme';
import { Circle, Cycle, Member, Payment, PaymentStatus } from '../../types';
import { getCycleStats } from '../../utils/calculations';
import { formatDate } from '../../utils/dateUtils';
import { formatCurrency, formatStatus, statusColor } from '../../utils/formatters';

type Props = {
  navigation: any;
  route: any;
};

const ALL_STATUSES: PaymentStatus[] = ['paid', 'not_paid', 'partial', 'delayed', 'excused'];

export default function CycleDetailScreen({ navigation, route }: Props) {
  const { circleId, cycleId } = route.params;
  const { getCircle, updatePayment } = useCircles();
  const circle = getCircle(circleId) as Circle | undefined;
  const cycle = circle?.cycles.find(c => c.id === cycleId) as Cycle | undefined;

  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [editStatus, setEditStatus] = useState<PaymentStatus>('paid');
  const [editAmount, setEditAmount] = useState('');
  const [editNotes, setEditNotes] = useState('');

  if (!circle || !cycle) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <StatusBar backgroundColor={Colors.primaryDark} barStyle="light-content" />
        <ScreenHeader title="Cycle" subtitle="Not found" onBack={() => navigation.goBack()} />
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Cycle not found.</Text>
          <Button label="Go Back" onPress={() => navigation.goBack()} fullWidth={false} />
        </View>
      </SafeAreaView>
    );
  }

  const currentCircle = circle;
  const currentCycle = cycle;
  const receiver = currentCircle.members.find(m => m.id === currentCycle.receivingMemberId);
  const stats = getCycleStats(currentCycle);
  const collectedPercent = stats.totalExpected > 0 ? (stats.totalPaid / stats.totalExpected) * 100 : 0;

  function openEdit(payment: Payment) {
    setEditingPayment(payment);
    setEditStatus(payment.status);
    setEditAmount(payment.paidAmount > 0 ? String(payment.paidAmount) : '');
    setEditNotes(payment.notes);
  }

  async function saveEdit() {
    if (!editingPayment) { return; }
    const paidAmount = editStatus === 'paid'
      ? currentCycle.contributionPerMember
      : editStatus === 'partial'
        ? (parseFloat(editAmount) || 0)
        : 0;
    await updatePayment(circleId, cycleId, editingPayment.memberId, {
      status: editStatus,
      paidAmount,
      notes: editNotes,
    });
    setEditingPayment(null);
  }

  function getMember(id: string): Member | undefined {
    return currentCircle.members.find(m => m.id === id);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar backgroundColor={Colors.primaryDark} barStyle="light-content" />
      <ScreenHeader
        title={`Cycle ${currentCycle.cycleNumber}`}
        subtitle={`${formatDate(currentCycle.dueDate)} / ${currentCircle.name}`}
        onBack={() => navigation.goBack()}
      />

      <FlatList
        data={currentCycle.payments}
        keyExtractor={payment => payment.memberId}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <Card variant="elevated" style={styles.summaryCard}>
              <View style={styles.summaryTop}>
                <Metric label="Total payout" value={formatCurrency(currentCycle.totalPayout, currentCircle.currency)} />
                <Metric label="Receiver" value={receiver?.name ?? 'Unassigned'} alignRight />
              </View>

              <View style={styles.statsGrid}>
                <StatChip label="Paid" value={stats.paidCount} color={Colors.statusPaid} bg={Colors.statusPaidBg} />
                <StatChip label="Not paid" value={stats.notPaidCount} color={Colors.statusNotPaid} bg={Colors.statusNotPaidBg} />
                <StatChip label="Partial" value={stats.partialCount} color={Colors.statusPartial} bg={Colors.statusPartialBg} />
                <StatChip label="Delayed" value={stats.delayedCount} color={Colors.statusDelayed} bg={Colors.statusDelayedBg} />
                <StatChip label="Excused" value={stats.excusedCount} color={Colors.statusExcused} bg={Colors.statusExcusedBg} />
              </View>

              <View style={styles.collectionBar}>
                <Text style={styles.collectionLabel}>Collection progress</Text>
                <Text style={styles.collectionValue}>{Math.round(collectedPercent)}%</Text>
              </View>
              <View style={styles.totalRows}>
                <TotalRow label="Collected" value={formatCurrency(stats.totalPaid, currentCircle.currency)} color={Colors.success} />
                <TotalRow
                  label="Remaining"
                  value={formatCurrency(stats.remaining, currentCircle.currency)}
                  color={stats.remaining > 0 ? Colors.error : Colors.success}
                />
              </View>
            </Card>

            <Text style={styles.sectionLabel}>Member payments</Text>
          </View>
        }
        renderItem={({ item: payment }) => {
          const member = getMember(payment.memberId);
          const sc = statusColor(payment.status);
          const isReceiver = payment.memberId === currentCycle.receivingMemberId;

          return (
            <Card style={styles.paymentCard} onPress={() => openEdit(payment)}>
              <View style={styles.paymentRow}>
                <View style={styles.avatarWrap}>
                  <Text style={styles.avatarText}>{member?.name.charAt(0).toUpperCase() ?? '?'}</Text>
                </View>
                <View style={styles.memberInfo}>
                  <View style={styles.memberNameRow}>
                    <Text style={styles.memberName} numberOfLines={1}>{member?.name ?? 'Unknown member'}</Text>
                    {isReceiver && (
                      <Badge label="Receiver" color={Colors.accentDark} bg={Colors.accentBg} small />
                    )}
                  </View>
                  {!!payment.notes && (
                    <Text style={styles.paymentNotes} numberOfLines={1}>{payment.notes}</Text>
                  )}
                  {payment.status === 'partial' && payment.paidAmount > 0 && (
                    <Text style={styles.partialAmount}>Paid: {formatCurrency(payment.paidAmount, currentCircle.currency)}</Text>
                  )}
                </View>
                <View style={styles.statusRight}>
                  <Badge label={formatStatus(payment.status)} color={sc.text} bg={sc.bg} small dot />
                  <Text style={styles.editHint}>Edit</Text>
                </View>
              </View>
            </Card>
          );
        }}
      />

      <Modal visible={!!editingPayment} transparent animationType="slide" onRequestClose={() => setEditingPayment(null)}>
        <View style={styles.modalRoot}>
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setEditingPayment(null)} />
          <View style={styles.modalSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>
              Update {getMember(editingPayment?.memberId ?? '')?.name ?? 'payment'}
            </Text>

            <Text style={styles.sheetLabel}>Status</Text>
            <View style={styles.statusOptions}>
              {ALL_STATUSES.map(status => {
                const sc = statusColor(status);
                const selected = editStatus === status;
                return (
                  <TouchableOpacity
                    key={status}
                    style={[styles.statusOption, selected && { backgroundColor: sc.bg, borderColor: sc.text }]}
                    onPress={() => setEditStatus(status)}>
                    <Text style={[styles.statusOptionText, selected && { color: sc.text }]}>
                      {formatStatus(status)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {editStatus === 'partial' && (
              <View style={styles.sheetField}>
                <Text style={styles.sheetLabel}>Amount paid</Text>
                <TextInput
                  style={styles.sheetInput}
                  value={editAmount}
                  onChangeText={setEditAmount}
                  keyboardType="decimal-pad"
                  placeholder={`Max: ${currentCycle.contributionPerMember}`}
                  placeholderTextColor={Colors.textLight}
                />
              </View>
            )}

            <Text style={styles.sheetLabel}>Notes</Text>
            <TextInput
              style={[styles.sheetInput, styles.notesField]}
              value={editNotes}
              onChangeText={setEditNotes}
              placeholder="Optional note"
              placeholderTextColor={Colors.textLight}
            />

            <Button label="Save" onPress={saveEdit} />
            <Button label="Cancel" onPress={() => setEditingPayment(null)} variant="ghost" style={styles.cancelBtn} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function Metric({ label, value, alignRight }: { label: string; value: string; alignRight?: boolean }) {
  return (
    <View style={[styles.metric, alignRight && styles.metricRight]}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue} numberOfLines={2}>{value}</Text>
    </View>
  );
}

function StatChip({ label, value, color, bg }: { label: string; value: number; color: string; bg: string }) {
  return (
    <View style={[styles.statChip, { backgroundColor: bg, borderColor: color }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color }]} numberOfLines={1}>{label}</Text>
    </View>
  );
}

function TotalRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.totalRow}>
      <Text style={styles.totalLabel}>{label}</Text>
      <Text style={[styles.totalValue, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primaryDark },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, backgroundColor: Colors.background },
  notFoundText: { fontSize: FontSize.lg, color: Colors.textSecondary, fontWeight: '800' },
  list: { padding: Spacing.md, paddingBottom: Spacing.xxl, backgroundColor: Colors.background, flexGrow: 1 },
  summaryCard: { marginBottom: Spacing.md },
  summaryTop: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.md, marginBottom: Spacing.md },
  metric: { flex: 1 },
  metricRight: { alignItems: 'flex-end' },
  metricLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '800' },
  metricValue: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.text, marginTop: 3 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginBottom: Spacing.md },
  statChip: {
    minWidth: '30%',
    flexGrow: 1,
    borderRadius: 8,
    borderWidth: 1,
    padding: Spacing.sm,
    alignItems: 'center',
  },
  statValue: { fontSize: FontSize.lg, fontWeight: '900' },
  statLabel: { fontSize: FontSize.xs, fontWeight: '800', marginTop: 2 },
  collectionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  collectionLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '800' },
  collectionValue: { fontSize: FontSize.sm, color: Colors.primaryDark, fontWeight: '900' },
  totalRows: { marginTop: Spacing.sm },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.xs, gap: Spacing.md },
  totalLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '700' },
  totalValue: { fontSize: FontSize.md, fontWeight: '900', flexShrink: 1, textAlign: 'right' },
  sectionLabel: { fontSize: FontSize.xs, fontWeight: '900', color: Colors.textSecondary, marginBottom: Spacing.sm },
  paymentCard: { marginBottom: Spacing.sm },
  paymentRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  avatarWrap: {
    width: 42,
    height: 42,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primaryBg,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: FontSize.lg, fontWeight: '900', color: Colors.primaryDark },
  memberInfo: { flex: 1 },
  memberNameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: Spacing.xs },
  memberName: { flexShrink: 1, fontSize: FontSize.md, fontWeight: '900', color: Colors.text },
  paymentNotes: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  partialAmount: { fontSize: FontSize.sm, color: Colors.warning, fontWeight: '800', marginTop: 2 },
  statusRight: { alignItems: 'flex-end', gap: 4 },
  editHint: { fontSize: FontSize.xs, color: Colors.textLight, fontWeight: '800' },
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  modalOverlay: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: Colors.overlay },
  modalSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: Radius.full,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  sheetTitle: { fontSize: FontSize.lg, fontWeight: '900', color: Colors.text, marginBottom: Spacing.md },
  sheetLabel: {
    fontSize: FontSize.xs,
    fontWeight: '900',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  statusOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  statusOption: {
    minHeight: 36,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusOptionText: { fontSize: FontSize.sm, fontWeight: '900', color: Colors.textSecondary },
  sheetField: { marginBottom: Spacing.md },
  sheetInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceSecondary,
    paddingHorizontal: Spacing.md,
    minHeight: 46,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  notesField: { marginBottom: Spacing.lg },
  cancelBtn: { marginTop: Spacing.sm },
});
