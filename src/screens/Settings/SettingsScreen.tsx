import React from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import ScreenHeader from '../../components/common/ScreenHeader';
import { useCircles } from '../../store/CircleContext';
import { clearAllData } from '../../store/storage';
import { Colors, FontSize, Radius, Spacing } from '../../theme';

const VERSION = '1.0.0';
const BUILD = '3';
const SUPPORT_EMAIL = 'info@oldalexhub.com';

export default function SettingsScreen() {
  const { circles } = useCircles();

  function handleClearData() {
    Alert.alert(
      'Clear All Data',
      `This will permanently delete all ${circles.length} circle(s) and their payment history. This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            Alert.alert('Cleared', 'All data has been deleted. Restart the app to see the changes.');
          },
        },
      ],
    );
  }

  function handleEmail() {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}`).catch(() => {
      Alert.alert('Could not open mail app', `Please contact us at ${SUPPORT_EMAIL}`);
    });
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar backgroundColor={Colors.primaryDark} barStyle="light-content" />
      <ScreenHeader title="Settings" subtitle={`Savings Circle v${VERSION}`} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.appHeader}>
          <View style={styles.appIconWrap}>
            <Text style={styles.appIconText}>SC</Text>
          </View>
          <Text style={styles.appName}>Savings Circle</Text>
          <Text style={styles.appTagline}>Plan and track rotating savings groups.</Text>
          <Text style={styles.appVersion}>Version {VERSION} (Build {BUILD})</Text>
        </View>

        <SectionTitle title="About" />
        <Card>
          <InfoRow label="Developed by" value="Old Alex Hub, LLC" />
          <Divider />
          <InfoRow label="Version" value={`${VERSION} (${BUILD})`} />
          <Divider />
          <TouchableOpacity onPress={handleEmail} activeOpacity={0.7}>
            <InfoRow label="Support" value={SUPPORT_EMAIL} valueColor={Colors.primaryDark} />
          </TouchableOpacity>
        </Card>

        <SectionTitle title="Important disclaimer" />
        <Card style={styles.disclaimerCard}>
          <Text style={styles.disclaimerText}>
            Savings Circle is a planning and bookkeeping tool only. It does not process payments, hold funds,
            transfer money, verify members, guarantee payouts, or provide financial advice.
          </Text>
          <Text style={styles.disclaimerText}>
            Your savings circle records are stored locally on your device. Ads require network access and may use
            Google AdMob to process ad-related device signals.
          </Text>
        </Card>

        <SectionTitle title="Privacy" />
        <Card>
          <PrivacyRow text="No account or login required" />
          <PrivacyRow text="Savings circle records stay on your device" />
          <PrivacyRow text="Google AdMob displays ads and may process ad identifiers" />
          <PrivacyRow text="Ad consent tools are shown where required" />
          <PrivacyRow text="No location or contact access" />
          <PrivacyRow text="No payment processing or financial account access" />
        </Card>

        <SectionTitle title="Also known as" />
        <Card>
          <Text style={styles.groupNames}>
            Gam3eya, Tanda, Susu, Chama, Ekub, Committee, ROSCA, Box Hand, Paluwagan, Hui, Kuthi, Ajo, Bishi.
          </Text>
        </Card>

        <SectionTitle title="Data" />
        <Card>
          <InfoRow label="Circles stored" value={String(circles.length)} />
          <Divider />
          <Text style={styles.dataNote}>
            Delete a single circle from its detail screen, or clear all local app data below.
          </Text>
        </Card>

        <Button label="Clear All Data" onPress={handleClearData} variant="danger" style={styles.dangerBtn} />

        <View style={styles.footer}>
          <Text style={styles.footerText}>(c) 2026 Old Alex Hub. All rights reserved.</Text>
          <Text style={styles.footerText}>Built for saving communities worldwide.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function InfoRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, valueColor ? { color: valueColor } : null]} numberOfLines={2}>{value}</Text>
    </View>
  );
}

function PrivacyRow({ text }: { text: string }) {
  return (
    <View style={styles.privacyRow}>
      <View style={styles.privacyDot} />
      <Text style={styles.privacyText}>{text}</Text>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primaryDark },
  scroll: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  appHeader: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  appIconWrap: {
    width: 76,
    height: 76,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  appIconText: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.textOnPrimary },
  appName: { fontSize: FontSize.xxl, fontWeight: '900', color: Colors.text, marginBottom: Spacing.xs },
  appTagline: { fontSize: FontSize.md, color: Colors.textSecondary, marginBottom: Spacing.xs, textAlign: 'center' },
  appVersion: { fontSize: FontSize.sm, color: Colors.textLight, fontWeight: '700' },
  sectionTitle: {
    fontSize: FontSize.xs,
    fontWeight: '900',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.xs, gap: Spacing.md },
  infoLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '800' },
  infoValue: { fontSize: FontSize.sm, fontWeight: '900', color: Colors.text, flexShrink: 1, textAlign: 'right' },
  divider: { height: 1, backgroundColor: Colors.borderLight, marginVertical: Spacing.xs },
  disclaimerCard: { backgroundColor: Colors.errorBg, borderColor: Colors.errorBorder },
  disclaimerText: { fontSize: FontSize.sm, color: '#7F1D1D', lineHeight: 21, marginBottom: Spacing.sm },
  privacyRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.xs, gap: Spacing.sm },
  privacyDot: { width: 8, height: 8, borderRadius: Radius.full, backgroundColor: Colors.primary },
  privacyText: { fontSize: FontSize.sm, color: Colors.text, flex: 1, fontWeight: '700' },
  groupNames: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 22, fontWeight: '700' },
  dataNote: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20, marginTop: Spacing.xs },
  dangerBtn: { marginTop: Spacing.lg },
  footer: { marginTop: Spacing.xl, alignItems: 'center', gap: 4 },
  footerText: { fontSize: FontSize.sm, color: Colors.textLight, textAlign: 'center', fontWeight: '700' },
});
