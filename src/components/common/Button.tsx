import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Colors, FontSize, Radius, Spacing } from '../../theme';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
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

  return (
    <TouchableOpacity
      activeOpacity={0.78}
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.base,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? Colors.primary : Colors.textOnPrimary}
          size="small"
        />
      ) : (
        <View style={styles.row}>
          {icon && <View style={styles.iconWrap}>{icon}</View>}
          <Text style={[styles.label, styles[`${variant}Label`], styles[`${size}Label`]]}>
            {label}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: { width: '100%' },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconWrap: { marginRight: Spacing.sm },
  label: { fontWeight: '700', letterSpacing: 0.3 },

  // variants
  primary: { backgroundColor: Colors.primary },
  secondary: { backgroundColor: Colors.accent },
  outline: { backgroundColor: 'transparent', borderWidth: 2, borderColor: Colors.primary },
  ghost: { backgroundColor: Colors.primaryBg },
  danger: { backgroundColor: Colors.error },

  primaryLabel: { color: Colors.textOnPrimary },
  secondaryLabel: { color: Colors.textOnAccent },
  outlineLabel: { color: Colors.primary },
  ghostLabel: { color: Colors.primary },
  dangerLabel: { color: Colors.textOnPrimary },

  // sizes
  sm: { paddingVertical: Spacing.xs + 2, paddingHorizontal: Spacing.md },
  md: { paddingVertical: Spacing.sm + 4, paddingHorizontal: Spacing.lg },
  lg: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl },

  smLabel: { fontSize: FontSize.sm },
  mdLabel: { fontSize: FontSize.md },
  lgLabel: { fontSize: FontSize.lg },

  disabled: { opacity: 0.45 },
});
