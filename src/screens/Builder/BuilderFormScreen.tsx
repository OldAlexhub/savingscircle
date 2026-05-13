import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
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
import Input, { PickerInput } from '../../components/common/Input';
import SelectSheet from '../../components/common/SelectSheet';
import { useCircles } from '../../store/CircleContext';
import { Colors, FontSize, Radius, Spacing } from '../../theme';
import { Frequency } from '../../types';
import { calculateMode } from '../../utils/calculations';
import { toIsoDate } from '../../utils/dateUtils';
import { formatCurrency, formatFrequency } from '../../utils/formatters';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = { navigation: NativeStackNavigationProp<any> };

const CURRENCIES = [
  { label: 'USD – US Dollar', value: 'USD' },
  { label: 'EGP – Egyptian Pound', value: 'EGP' },
  { label: 'SAR – Saudi Riyal', value: 'SAR' },
  { label: 'AED – UAE Dirham', value: 'AED' },
  { label: 'EUR – Euro', value: 'EUR' },
  { label: 'GBP – British Pound', value: 'GBP' },
  { label: 'NGN – Nigerian Naira', value: 'NGN' },
  { label: 'KES – Kenyan Shilling', value: 'KES' },
  { label: 'ETB – Ethiopian Birr', value: 'ETB' },
  { label: 'GHS – Ghanaian Cedi', value: 'GHS' },
  { label: 'Other', value: 'OTHER' },
];

const FREQUENCIES: { label: string; value: Frequency; description: string }[] = [
  { label: 'Weekly', value: 'weekly', description: 'Members contribute every week' },
  { label: 'Bi-weekly', value: 'biweekly', description: 'Members contribute every two weeks' },
  { label: 'Monthly', value: 'monthly', description: 'Members contribute once a month' },
];

