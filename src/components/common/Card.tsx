import React from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Colors, Shadow, Spacing } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'elevated' | 'filled' | 'bordered';
  padding?: number;
  onPress?: () => void;
  disabled?: boolean;
}

export default function Card({
  children,
  style,
  variant = 'default',
  padding = Spacing.md,
  onPress,
  disabled,
}: CardProps) {
  const contentStyle = [styles.base, styles[variant], { padding }, style];
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [contentStyle, pressed && !disabled && styles.pressed, disabled && styles.disabled]}>
        {children}
      </Pressable>
    );
  }

  return (
    <View style={contentStyle}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    backgroundColor: Colors.surface,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  default: {
    borderColor: Colors.border,
  },
  elevated: {
    borderColor: Colors.borderLight,
    ...Shadow.sm,
  },
  filled: {
    backgroundColor: Colors.surfaceSecondary,
    borderColor: Colors.borderLight,
  },
  bordered: {
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pressed: { opacity: 0.88, transform: [{ scale: 0.995 }] },
  disabled: { opacity: 0.55 },
});
