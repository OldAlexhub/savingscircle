import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { FontSize, Radius, Spacing } from '../../theme';

interface BadgeProps {
  label: string;
  color: string;
  bg: string;
  style?: ViewStyle;
  small?: boolean;
}

export default function Badge({ label, color, bg, style, small }: BadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: bg }, small && styles.small, style]}>
      <Text style={[styles.text, { color }, small && styles.smallText]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs,
    alignSelf: 'flex-start',
  },
  small: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  text: { fontSize: FontSize.sm, fontWeight: '700' },
  smallText: { fontSize: FontSize.xs },
});
