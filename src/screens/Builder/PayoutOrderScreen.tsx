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
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { useCircles } from '../../store/CircleContext';
import { Colors, FontSize, Radius, Spacing } from '../../theme';
import { Member } from '../../types';
import { shuffleArray } from '../../utils/calculations';
import { formatDate } from '../../utils/dateUtils';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

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
      const a = [...prev];
      [a[index - 1], a[index]] = [a[index], a[index - 1]];
      return a;
    });
  }

  function moveDown(index: number) {
    if (isLocked || index === order.length - 1) { return; }
    setOrder(prev => {
      const a = [...prev];
      [a[index], a[index + 1]] = [a[index + 1], a[index]];
      return a;
    });
  }

  function randomize() {
    if (isLocked) { return; }
    Alert.alert(
      'Randomize Order?',
      'Review this order before saving.\n\nSavings Circle only helps you organize your group and does not manage or guarantee payments.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Randomize',
          onPress: () => setOrder(shuffleArray([...order])),
        },
      ],
    );
  }

  function lockOrder() {
    Alert.alert(
      'Lock This Order?',
      'Once locked, the payout order is fixed for the schedule. You can still unlock it before saving the circle.',
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

  const startDate = draft.startDate ?? '';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar backgroundColor={Colors.primary} barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Payout Order</Text>
          <Text style={styles.headerSub}>Who collects first?</Text>
        </View>
        {!isLocked ? (
          <TouchableOpacity onPress={randomize} style={styles.shuffleBtn} activeOpacity={0.8}>
            <Text style={styles.shuffleText}>🔀 Shuffle</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => setIsLocked(false)} style={styles.unlockBtn} activeOpacity={0.8}>
            <Text style={styles.unlockText}>🔓 Unlock</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={order}
        keyExtractor={id => id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {isLocked && (
              <View style={styles.lockedBanner}>
                <Text style={styles.lockedText}>🔒 Order is locked. Tap Unlock to edit.</Text>
              </View>
            )}
            <Text style={styles.sectionLabel}>PAYOUT SEQUENCE</Text>
          </View>
        }
        renderItem={({ item: id, index }) => {
          const m = getMember(id);
          if (!m) { return null; }
          return (
            <Card style={styles.memberCard}>
              <View style={styles.memberRow}>
                <View style={styles.turnBadge}>
                  <Text style={styles.turnNum}>#{index + 1}</Text>
                </View>
                <View style={styles.avatarWrap}>
                  <Text style={styles.avatarText}>{m.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.info}>
                  <Text style={styles.memberName}>{m.name}</Text>
                  {m.isOrganizer && (
                    <Text style={styles.orgLabel}>Organizer</Text>
                  )}
                </View>
                {!isLocked && (
                  <View style={styles.reorderBtns}>
                    <TouchableOpacity
                      disabled={index === 0}
                      onPress={() => moveUp(index)}
                      style={[styles.reorderBtn, index === 0 && styles.dimmed]}>
                      <Text style={styles.reorderBtnText}>↑</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      disabled={index === order.length - 1}
                      onPress={() => moveDown(index)}
                      style={[styles.reorderBtn, index === order.length - 1 && styles.dimmed]}>
                      <Text style={styles.reorderBtnText}>↓</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {isLocked && <Text style={styles.lockIcon}>🔒</Text>}
              </View>
            </Card>
          );
        }}
        ListFooterComponent={
          <View>
            {!isLocked && (
              <Button
                label="🔒 Lock This Order"
                onPress={lockOrder}
                variant="outline"
                style={{ marginBottom: Spacing.sm }}
              />
            )}
            <Button
              label="Next: Preview Schedule →"
              onPress={proceed}
            />
            <View style={styles.disclaimer}>
              <Text style={styles.disclaimerText}>
                This order determines when each person collects. Savings Circle is a planning tool only and does not manage or guarantee payments.
              </Text>
            </View>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primary },
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
  shuffleBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  shuffleText: { color: '#fff', fontWeight: '700', fontSize: FontSize.sm },
  unlockBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  unlockText: { color: '#fff', fontWeight: '700', fontSize: FontSize.sm },
  list: { padding: Spacing.md, paddingBottom: Spacing.xxl, backgroundColor: Colors.background, flexGrow: 1 },
  lockedBanner: {
    backgroundColor: Colors.successBg,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  lockedText: { fontSize: FontSize.sm, color: Colors.success, fontWeight: '600' },
  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  memberCard: { marginBottom: Spacing.sm },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  turnBadge: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  turnNum: { fontSize: FontSize.sm, fontWeight: '800', color: '#fff' },
  avatarWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: FontSize.md, fontWeight: '700', color: Colors.primary },
  info: { flex: 1 },
  memberName: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  orgLabel: { fontSize: FontSize.xs, color: Colors.accentDark, fontWeight: '600' },
  reorderBtns: { flexDirection: 'row', gap: 4 },
  reorderBtn: {
    width: 30,
    height: 30,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dimmed: { opacity: 0.3 },
  reorderBtnText: { fontSize: 16, color: Colors.primary, fontWeight: '700' },
  lockIcon: { fontSize: 18 },
  disclaimer: {
    backgroundColor: Colors.accentBg,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  disclaimerText: { fontSize: FontSize.sm, color: Colors.accentDark, lineHeight: 20 },
});
