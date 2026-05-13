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
  const rounded = Math.round(clamped);

  return (
    <View style={styles.container}>
      {(!!label || showValue) && (
        <View style={styles.row}>
          {!!label && <Text style={styles.label}>{label}</Text>}
          {showValue && <Text style={[styles.value, { color }]}>{rounded}%</Text>}
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
    gap: Spacing.md,
  },
  label: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '700', flex: 1 },
  value: { fontSize: FontSize.xs, fontWeight: '800' },
  track: {
    backgroundColor: Colors.surfaceInset,
    borderRadius: Radius.full,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  fill: {
    borderRadius: Radius.full,
  },
});
