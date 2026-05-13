import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors, FontSize, Radius, Spacing } from '../../theme';

interface Option {
  label: string;
  value: string;
  description?: string;
}

interface SelectSheetProps {
  visible: boolean;
  title: string;
  options: Option[];
  selectedValue?: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}

export default function SelectSheet({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
}: SelectSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.title}>{title}</Text>
        {options.map(opt => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.option, selectedValue === opt.value && styles.selected]}
            onPress={() => { onSelect(opt.value); onClose(); }}
            activeOpacity={0.7}>
            <View style={styles.optionContent}>
              <Text style={[styles.optionLabel, selectedValue === opt.value && styles.selectedLabel]}>
                {opt.label}
              </Text>
              {!!opt.description && (
                <Text style={styles.optionDesc}>{opt.description}</Text>
              )}
            </View>
            {selectedValue === opt.value && <Text style={styles.check}>✓</Text>}
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: Colors.overlay },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: Radius.full,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginBottom: Spacing.xs,
  },
  selected: { backgroundColor: Colors.primaryBg },
  optionContent: { flex: 1 },
  optionLabel: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text },
  selectedLabel: { color: Colors.primary },
  optionDesc: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  check: { fontSize: 18, color: Colors.primary, fontWeight: '700' },
  cancelBtn: {
    marginTop: Spacing.sm,
    padding: Spacing.md,
    alignItems: 'center',
    borderRadius: Radius.md,
    backgroundColor: Colors.borderLight,
  },
  cancelText: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textSecondary },
});
