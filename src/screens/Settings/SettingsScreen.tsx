import React, { useState } from 'react';
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
import Card from '../../components/common/Card';
import { clearAllData } from '../../store/storage';
import { useCircles } from '../../store/CircleContext';
import { Colors, FontSize, Radius, Spacing } from '../../theme';

const VERSION = '1.0.0';
const BUILD = '1';
const SUPPORT_EMAIL = 'support@oldalexhub.com';

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
      <StatusBar backgroundColor={Colors.primary} barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings & About</Text>
        <Text style={styles.headerSub}>Savings Circle v{VERSION}</Text>
      </View>

      <ScrollView
        style={{ flex: 1, backgroundColor: Colors.background }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>

        {/* App Identity */}
        <View style={styles.appHeader}>
          <View style={styles.appIconWrap}>
            <Text style={styles.appIconEmoji}>🔄</Text>
          </View>
          <Text style={styles.appName}>Savings Circle</Text>
          <Text style={styles.appTagline}>Plan and track rotating savings groups.</Text>
          <Text style={styles.appVersion}>Version {VERSION} (Build {BUILD})</Text>
        </View>

        {/* About */}
        <Text style={styles.sectionTitle}>ABOUT</Text>
        <Card>
          <InfoRow label="Developed by" value="Mohamed Gad" />
          <Divider />
          <InfoRow label="Studio" value="Old Alex Hub" />
          <Divider />
          <InfoRow label="Version" value={`${VERSION} (${BUILD})`} />
          <Divider />
          <TouchableOpacity onPress={handleEmail} activeOpacity={0.7}>
            <InfoRow label="Support" value={SUPPORT_EMAIL} valueColor={Colors.primary} />
          </TouchableOpacity>
        </Card>

        {/* Disclaimer */}
        <Text style={styles.sectionTitle}>IMPORTANT DISCLAIMER</Text>
        <Card style={styles.disclaimerCard}>
          <Text style={styles.disclaimerText}>
            Savings Circle is a planning and bookkeeping tool only. It does not process payments, hold funds, transfer money, verify members, guarantee payouts, or provide financial advice.
            {'\n\n'}
            All data is stored locally on your device. The app does not connect to any server, require login, or transmit your information.
          </Text>
        </Card>

        {/* Privacy */}
        <Text style={styles.sectionTitle}>PRIVACY</Text>
        <Card>
          <PrivacyRow icon="✅" text="No account or login required" />
          <PrivacyRow icon="✅" text="No personal data collected" />
          <PrivacyRow icon="✅" text="No data sent to any server" />
          <PrivacyRow icon="✅" text="Your data stays on your device" />
          <PrivacyRow icon="✅" text="No location access" />
          <PrivacyRow icon="✅" text="No contact access" />
          <PrivacyRow icon="✅" text="No ads or analytics" />
          <PrivacyRow icon="✅" text="No payment processing" />
        </Card>

        {/* Supported group names */}
        <Text style={styles.sectionTitle}>ALSO KNOWN AS</Text>
        <Card>
          <Text style={styles.groupNames}>
            Savings Circle · Gam3eya · Tanda · Susu · Chama · Ekub · Committee · ROSCA · Box Hand · Paluwagan · Hui · Kuthi · Ajo · Bishi
          </Text>
        </Card>

        {/* Data management */}
        <Text style={styles.sectionTitle}>DATA</Text>
        <Card>
          <InfoRow label="Circles stored" value={String(circles.length)} />
          <Divider />
          <Text style={styles.dataNote}>
            You can delete individual circles from the Tracker tab, or clear all data below.
          </Text>
        </Card>

        <TouchableOpacity style={styles.dangerBtn} onPress={handleClearData} activeOpacity={0.8}>
          <Text style={styles.dangerBtnText}>🗑 Clear All Data</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 Old Alex Hub. All rights reserved.</Text>
          <Text style={styles.footerText}>Made with care for saving communities worldwide.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <View style={irStyles.row}>
      <Text style={irStyles.label}>{label}</Text>
      <Text style={[irStyles.value, valueColor ? { color: valueColor } : {}]}>{value}</Text>
    </View>
  );
}

function PrivacyRow({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={prStyles.row}>
      <Text style={prStyles.icon}>{icon}</Text>
      <Text style={prStyles.text}>{text}</Text>
    </View>
  );
}

function Divider() {
  return <View style={{ height: 1, backgroundColor: Colors.borderLight, marginVertical: Spacing.xs }} />;
}

const irStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.xs },
  label: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '500' },
  value: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.text },
});

const prStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.xs, gap: Spacing.sm },
  icon: { fontSize: 16 },
  text: { fontSize: FontSize.sm, color: Colors.text, flex: 1 },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primary },
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  appHeader: { alignItems: 'center', paddingVertical: Spacing.xl },
  appIconWrap: {
    width: 80,
    height: 80,
    borderRadius: Radius.xl,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  appIconEmoji: { fontSize: 40 },
  appName: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.text, marginBottom: Spacing.xs },
  appTagline: { fontSize: FontSize.md, color: Colors.textSecondary, marginBottom: Spacing.xs },
  appVersion: { fontSize: FontSize.sm, color: Colors.textLight },
  sectionTitle: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
  },
  disclaimerCard: { backgroundColor: Colors.errorBg, borderWidth: 1, borderColor: '#FCA5A5' },
  disclaimerText: { fontSize: FontSize.sm, color: '#7F1D1D', lineHeight: 22 },
  groupNames: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 24 },
  dataNote: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20, marginTop: Spacing.xs },
  dangerBtn: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.errorBg,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.error,
  },
  dangerBtnText: { fontSize: FontSize.md, fontWeight: '700', color: Colors.error },
  footer: { marginTop: Spacing.xl, alignItems: 'center', gap: 4 },
  footerText: { fontSize: FontSize.sm, color: Colors.textLight, textAlign: 'center' },
});
