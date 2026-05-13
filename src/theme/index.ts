import { StyleSheet } from 'react-native';

export const Colors = {
  // Brand
  primary: '#0F766E',
  primaryDark: '#115E59',
  primaryLight: '#2DD4BF',
  primaryBg: '#ECFDF5',
  primaryBorder: '#99F6E4',

  // Accent
  accent: '#B45309',
  accentDark: '#92400E',
  accentBg: '#FFF7ED',
  accentBorder: '#FED7AA',

  // Purple (decorative)
  purple: '#7C3AED',
  purpleBg: '#EDE9FE',

  // Semantic
  success: '#059669',
  successLight: '#34D399',
  successBg: '#D1FAE5',
  successBorder: '#6EE7B7',

  warning: '#D97706',
  warningBg: '#FEF3C7',

  error: '#DC2626',
  errorLight: '#F87171',
  errorBg: '#FEE2E2',
  errorBorder: '#FECACA',

  info: '#2563EB',
  infoBg: '#DBEAFE',

  // Payment statuses
  statusPaid: '#059669',
  statusPaidBg: '#D1FAE5',
  statusNotPaid: '#DC2626',
  statusNotPaidBg: '#FEE2E2',
  statusPartial: '#D97706',
  statusPartialBg: '#FEF3C7',
  statusDelayed: '#7C3AED',
  statusDelayedBg: '#EDE9FE',
  statusExcused: '#64748B',
  statusExcusedBg: '#F1F5F9',

  // Neutrals
  text: '#0F172A',
  textSecondary: '#475569',
  textLight: '#94A3B8',
  textInverse: '#FFFFFF',
  textOnPrimary: '#FFFFFF',
  textOnAccent: '#FFFFFF',
  textDisabled: '#CBD5E1',

  // Surfaces
  background: '#F6F7F9',
  surface: '#FFFFFF',
  surfaceSecondary: '#F8FAFC',
  surfaceElevated: '#FFFFFF',
  surfaceInset: '#F1F5F9',

  // Borders
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  borderFocus: '#0F766E',

  // Misc
  overlay: 'rgba(15, 23, 42, 0.55)',
  headerDecor1: 'rgba(255,255,255,0.08)',
  headerDecor2: 'rgba(255,255,255,0.05)',
} as const;

export const Spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const Radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 32,
  full: 999,
} as const;

export const FontSize = {
  xxs: 10,
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 26,
  xxxl: 32,
  display: 40,
  hero: 52,
} as const;

export const Shadow = {
  sm: {
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  md: {
    elevation: 5,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  lg: {
    elevation: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 22,
  },
  dark: {
    elevation: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
} as const;

export const CommonStyles = StyleSheet.create({
  flex1: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  center: { alignItems: 'center', justifyContent: 'center' },
  screen: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  sectionLabel: {
    fontSize: FontSize.xxs,
    fontWeight: '700',
    color: Colors.textLight,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
  },
  // Shared header decorative circle styles
  headerDecor1: {
    position: 'absolute',
    top: -70,
    right: -50,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  headerDecor2: {
    position: 'absolute',
    bottom: -60,
    left: -30,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  headerDecor3: {
    position: 'absolute',
    top: -20,
    left: 100,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
});