export default function BuilderFormScreen({ navigation }: Props) {
  const { draft, setDraft } = useCircles();
  const mode = draft.builderMode ?? 'A';

  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [customCurrency, setCustomCurrency] = useState('');
  const [payout, setPayout] = useState('');
  const [freq, setFreq] = useState<Frequency>('monthly');
  const [duration, setDuration] = useState('');
  const [contribution, setContribution] = useState('');
  const [members, setMembers] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCurrencySheet, setShowCurrencySheet] = useState(false);
  const [showFreqSheet, setShowFreqSheet] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof calculateMode> | null>(null);

  const effectiveCurrency = currency === 'OTHER' ? (customCurrency || 'XXX') : currency;

  function validate(): string | null {
    if (!name.trim()) { return 'Enter a circle name.'; }
    const p = parseFloat(payout);
    if (!p || p <= 0) { return 'Enter a valid payout amount.'; }
    if (mode === 'A') {
      const d = parseInt(duration, 10);
      if (!d || d < 2) { return 'Duration must be at least 2 payment rounds.'; }
    }
    if (mode === 'B') {
      const c = parseFloat(contribution);
      if (!c || c <= 0) { return 'Enter a valid contribution amount.'; }
      if (c >= p) { return 'Contribution per person must be less than the total payout.'; }
    }
    if (mode === 'C') {
      const m = parseInt(members, 10);
      if (!m || m < 2) { return 'There must be at least 2 members.'; }
    }
    return null;
  }

  function calculate() {
    const err = validate();
    if (err) { Alert.alert('Missing Info', err); return; }
    const p = parseFloat(payout);
    const calc = calculateMode(mode, {
      payoutAmount: p,
      frequency: freq,
      durationInCycles: mode === 'A' ? parseInt(duration, 10) : undefined,
      contributionPerPerson: mode === 'B' ? parseFloat(contribution) : undefined,
      numberOfMembers: mode === 'C' ? parseInt(members, 10) : undefined,
    });
    setResult(calc);
  }

  function proceed() {
    if (!result) { return; }
    setDraft({
      name: name.trim(),
      currency: effectiveCurrency,
      payoutAmount: parseFloat(payout),
      frequency: freq,
      contributionAmount: result.contributionAmount,
      numberOfMembers: result.numberOfMembers,
      startDate: toIsoDate(startDate),
    });
    navigation.navigate('Members');
  }

  const modeLabel = mode === 'A' ? 'Mode A: Payout & Duration' : mode === 'B' ? 'Mode B: Payout & Contribution' : 'Mode C: Fixed Group Size';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar backgroundColor={Colors.primary} barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Circle Details</Text>
          <Text style={styles.headerSub}>{modeLabel}</Text>
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

          {/* Common fields */}
          <Text style={styles.section}>CIRCLE INFO</Text>
          <Card>
            <Input label="Circle Name" value={name} onChangeText={setName} placeholder="e.g. Family Group 2025" required />
            <PickerInput
              label="Currency"
              value={currency === 'OTHER' ? 'Other (custom)' : (CURRENCIES.find(c => c.value === currency)?.label ?? currency)}
              onPress={() => setShowCurrencySheet(true)}
              required
            />
            {currency === 'OTHER' && (
              <Input label="Custom Currency Code" value={customCurrency} onChangeText={setCustomCurrency} placeholder="e.g. TZS" maxLength={6} />
            )}
          </Card>

          {/* Mode-specific inputs */}
          <Text style={styles.section}>PLANNING INPUTS</Text>
          <Card>
            <Input
              label="Target Payout Amount"
              value={payout}
              onChangeText={setPayout}
              placeholder="e.g. 1000"
              keyboardType="decimal-pad"
              hint="The total amount each member receives when it's their turn."
              required
            />
            <PickerInput
              label="Payment Frequency"
              value={formatFrequency(freq)}
              onPress={() => setShowFreqSheet(true)}
              hint="How often members contribute."
              required
            />
            {mode === 'A' && (
              <Input
                label="Number of Payment Rounds"
                value={duration}
                onChangeText={setDuration}
                placeholder="e.g. 12"
                keyboardType="number-pad"
                hint="Equal to the number of members. Each round, one member collects."
                required
              />
            )}
            {mode === 'B' && (
              <Input
                label="Max Contribution Per Person"
                value={contribution}
                onChangeText={setContribution}
                placeholder="e.g. 100"
                keyboardType="decimal-pad"
                hint="The most each person can afford to pay per cycle."
                required
              />
            )}
            {mode === 'C' && (
              <Input
                label="Number of Members"
                value={members}
                onChangeText={setMembers}
                placeholder="e.g. 10"
                keyboardType="number-pad"
                hint="Everyone gets one payout turn."
                required
              />
            )}
          </Card>

          {/* Start date */}
          <Text style={styles.section}>SCHEDULE</Text>
          <Card>
            <Text style={styles.fieldLabel}>Start Date <Text style={{ color: Colors.error }}>*</Text></Text>
            <TouchableOpacity
              style={styles.dateTrigger}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}>
              <Text style={styles.dateValue}>
                {startDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </Text>
              <Text style={styles.dateIcon}>📅</Text>
            </TouchableOpacity>
          </Card>

          {showDatePicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display="default"
              minimumDate={new Date()}
              onChange={(_e: any, d?: Date) => {
                setShowDatePicker(false);
                if (d) { setStartDate(d); }
              }}
            />
          )}

          {/* Calculate */}
          <Button label="Calculate" onPress={calculate} style={styles.calcBtn} />

          {/* Result */}
          {result && (
            <>
              <Text style={styles.section}>RESULT</Text>
              <Card variant="elevated" style={styles.resultCard}>
                <Text style={styles.resultTitle}>📊 Circle Preview</Text>
                {result.wasRounded && (
                  <View style={styles.roundNote}>
                    <Text style={styles.roundNoteText}>⚠️ {result.roundingNote}</Text>
                  </View>
                )}
                <View style={styles.resultGrid}>
                  <ResultItem label="Members Needed" value={result.numberOfMembers.toString()} />
                  <ResultItem label="Contribution / Person" value={formatCurrency(result.contributionAmount, effectiveCurrency)} highlight />
                  <ResultItem label="Payout Per Turn" value={formatCurrency(result.totalPayout, effectiveCurrency)} highlight />
                  <ResultItem label="Total Duration" value={result.durationLabel} />
                  <ResultItem label="Total Cycles" value={result.totalCycles.toString()} />
                  <ResultItem label="Frequency" value={formatFrequency(freq)} />
                </View>
                <Button label="Next: Add Members →" onPress={proceed} style={{ marginTop: Spacing.lg }} />
              </Card>
            </>
          )}

          <View style={{ height: Spacing.xxl }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <SelectSheet
        visible={showCurrencySheet}
        title="Select Currency"
        options={CURRENCIES}
        selectedValue={currency}
        onSelect={setCurrency}
        onClose={() => setShowCurrencySheet(false)}
      />
      <SelectSheet
        visible={showFreqSheet}
        title="Payment Frequency"
        options={FREQUENCIES}
        selectedValue={freq}
        onSelect={v => setFreq(v as Frequency)}
        onClose={() => setShowFreqSheet(false)}
      />
    </SafeAreaView>
  );
}

function ResultItem({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={itemStyles.wrap}>
      <Text style={itemStyles.label}>{label}</Text>
      <Text style={[itemStyles.value, highlight && itemStyles.highlighted]}>{value}</Text>
    </View>
  );
}

const itemStyles = StyleSheet.create({
  wrap: { marginBottom: Spacing.sm },
  label: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '600', letterSpacing: 0.3 },
  value: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text, marginTop: 2 },
  highlighted: { color: Colors.primary, fontSize: FontSize.xl },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primary },
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  backBtn: { padding: Spacing.xs, marginTop: 2 },
  backIcon: { fontSize: 22, color: '#fff', fontWeight: '700' },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  scroll: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md },
  section: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
  },
  fieldLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  dateTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.borderLight,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
  },
  dateValue: { fontSize: FontSize.md, color: Colors.text, fontWeight: '500' },
  dateIcon: { fontSize: 20 },
  calcBtn: { marginTop: Spacing.lg },
  resultCard: { marginBottom: Spacing.lg },
  resultTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text, marginBottom: Spacing.md },
  roundNote: {
    backgroundColor: Colors.warningBg,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  roundNoteText: { fontSize: FontSize.sm, color: Colors.warning, lineHeight: 20 },
  resultGrid: {},
});
