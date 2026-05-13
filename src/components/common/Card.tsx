import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Colors, Radius, Shadow, Spacing } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  variant?: 'default' | 'elevated' | 'filled' | 'bordered';
  padding?: number;
}

export default function Card({ children, style, variant = 'default', padding = Spacing.md }: CardProps) {
  return (
    <View style={[styles.base, styles[variant], { padding }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    marginBottom: Spacing.sm,
  },
  default: {
    ...Shadow.sm,
  },
  elevated: {
    ...Shadow.md,
  },
  filled: {
    backgroundColor: Colors.primaryBg,
  },
  bordered: {
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
