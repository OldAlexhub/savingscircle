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
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Cycle not found.</Text>
          <Button label="Go Back" onPress={() => navigation.goBack()} fullWidth={false} />
        </View>
      </SafeAreaView>
    );
  }

  const receiver = circle.members.find(m => m.id === cycle.receivingMemberId);
  const stats = getCycleStats(cycle);

  function openEdit(payment: Payment) {
    setEditingPayment(payment);
    setEditStatus(payment.status);
    setEditAmount(payment.paidAmount > 0 ? String(payment.paidAmount) : '');
    setEditNotes(payment.notes);
  }

  async function saveEdit() {
    if (!editingPayment) { return; }
    const paidAmount = editStatus === 'paid'
      ? cycle!.contributionPerMember
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
    return circle!.members.find(m => m.id === id);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar backgroundColor={Colors.primary} barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Cycle {cycle.cycleNumber}</Text>
          <Text style={styles.headerSub}>{formatDate(cycle.dueDate)}</Text>
        </View>
      </View>

      <FlatList
        data={cycle.payments}
        keyExtractor={p => p.memberId}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <Card variant="elevated" style={styles.summaryCard}>
              <View style={styles.summaryTop}>
                <View>
                  <Text style={styles.cycleAmtLabel}>Total Payout</Text>
                  <Text style={styles.cycleAmt}>{formatCurrency(cycle.totalPayout, circle.currency)}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.cycleAmtLabel}>Receiver</Text>
                  <Text style={[styles.cycleAmt, { color: Colors.primary }]}>{receiver?.name ?? '—'}</Text>
                </View>
              </View>

              {/* Payment summary grid */}
              <View style={styles.statsGrid}>
                <StatChip label="Paid" value={stats.paidCount} color={Colors.statusPaid} bg={Colors.statusPaidBg} />
                <StatChip label="Not Paid" value={stats.notPaidCount} color={Colors.statusNotPaid} bg={Colors.statusNotPaidBg} />
                <StatChip label="Partial" value={stats.partialCount} color={Colors.statusPartial} bg={Colors.statusPartialBg} />
                <StatChip label="Delayed" value={stats.delayedCount} color={Colors.statusDelayed} bg={Colors.statusDelayedBg} />
                <StatChip label="Excused" value={stats.excusedCount} color={Colors.statusExcused} bg={Colors.statusExcusedBg} />
              </View>

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Collected so far:</Text>
                <Text style={styles.totalValue}>{formatCurrency(stats.totalPaid, circle.currency)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Remaining:</Text>
                <Text style={[styles.totalValue, { color: stats.remaining > 0 ? Colors.error : Colors.success }]}>
                  {formatCurrency(stats.remaining, circle.currency)}
                </Text>
              </View>
            </Card>

            <Text style={styles.sectionLabel}>MEMBER PAYMENTS ({cycle.payments.length})</Text>
          </View>
        }
        renderItem={({ item: payment }) => {
          const member = getMember(payment.memberId);
          const sc = statusColor(payment.status);
          const isReceiver = payment.memberId === cycle.receivingMemberId;

          return (
            <TouchableOpacity activeOpacity={0.82} onPress={() => openEdit(payment)}>
              <Card style={styles.paymentCard}>
                <View style={styles.paymentRow}>
                  <View style={styles.avatarWrap}>
                    <Text style={styles.avatarText}>{member?.name.charAt(0).toUpperCase() ?? '?'}</Text>
                  </View>
                  <View style={styles.memberInfo}>
                    <View style={styles.memberNameRow}>
                      <Text style={styles.memberName}>{member?.name ?? '—'}</Text>
                      {isReceiver && (
                        <View style={styles.receiverTag}>
                          <Text style={styles.receiverTagText}>Receiver</Text>
                        </View>
                      )}
                    </View>
                    {!!payment.notes && (
                      <Text style={styles.paymentNotes} numberOfLines={1}>{payment.notes}</Text>
                    )}
                    {payment.status === 'partial' && payment.paidAmount > 0 && (
                      <Text style={styles.partialAmount}>Paid: {formatCurrency(payment.paidAmount, circle.currency)}</Text>
                    )}
                  </View>
                  <View style={styles.statusRight}>
                    <Badge label={formatStatus(payment.status)} color={sc.text} bg={sc.bg} small />
                    <Text style={styles.editHint}>tap to edit</Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          );
        }}
      />

      {/* Edit payment modal */}
      <Modal visible={!!editingPayment} transparent animationType="slide" onRequestClose={() => setEditingPayment(null)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setEditingPayment(null)} />
        <View style={styles.modalSheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>
            Update Payment — {getMember(editingPayment?.memberId ?? '')?.name ?? ''}
          </Text>

          <Text style={styles.sheetLabel}>STATUS</Text>
          <View style={styles.statusOptions}>
            {ALL_STATUSES.map(s => {
              const sc = statusColor(s);
              return (
                <TouchableOpacity
                  key={s}
                  style={[styles.statusOption, editStatus === s && { backgroundColor: sc.bg, borderColor: sc.text }]}
                  onPress={() => setEditStatus(s)}>
                  <Text style={[styles.statusOptionText, editStatus === s && { color: sc.text }]}>
                    {formatStatus(s)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {editStatus === 'partial' && (
            <View style={{ marginBottom: Spacing.md }}>
              <Text style={styles.sheetLabel}>AMOUNT PAID</Text>
              <TextInput
                style={styles.sheetInput}
                value={editAmount}
                onChangeText={setEditAmount}
                keyboardType="decimal-pad"
                placeholder={`Max: ${cycle.contributionPerMember}`}
                placeholderTextColor={Colors.textLight}
              />
            </View>
          )}

          <Text style={styles.sheetLabel}>NOTES (optional)</Text>
          <TextInput
            style={[styles.sheetInput, { marginBottom: Spacing.lg }]}
            value={editNotes}
            onChangeText={setEditNotes}
            placeholder="Add a note…"
            placeholderTextColor={Colors.textLight}
          />

          <Button label="Save" onPress={saveEdit} />
          <Button label="Cancel" onPress={() => setEditingPayment(null)} variant="ghost" style={{ marginTop: Spacing.sm }} />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function StatChip({ label, value, color, bg }: { label: string; value: number; color: string; bg: string }) {
  return (
    <View style={[scStyles.chip, { backgroundColor: bg }]}>
      <Text style={[scStyles.value, { color }]}>{value}</Text>
      <Text style={[scStyles.label, { color }]}>{label}</Text>
    </View>
  );
}

const scStyles = StyleSheet.create({
  chip: { flex: 1, borderRadius: Radius.sm, padding: Spacing.sm, alignItems: 'center', margin: 2 },
  value: { fontSize: FontSize.xl, fontWeight: '800' },
  label: { fontSize: FontSize.xs, fontWeight: '600', marginTop: 2 },
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
  list: { padding: Spacing.md, paddingBottom: Spacing.xxl, backgroundColor: Colors.background, flexGrow: 1 },
  summaryCard: { marginBottom: Spacing.md },
  summaryTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.md },
  cycleAmtLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '600' },
  cycleAmt: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.text, marginTop: 2 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', margin: -2, marginBottom: Spacing.sm },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.xs },
  totalLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  totalValue: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  paymentCard: { marginBottom: Spacing.sm },
  paymentRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  avatarWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.primary },
  memberInfo: { flex: 1 },
  memberNameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  memberName: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  receiverTag: {
    backgroundColor: Colors.accentBg,
    borderRadius: Radius.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  receiverTagText: { fontSize: FontSize.xs, color: Colors.accentDark, fontWeight: '700' },
  paymentNotes: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  partialAmount: { fontSize: FontSize.sm, color: Colors.warning, fontWeight: '600', marginTop: 2 },
  statusRight: { alignItems: 'flex-end', gap: 4 },
  editHint: { fontSize: FontSize.xs, color: Colors.textLight },
  modalOverlay: { flex: 1, backgroundColor: Colors.overlay },
  modalSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
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
  sheetTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text, marginBottom: Spacing.md },
  sheetLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  statusOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  statusOption: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.borderLight,
  },
  statusOptionText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textSecondary },
  sheetInput: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.md,
    color: Colors.text,
  },
});
