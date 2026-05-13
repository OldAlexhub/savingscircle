import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Colors, FontSize, Radius, Spacing } from '../../theme';

interface BadgeProps {
  label: string;
  color: string;
  bg: string;
  style?: StyleProp<ViewStyle>;
  small?: boolean;
  dot?: boolean;
}

export default function Badge({ label, color, bg, style, small, dot }: BadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: bg, borderColor: color }, small && styles.small, style]}>
      {dot && <View style={[styles.dot, { backgroundColor: color }]} />}
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
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  small: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  dot: { width: 6, height: 6, borderRadius: Radius.full },
  text: { fontSize: FontSize.sm, fontWeight: '800', color: Colors.text },
  smallText: { fontSize: FontSize.xs },
});
