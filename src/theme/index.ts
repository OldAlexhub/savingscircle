import { StyleSheet } from 'react-native';

export const Colors = {
  primary: '#4F46E5',
  primaryDark: '#3730A3',
  primaryLight: '#818CF8',
  primaryBg: '#EEF2FF',

  accent: '#F59E0B',
  accentDark: '#D97706',
  accentBg: '#FEF3C7',

  success: '#059669',
  successBg: '#ECFDF5',
  warning: '#D97706',
  warningBg: '#FFFBEB',
  error: '#DC2626',
  errorBg: '#FEF2F2',
  info: '#0284C7',
  infoBg: '#F0F9FF',

  background: '#F5F5FF',
  surface: '#FFFFFF',
  surfaceSecondary: '#F8F9FE',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',

  text: '#111827',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  textOnPrimary: '#FFFFFF',
  textOnAccent: '#FFFFFF',

  statusPaid: '#059669',
  statusPaidBg: '#ECFDF5',
  statusNotPaid: '#DC2626',
  statusNotPaidBg: '#FEF2F2',
  statusPartial: '#D97706',
  statusPartialBg: '#FFFBEB',
  statusDelayed: '#7C3AED',
  statusDelayedBg: '#EDE9FE',
  statusExcused: '#6B7280',
  statusExcusedBg: '#F3F4F6',

  gradientStart: '#4F46E5',
  gradientEnd: '#7C3AED',

  overlay: 'rgba(0,0,0,0.5)',
  shadow: '#4F46E5',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 30,
  display: 38,
} as const;

export const Shadow = {
  sm: {
    elevation: 2,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  md: {
    elevation: 5,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  lg: {
    elevation: 10,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
} as const;

export const CommonStyles = StyleSheet.create({
  flex1: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  center: { alignItems: 'center', justifyContent: 'center' },
  screen: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
  },
});
