import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Colors, FontSize, Radius, Shadow, Spacing } from '../../theme';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  fullWidth?: boolean;
}

export default function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  icon,
  style,
  fullWidth = true,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const spinnerColor =
    variant === 'outline' || variant === 'ghost'
      ? Colors.primary
      : Colors.textOnPrimary;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={spinnerColor} size="small" />
      ) : (
        <View style={styles.row}>
          {icon && <View style={styles.iconWrap}>{icon}</View>}
          <Text style={[styles.label, styles[`${variant}Label`], styles[`${size}Label`]]}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  fullWidth: { width: '100%' },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconWrap: { marginRight: Spacing.sm },
  label: { fontWeight: '800', letterSpacing: 0 },
  pressed: { transform: [{ scale: 0.99 }], opacity: 0.88 },

  // variants
  primary: { backgroundColor: Colors.primary, ...Shadow.sm },
  secondary: { backgroundColor: Colors.accent, ...Shadow.sm },
  outline: { backgroundColor: Colors.surface, borderColor: Colors.primaryBorder },
  ghost: { backgroundColor: Colors.primaryBg, borderColor: Colors.primaryBorder },
  danger: { backgroundColor: Colors.error },

  primaryLabel: { color: Colors.textOnPrimary },
  secondaryLabel: { color: Colors.textOnAccent },
  outlineLabel: { color: Colors.primary },
  ghostLabel: { color: Colors.primary },
  dangerLabel: { color: Colors.textOnPrimary },

  // sizes
  sm: { minHeight: 36, paddingVertical: Spacing.xs + 2, paddingHorizontal: Spacing.md },
  md: { minHeight: 46, paddingVertical: Spacing.sm + 2, paddingHorizontal: Spacing.lg },
  lg: { minHeight: 54, paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl },

  smLabel: { fontSize: FontSize.sm },
  mdLabel: { fontSize: FontSize.md },
  lgLabel: { fontSize: FontSize.lg },

  disabled: { opacity: 0.45, shadowOpacity: 0, elevation: 0 },
});
