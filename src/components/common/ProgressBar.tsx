import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, FontSize, Radius, Spacing } from '../../theme';

interface ProgressBarProps {
  percent: number;
  label?: string;
  showValue?: boolean;
  color?: string;
  height?: number;
}

export default function ProgressBar({
  percent,
  label,
  showValue = true,
  color = Colors.primary,
  height = 8,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <View style={styles.container}>
      {(!!label || showValue) && (
        <View style={styles.row}>
          {!!label && <Text style={styles.label}>{label}</Text>}
          {showValue && <Text style={[styles.value, { color }]}>{Math.round(clamped)}%</Text>}
        </View>
      )}
      <View style={[styles.track, { height }]}>
        <View
          style={[
            styles.fill,
            { width: `${clamped}%` as any, backgroundColor: color, height },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: Spacing.xs },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  label: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '500' },
  value: { fontSize: FontSize.sm, fontWeight: '700' },
  track: {
    backgroundColor: Colors.borderLight,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: Radius.full,
  },
});
