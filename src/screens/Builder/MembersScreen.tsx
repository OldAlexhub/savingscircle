import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
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
import ProgressBar from '../../components/common/ProgressBar';
import ScreenHeader from '../../components/common/ScreenHeader';
import { useCircles } from '../../store/CircleContext';
import { Colors, FontSize, Radius, Spacing } from '../../theme';
import { Member } from '../../types';

type Props = { navigation: NativeStackNavigationProp<any> };

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function MemberRow({
  member,
  index,
  total,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  onToggleOrganizer,
}: {
  member: Member;
  index: number;
  total: number;
  onEdit: (id: string, name: string, notes: string) => void;
  onDelete: (id: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onToggleOrganizer: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(member.name);
  const [notes, setNotes] = useState(member.notes);

  function save() {
    if (!name.trim()) { return; }
    onEdit(member.id, name.trim(), notes.trim());
    setEditing(false);
  }

  return (
    <Card style={styles.memberCard}>
      <View style={styles.memberRow}>
        <View style={styles.avatarWrap}>
          <Text style={styles.avatarText}>{member.name.charAt(0).toUpperCase() || '?'}</Text>
        </View>
        <View style={styles.memberInfo}>
          {!editing ? (
            <>
              <View style={styles.nameRow}>
                <Text style={styles.memberName} numberOfLines={1}>{member.name}</Text>
                {member.isOrganizer && (
                  <Badge label="Organizer" color={Colors.accentDark} bg={Colors.accentBg} small dot />
                )}
              </View>
              {!!member.notes && <Text style={styles.memberNotes} numberOfLines={2}>{member.notes}</Text>}
            </>
          ) : (
            <>
              <TextInput
                style={styles.editInput}
                value={name}
                onChangeText={setName}
                placeholder="Member name"
                placeholderTextColor={Colors.textLight}
                autoFocus
              />
              <TextInput
                style={[styles.editInput, styles.notesInput]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Notes (optional)"
                placeholderTextColor={Colors.textLight}
              />
            </>
          )}
        </View>
      </View>

      <View style={styles.memberFooter}>
        {!editing ? (
          <>
            <TouchableOpacity onPress={() => onToggleOrganizer(member.id)} style={styles.footerAction}>
              <Text style={styles.footerActionText}>{member.isOrganizer ? 'Organizer' : 'Set organizer'}</Text>
            </TouchableOpacity>
            <View style={styles.footerButtons}>
              <MiniButton label="Up" disabled={index === 0} onPress={() => onMoveUp(index)} />
              <MiniButton label="Down" disabled={index === total - 1} onPress={() => onMoveDown(index)} />
              <MiniButton label="Edit" onPress={() => setEditing(true)} />
              <MiniButton label="Remove" danger onPress={() => onDelete(member.id)} />
            </View>
          </>
        ) : (
          <View style={styles.editActions}>
            <Button label="Save" size="sm" fullWidth={false} onPress={save} />
            <Button label="Cancel" size="sm" fullWidth={false} variant="ghost" onPress={() => setEditing(false)} />
          </View>
        )}
      </View>
    </Card>
  );
}

export default function MembersScreen({ navigation }: Props) {
  const { draft, setDraft } = useCircles();
  const needed = draft.numberOfMembers ?? 1;
  const [membersList, setMembersList] = useState<Member[]>(draft.members ?? []);
  const [newName, setNewName] = useState('');

  function addMember() {
    if (!newName.trim()) { return; }
    if (membersList.length >= needed) {
      Alert.alert('Limit Reached', `This circle needs exactly ${needed} member(s).`);
      return;
    }
    const member: Member = {
      id: uid(),
      name: newName.trim(),
      isOrganizer: membersList.length === 0,
      notes: '',
    };
    setMembersList(prev => [...prev, member]);
    setNewName('');
  }

  function editMember(id: string, name: string, notes: string) {
    setMembersList(prev => prev.map(m => m.id === id ? { ...m, name, notes } : m));
  }

  function deleteMember(id: string) {
    Alert.alert('Remove Member', 'Remove this member from the circle?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => setMembersList(prev => prev.filter(m => m.id !== id)) },
    ]);
  }

  function moveUp(index: number) {
    setMembersList(prev => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  }

  function moveDown(index: number) {
    setMembersList(prev => {
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  }

  function toggleOrganizer(id: string) {
    setMembersList(prev => prev.map(m => ({ ...m, isOrganizer: m.id === id })));
  }

  function proceed() {
    if (membersList.length !== needed) {
      Alert.alert('Member Count', `You need exactly ${needed} member(s). Currently: ${membersList.length}.`);
      return;
    }
    setDraft({
      members: membersList,
      payoutOrder: membersList.map(m => m.id),
    });
    navigation.navigate('PayoutOrder');
  }

  const remaining = needed - membersList.length;
  const progress = needed > 0 ? (membersList.length / needed) * 100 : 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar backgroundColor={Colors.primaryDark} barStyle="light-content" />
      <ScreenHeader
        title="Members"
        subtitle={`${membersList.length} of ${needed} added`}
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          data={membersList}
          keyExtractor={item => item.id}
          renderItem={({ item, index }) => (
            <MemberRow
              member={item}
              index={index}
              total={membersList.length}
              onEdit={editMember}
              onDelete={deleteMember}
              onMoveUp={moveUp}
              onMoveDown={moveDown}
              onToggleOrganizer={toggleOrganizer}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View>
              <View style={styles.stepBand}>
                <Step label="Mode" done />
                <Step label="Details" done />
                <Step label="Members" active />
                <Step label="Order" />
                <Step label="Preview" />
              </View>

              <Card variant="filled" style={styles.addCard}>
                <Text style={styles.addTitle}>Add each payout participant</Text>
                <Text style={styles.addSub}>
                  {remaining > 0 ? `${remaining} member(s) still needed.` : 'The member list is complete.'}
                </Text>
                {remaining > 0 && (
                  <View style={styles.addWrap}>
                    <TextInput
                      style={styles.addInput}
                      value={newName}
                      onChangeText={setNewName}
                      placeholder="Member name"
                      placeholderTextColor={Colors.textLight}
                      onSubmitEditing={addMember}
                      returnKeyType="done"
                    />
                    <Button label="Add" size="sm" fullWidth={false} onPress={addMember} />
                  </View>
                )}
                <ProgressBar percent={progress} label="Member list" />
              </Card>

              <Text style={styles.sectionLabel}>Members</Text>
            </View>
          }
          ListFooterComponent={
            <Button
              label="Next: Set Payout Order"
              onPress={proceed}
              disabled={membersList.length !== needed}
              style={styles.nextBtn}
            />
          }
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function MiniButton({ label, onPress, disabled, danger }: { label: string; onPress: () => void; disabled?: boolean; danger?: boolean }) {
  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      style={[styles.miniBtn, danger && styles.miniBtnDanger, disabled && styles.miniBtnDisabled]}>
      <Text style={[styles.miniBtnText, danger && styles.miniBtnTextDanger]}>{label}</Text>
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
  flex: { flex: 1, backgroundColor: Colors.background },
  list: { padding: Spacing.md, paddingBottom: Spacing.xxl, flexGrow: 1 },
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
  addCard: { marginBottom: Spacing.md },
  addTitle: { fontSize: FontSize.lg, fontWeight: '900', color: Colors.text },
  addSub: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2, marginBottom: Spacing.md },
  addWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  addInput: {
    flex: 1,
    minHeight: 44,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: '900',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  memberCard: { marginBottom: Spacing.sm },
  memberRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
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
  nameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: Spacing.xs },
  memberName: { flexShrink: 1, fontSize: FontSize.md, fontWeight: '900', color: Colors.text },
  memberNotes: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 3, lineHeight: 19 },
  editInput: {
    minHeight: 40,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceSecondary,
    paddingHorizontal: Spacing.sm,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  notesInput: { marginTop: Spacing.xs },
  memberFooter: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
  },
  footerAction: { marginBottom: Spacing.sm },
  footerActionText: { fontSize: FontSize.sm, color: Colors.primaryDark, fontWeight: '800' },
  footerButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
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
  miniBtnDanger: { backgroundColor: Colors.errorBg, borderColor: Colors.errorBorder },
  miniBtnDisabled: { opacity: 0.35 },
  miniBtnText: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '900' },
  miniBtnTextDanger: { color: Colors.error },
  editActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.sm },
  nextBtn: { marginTop: Spacing.md },
});
