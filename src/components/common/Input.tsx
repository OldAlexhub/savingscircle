import React, { useState } from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Colors, FontSize, Radius, Spacing } from '../../theme';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  hint?: string;
  containerStyle?: StyleProp<ViewStyle>;
  rightElement?: React.ReactNode;
  required?: boolean;
}

export default function Input({
  label,
  error,
  hint,
  containerStyle,
  rightElement,
  required,
  ...props
}: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <View
        style={[
          styles.inputWrap,
          focused && styles.focused,
          !!error && styles.errorBorder,
        ]}>
        <TextInput
          style={styles.input}
          placeholderTextColor={Colors.textLight}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        {rightElement && <View style={styles.right}>{rightElement}</View>}
      </View>
      {!!error && <Text style={styles.errorText}>{error}</Text>}
      {!!hint && !error && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
}

export function PickerInput({
  label,
  value,
  onPress,
  hint,
  required,
}: {
  label: string;
  value: string;
  onPress: () => void;
  hint?: string;
  required?: boolean;
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <TouchableOpacity style={styles.pickerWrap} onPress={onPress} activeOpacity={0.7}>
        <Text style={styles.pickerValue} numberOfLines={1}>{value}</Text>
        <Text style={styles.pickerChevron}>v</Text>
      </TouchableOpacity>
      {!!hint && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: Spacing.md },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '800',
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    letterSpacing: 0,
  },
  required: { color: Colors.error },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
  },
  focused: { borderColor: Colors.primary },
  errorBorder: { borderColor: Colors.error },
  input: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.text,
    paddingVertical: Spacing.sm + 2,
    minHeight: 48,
  },
  right: { marginLeft: Spacing.sm },
  errorText: { fontSize: FontSize.xs, color: Colors.error, marginTop: 4, fontWeight: '700' },
  hint: { fontSize: FontSize.xs, color: Colors.textLight, marginTop: 4, lineHeight: 17 },
  pickerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    minHeight: 48,
    gap: Spacing.sm,
  },
  pickerValue: { flex: 1, fontSize: FontSize.md, color: Colors.text, fontWeight: '700' },
  pickerChevron: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '900' },
});
