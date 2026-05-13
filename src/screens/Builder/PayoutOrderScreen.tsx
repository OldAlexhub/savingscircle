import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
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
import ScreenHeader from '../../components/common/ScreenHeader';
import { useCircles } from '../../store/CircleContext';
import { Colors, FontSize, Radius, Spacing } from '../../theme';
import { Member } from '../../types';
import { shuffleArray } from '../../utils/calculations';

type Props = { navigation: NativeStackNavigationProp<any> };

export default function PayoutOrderScreen({ navigation }: Props) {
  const { draft, setDraft } = useCircles();
  const members = draft.members ?? [];
  const [order, setOrder] = useState<string[]>(draft.payoutOrder ?? members.map(m => m.id));
  const [isLocked, setIsLocked] = useState(false);

  function getMember(id: string): Member | undefined {
    return members.find(m => m.id === id);
  }

  function moveUp(index: number) {
    if (isLocked || index === 0) { return; }
    setOrder(prev => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  }

  function moveDown(index: number) {
    if (isLocked || index === order.length - 1) { return; }
    setOrder(prev => {
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  }

  function randomize() {
    if (isLocked) { return; }
    Alert.alert(
      'Randomize Order?',
      'Review this order before saving. Savings Circle does not manage or guarantee payments.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Randomize', onPress: () => setOrder(shuffleArray([...order])) },
      ],
    );
  }

  function lockOrder() {
    Alert.alert(
      'Lock This Order?',
      'Once locked, the payout order is fixed for the generated schedule. You can unlock it before saving.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Lock', onPress: () => setIsLocked(true) },
      ],
    );
  }

  function proceed() {
    if (!isLocked) {
      Alert.alert(
        'Lock Required',
        'Please review and lock the payout order before proceeding.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Lock & Proceed', onPress: () => { setIsLocked(true); goNext(); } },
        ],
      );
      return;
    }
    goNext();
  }

  function goNext() {
    setDraft({ payoutOrder: order, isOrderLocked: true });
    navigation.navigate('SchedulePreview');
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar backgroundColor={Colors.primaryDark} barStyle="light-content" />
      <ScreenHeader
        title="Payout Order"
        subtitle={isLocked ? 'Order locked for schedule preview' : 'Arrange who receives each cycle'}
        onBack={() => navigation.goBack()}
        right={
          isLocked
            ? <Button label="Unlock" size="sm" fullWidth={false} variant="ghost" onPress={() => setIsLocked(false)} />
            : <Button label="Shuffle" size="sm" fullWidth={false} variant="ghost" onPress={randomize} />
        }
      />

      <FlatList
        data={order}
        keyExtractor={id => id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <View style={styles.stepBand}>
              <Step label="Mode" done />
              <Step label="Details" done />
              <Step label="Members" done />
              <Step label="Order" active />
              <Step label="Preview" />
            </View>
            <Card variant="filled" style={styles.orderSummary}>
              <View style={styles.summaryTop}>
                <View>
                  <Text style={styles.summaryTitle}>Payout sequence</Text>
                  <Text style={styles.summarySub}>{order.length} turns generated from the member list.</Text>
                </View>
                <Badge
                  label={isLocked ? 'Locked' : 'Editable'}
                  color={isLocked ? Colors.success : Colors.warning}
                  bg={isLocked ? Colors.successBg : Colors.warningBg}
                  small
                  dot
                />
              </View>
            </Card>
            <Text style={styles.sectionLabel}>Sequence</Text>
          </View>
        }
        renderItem={({ item: id, index }) => {
          const member = getMember(id);
          if (!member) { return null; }

          return (
            <Card style={styles.memberCard}>
              <View style={styles.memberRow}>
                <View style={styles.turnBadge}>
                  <Text style={styles.turnNum}>{index + 1}</Text>
                </View>
                <View style={styles.avatarWrap}>
                  <Text style={styles.avatarText}>{member.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.info}>
                  <View style={styles.nameLine}>
                    <Text style={styles.memberName} numberOfLines={1}>{member.name}</Text>
                    {member.isOrganizer && (
                      <Badge label="Organizer" color={Colors.accentDark} bg={Colors.accentBg} small />
                    )}
                  </View>
                  <Text style={styles.turnLabel}>Collects in cycle {index + 1}</Text>
                </View>
                {!isLocked ? (
                  <View style={styles.reorderBtns}>
                    <MiniButton label="Up" disabled={index === 0} onPress={() => moveUp(index)} />
                    <MiniButton label="Down" disabled={index === order.length - 1} onPress={() => moveDown(index)} />
                  </View>
                ) : (
                  <Badge label="Fixed" color={Colors.success} bg={Colors.successBg} small />
                )}
              </View>
            </Card>
          );
        }}
        ListFooterComponent={
          <View style={styles.footer}>
            {!isLocked && (
              <Button label="Lock This Order" onPress={lockOrder} variant="outline" style={styles.lockBtn} />
            )}
            <Button label="Next: Preview Schedule" onPress={proceed} />
            <View style={styles.notice}>
              <Text style={styles.noticeText}>
                This order only defines the generated schedule. Payments still happen outside the app.
              </Text>
            </View>
          </View>
        }
      />
    </SafeAreaView>
  );
}

function MiniButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <TouchableOpacity disabled={disabled} onPress={onPress} style={[styles.miniBtn, disabled && styles.miniBtnDisabled]}>
      <Text style={styles.miniBtnText}>{label}</Text>
    </TouchableOpacity>
  );
}

function Step({ label, active, done }: { label: string; active?: boolean; done?: boolean }) {
  return (
    <View style={[styles.step, done && styles.stepDone, active && styles.stepActive]}>
      <Text style={[styles.stepText, active && styles.stepTextActive, done && styles.stepTextDone]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primaryDark },
  list: { padding: Spacing.md, paddingBottom: Spacing.xxl, backgroundColor: Colors.background, flexGrow: 1 },
  stepBand: { flexDirection: 'row', gap: Spacing.xs, marginBottom: Spacing.lg },
  step: {
    flex: 1,
    minHeight: 30,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xs,
  },
  stepDone: { backgroundColor: Colors.primaryBg, borderColor: Colors.primaryBorder },
  stepActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  stepText: { fontSize: FontSize.xxs, fontWeight: '800', color: Colors.textSecondary },
  stepTextActive: { color: Colors.textOnPrimary },
  stepTextDone: { color: Colors.primaryDark },
  orderSummary: { marginBottom: Spacing.md },
  summaryTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.md },
  summaryTitle: { fontSize: FontSize.lg, fontWeight: '900', color: Colors.text },
  summarySub: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2, lineHeight: 19 },
  sectionLabel: { fontSize: FontSize.xs, fontWeight: '900', color: Colors.textSecondary, marginBottom: Spacing.sm },
  memberCard: { marginBottom: Spacing.sm },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  turnBadge: {
    width: 34,
    height: 34,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  turnNum: { fontSize: FontSize.sm, fontWeight: '900', color: Colors.textOnPrimary },
  avatarWrap: {
    width: 38,
    height: 38,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primaryBg,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: FontSize.md, fontWeight: '900', color: Colors.primaryDark },
  info: { flex: 1 },
  nameLine: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: Spacing.xs },
  memberName: { flexShrink: 1, fontSize: FontSize.md, fontWeight: '900', color: Colors.text },
  turnLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  reorderBtns: { flexDirection: 'row', gap: Spacing.xs },
  miniBtn: {
    minHeight: 30,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  miniBtnDisabled: { opacity: 0.35 },
  miniBtnText: { fontSize: FontSize.xs, color: Colors.primaryDark, fontWeight: '900' },
  footer: { marginTop: Spacing.md },
  lockBtn: { marginBottom: Spacing.sm },
  notice: {
    backgroundColor: Colors.accentBg,
    borderRadius: 8,
    padding: Spacing.md,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.accentBorder,
  },
  noticeText: { fontSize: FontSize.sm, color: Colors.accentDark, lineHeight: 20 },
});
