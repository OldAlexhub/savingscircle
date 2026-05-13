import React, { useEffect, useState } from 'react';
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
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { useCircles } from '../../store/CircleContext';
import { Colors, FontSize, Radius, Shadow, Spacing } from '../../theme';
import { Member } from '../../types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = { navigation: NativeStackNavigationProp<any> };

function uid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

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
                <Text style={styles.memberName}>{member.name}</Text>
                {member.isOrganizer && (
                  <View style={styles.orgBadge}><Text style={styles.orgText}>Organizer</Text></View>
                )}
              </View>
              {!!member.notes && <Text style={styles.memberNotes}>{member.notes}</Text>}
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
                style={[styles.editInput, { marginTop: 4 }]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Notes (optional)"
                placeholderTextColor={Colors.textLight}
              />
            </>
          )}
        </View>
        <View style={styles.actions}>
          {!editing ? (
            <>
              <TouchableOpacity onPress={() => setEditing(true)} style={styles.iconBtn}>
                <Text style={styles.iconBtnText}>✎</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onDelete(member.id)} style={[styles.iconBtn, styles.deleteBtn]}>
                <Text style={[styles.iconBtnText, { color: Colors.error }]}>✕</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity onPress={save} style={[styles.iconBtn, styles.saveBtn]}>
              <Text style={[styles.iconBtnText, { color: Colors.success }]}>✓</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {!editing && (
        <View style={styles.memberFooter}>
          <TouchableOpacity onPress={() => onToggleOrganizer(member.id)} style={styles.orgToggle}>
            <Text style={styles.orgToggleText}>
              {member.isOrganizer ? '★ Organizer' : '☆ Set as Organizer'}
            </Text>
          </TouchableOpacity>
          <View style={styles.reorderBtns}>
            <TouchableOpacity
              disabled={index === 0}
              onPress={() => onMoveUp(index)}
              style={[styles.reorderBtn, index === 0 && styles.reorderBtnDisabled]}>
              <Text style={styles.reorderBtnText}>↑</Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={index === total - 1}
              onPress={() => onMoveDown(index)}
              style={[styles.reorderBtn, index === total - 1 && styles.reorderBtnDisabled]}>
              <Text style={styles.reorderBtnText}>↓</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
    const m: Member = {
      id: uid(),
      name: newName.trim(),
      isOrganizer: membersList.length === 0,
      notes: '',
    };
    setMembersList(prev => [...prev, m]);
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
      const a = [...prev];
      [a[index - 1], a[index]] = [a[index], a[index - 1]];
      return a;
    });
  }

  function moveDown(index: number) {
    setMembersList(prev => {
      const a = [...prev];
      [a[index], a[index + 1]] = [a[index + 1], a[index]];
      return a;
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

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar backgroundColor={Colors.primary} barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Add Members</Text>
          <Text style={styles.headerSub}>{membersList.length} of {needed} added</Text>
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: Colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
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
          ListHeaderComponent={
            <View>
              {remaining > 0 && (
                <View style={styles.addWrap}>
                  <TextInput
                    style={styles.addInput}
                    value={newName}
                    onChangeText={setNewName}
                    placeholder="Member name…"
                    placeholderTextColor={Colors.textLight}
                    onSubmitEditing={addMember}
                    returnKeyType="done"
                  />
                  <TouchableOpacity style={styles.addBtn} onPress={addMember} activeOpacity={0.8}>
                    <Text style={styles.addBtnText}>Add</Text>
                  </TouchableOpacity>
                </View>
              )}
              <View style={styles.progress}>
                <View style={[styles.progressBar, { width: `${Math.min(100, (membersList.length / needed) * 100)}%` as any }]} />
              </View>
              <Text style={styles.progressLabel}>
                {remaining > 0 ? `${remaining} more needed` : '✓ All members added'}
              </Text>
              <Text style={styles.sectionLabel}>MEMBERS</Text>
            </View>
          }
          ListFooterComponent={
            <Button
              label={`Next: Set Payout Order →`}
              onPress={proceed}
              disabled={membersList.length !== needed}
              style={{ marginTop: Spacing.md }}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      </KeyboardAvoidingView>
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
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  backBtn: { padding: Spacing.xs, marginTop: 2 },
  backIcon: { fontSize: 22, color: '#fff', fontWeight: '700' },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  list: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  addWrap: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
    ...Shadow.sm,
  },
  addInput: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.text,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  addBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    justifyContent: 'center',
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSize.sm },
  progress: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: Radius.full,
    marginBottom: Spacing.xs,
    overflow: 'hidden',
  },
  progressBar: { height: 4, backgroundColor: Colors.primary, borderRadius: Radius.full },
  progressLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.md },
  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  memberCard: { marginBottom: Spacing.sm },
  memberRow: { flexDirection: 'row', alignItems: 'flex-start' },
  avatarWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  avatarText: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.primary },
  memberInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  memberName: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  orgBadge: {
    backgroundColor: Colors.accentBg,
    borderRadius: Radius.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  orgText: { fontSize: FontSize.xs, color: Colors.accentDark, fontWeight: '700' },
  memberNotes: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  editInput: {
    fontSize: FontSize.md,
    color: Colors.text,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary,
    paddingVertical: 4,
  },
  actions: { flexDirection: 'row', gap: 4 },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    backgroundColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: { backgroundColor: Colors.errorBg },
  saveBtn: { backgroundColor: Colors.successBg },
  iconBtnText: { fontSize: 16, color: Colors.textSecondary, fontWeight: '700' },
  memberFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  orgToggle: { flex: 1 },
  orgToggleText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  reorderBtns: { flexDirection: 'row', gap: 4 },
  reorderBtn: {
    width: 30,
    height: 30,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reorderBtnDisabled: { opacity: 0.3 },
  reorderBtnText: { fontSize: 16, color: Colors.primary, fontWeight: '700' },
});
