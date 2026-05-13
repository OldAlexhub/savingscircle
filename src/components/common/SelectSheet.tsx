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
        {options.map(option => {
          const selected = selectedValue === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              style={[styles.option, selected && styles.selected]}
              onPress={() => { onSelect(option.value); onClose(); }}
              activeOpacity={0.7}>
              <View style={styles.optionContent}>
                <Text style={[styles.optionLabel, selected && styles.selectedLabel]}>
                  {option.label}
                </Text>
                {!!option.description && (
                  <Text style={styles.optionDesc}>{option.description}</Text>
                )}
              </View>
              {selected && <View style={styles.checkDot} />}
            </TouchableOpacity>
          );
        })}
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
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
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
    fontWeight: '900',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.sm,
    marginBottom: Spacing.xs,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selected: {
    backgroundColor: Colors.primaryBg,
    borderColor: Colors.primaryBorder,
  },
  optionContent: { flex: 1 },
  optionLabel: { fontSize: FontSize.md, fontWeight: '800', color: Colors.text },
  selectedLabel: { color: Colors.primaryDark },
  optionDesc: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  checkDot: { width: 10, height: 10, borderRadius: Radius.full, backgroundColor: Colors.primary },
  cancelBtn: {
    marginTop: Spacing.sm,
    padding: Spacing.md,
    alignItems: 'center',
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelText: { fontSize: FontSize.md, fontWeight: '900', color: Colors.textSecondary },
});
