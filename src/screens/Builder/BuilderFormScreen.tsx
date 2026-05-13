import DateTimePicker from '@react-native-community/datetimepicker';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
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
import ScreenHeader from '../../components/common/ScreenHeader';
import SelectSheet from '../../components/common/SelectSheet';
import { useCircles } from '../../store/CircleContext';
import { Colors, FontSize, Radius, Spacing } from '../../theme';
import { Frequency } from '../../types';
import { calculateMode } from '../../utils/calculations';
import { toIsoDate } from '../../utils/dateUtils';
import { formatCurrency, formatFrequency } from '../../utils/formatters';

type Props = { navigation: NativeStackNavigationProp<any> };

const CURRENCIES = [
  { label: 'USD - US Dollar', value: 'USD' },
  { label: 'EGP - Egyptian Pound', value: 'EGP' },
  { label: 'SAR - Saudi Riyal', value: 'SAR' },
  { label: 'AED - UAE Dirham', value: 'AED' },
  { label: 'EUR - Euro', value: 'EUR' },
  { label: 'GBP - British Pound', value: 'GBP' },
  { label: 'NGN - Nigerian Naira', value: 'NGN' },
  { label: 'KES - Kenyan Shilling', value: 'KES' },
  { label: 'ETB - Ethiopian Birr', value: 'ETB' },
  { label: 'GHS - Ghanaian Cedi', value: 'GHS' },
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
  const modeLabel =
    mode === 'A'
      ? 'Payout and duration'
      : mode === 'B'
        ? 'Payout and contribution'
        : 'Fixed group size';

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
    if (err) {
      Alert.alert('Missing Info', err);
      return;
    }
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

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar backgroundColor={Colors.primaryDark} barStyle="light-content" />
      <ScreenHeader
        title="Circle Details"
        subtitle={`Mode ${mode}: ${modeLabel}`}
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.stepBand}>
            <Step label="Mode" done />
            <Step label="Details" active />
            <Step label="Members" />
            <Step label="Order" />
            <Step label="Preview" />
          </View>

          <SectionTitle title="Circle info" />
          <Card>
            <Input label="Circle Name" value={name} onChangeText={setName} placeholder="Family Group 2026" required />
            <PickerInput
              label="Currency"
              value={currency === 'OTHER' ? 'Other (custom)' : (CURRENCIES.find(c => c.value === currency)?.label ?? currency)}
              onPress={() => setShowCurrencySheet(true)}
              required
            />
            {currency === 'OTHER' && (
              <Input
                label="Custom Currency Code"
                value={customCurrency}
                onChangeText={setCustomCurrency}
                placeholder="TZS"
                autoCapitalize="characters"
                maxLength={6}
              />
            )}
          </Card>

          <SectionTitle title="Planning inputs" />
          <Card>
            <Input
              label="Target Payout Amount"
              value={payout}
              onChangeText={setPayout}
              placeholder="1000"
              keyboardType="decimal-pad"
              hint="The amount each member receives on their turn."
              required
            />
            <PickerInput
              label="Payment Frequency"
              value={formatFrequency(freq)}
              onPress={() => setShowFreqSheet(true)}
              hint="How often the group collects contributions."
              required
            />
            {mode === 'A' && (
              <Input
                label="Number of Payment Rounds"
                value={duration}
                onChangeText={setDuration}
                placeholder="12"
                keyboardType="number-pad"
                hint="Usually the same as the number of members."
                required
              />
            )}
            {mode === 'B' && (
              <Input
                label="Max Contribution Per Person"
                value={contribution}
                onChangeText={setContribution}
                placeholder="100"
                keyboardType="decimal-pad"
                hint="The most each member can pay per cycle."
                required
              />
            )}
            {mode === 'C' && (
              <Input
                label="Number of Members"
                value={members}
                onChangeText={setMembers}
                placeholder="10"
                keyboardType="number-pad"
                hint="Every member gets one payout turn."
                required
              />
            )}
          </Card>

          <SectionTitle title="Schedule" />
          <Card>
            <Text style={styles.fieldLabel}>Start Date <Text style={styles.required}>*</Text></Text>
            <TouchableOpacity
              style={styles.dateTrigger}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}>
              <Text style={styles.dateValue}>
                {startDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </Text>
              <Text style={styles.dateChange}>Change</Text>
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

          <Button label="Calculate circle" onPress={calculate} style={styles.calcBtn} />

          {result && (
            <>
              <SectionTitle title="Result" />
              <Card variant="elevated" style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <View>
                    <Text style={styles.resultTitle}>Circle preview</Text>
                    <Text style={styles.resultSub}>Review the numbers before adding members.</Text>
                  </View>
                </View>
                {result.wasRounded && (
                  <View style={styles.roundNote}>
                    <Text style={styles.roundNoteText}>{result.roundingNote}</Text>
                  </View>
                )}
                <View style={styles.resultGrid}>
                  <ResultItem label="Members" value={result.numberOfMembers.toString()} />
                  <ResultItem label="Contribution" value={formatCurrency(result.contributionAmount, effectiveCurrency)} highlight />
                  <ResultItem label="Payout" value={formatCurrency(result.totalPayout, effectiveCurrency)} highlight />
                  <ResultItem label="Duration" value={result.durationLabel} />
                  <ResultItem label="Cycles" value={result.totalCycles.toString()} />
                  <ResultItem label="Frequency" value={formatFrequency(freq)} />
                </View>
                <Button label="Next: Add Members" onPress={proceed} style={styles.nextBtn} />
              </Card>
            </>
          )}
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

function SectionTitle({ title }: { title: string }) {
  return <Text style={styles.section}>{title}</Text>;
}

function Step({ label, active, done }: { label: string; active?: boolean; done?: boolean }) {
  return (
    <View style={[styles.step, done && styles.stepDone, active && styles.stepActive]}>
      <Text style={[styles.stepText, (active || done) && styles.stepTextActive]}>{label}</Text>
    </View>
  );
}

function ResultItem({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={itemStyles.wrap}>
      <Text style={itemStyles.label}>{label}</Text>
      <Text style={[itemStyles.value, highlight && itemStyles.highlighted]} numberOfLines={2}>{value}</Text>
    </View>
  );
}

const itemStyles = StyleSheet.create({
  wrap: {
    width: '50%',
    paddingRight: Spacing.md,
    marginBottom: Spacing.md,
  },
  label: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '800' },
  value: { fontSize: FontSize.md, fontWeight: '900', color: Colors.text, marginTop: 3 },
  highlighted: { color: Colors.primaryDark },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primaryDark },
  flex: { flex: 1 },
  scroll: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  stepBand: { flexDirection: 'row', gap: Spacing.xs, marginBottom: Spacing.lg },
  step: {
    flex: 1,
    minHeight: 30,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xs,
  },
  stepDone: { backgroundColor: Colors.primaryBg, borderColor: Colors.primaryBorder },
  stepActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  stepText: { fontSize: FontSize.xxs, fontWeight: '800', color: Colors.textSecondary },
  stepTextActive: { color: Colors.textOnPrimary },
  section: {
    fontSize: FontSize.xs,
    fontWeight: '900',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  fieldLabel: {
    fontSize: FontSize.sm,
    fontWeight: '800',
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  required: { color: Colors.error },
  dateTrigger: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },
  dateValue: { flex: 1, fontSize: FontSize.md, color: Colors.text, fontWeight: '700' },
  dateChange: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '900' },
  calcBtn: { marginTop: Spacing.lg },
  resultCard: { marginBottom: Spacing.lg },
  resultHeader: { marginBottom: Spacing.md },
  resultTitle: { fontSize: FontSize.lg, fontWeight: '900', color: Colors.text },
  resultSub: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  roundNote: {
    backgroundColor: Colors.warningBg,
    borderRadius: 8,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.accentBorder,
  },
  roundNoteText: { fontSize: FontSize.sm, color: Colors.warning, lineHeight: 20 },
  resultGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  nextBtn: { marginTop: Spacing.sm },
});
