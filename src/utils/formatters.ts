import { CircleStatus, Frequency, PaymentStatus } from '../types';

export function formatCurrency(amount: number, currency: string): string {
  return `${currency} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatFrequency(freq: Frequency): string {
  switch (freq) {
    case 'weekly': return 'Weekly';
    case 'biweekly': return 'Bi-weekly';
    case 'monthly': return 'Monthly';
  }
}

export function formatStatus(status: PaymentStatus): string {
  switch (status) {
    case 'paid': return 'Paid';
    case 'not_paid': return 'Not Paid';
    case 'partial': return 'Partial';
    case 'delayed': return 'Delayed';
    case 'excused': return 'Excused';
  }
}

export function formatCircleStatus(status: CircleStatus): string {
  switch (status) {
    case 'planning': return 'Planning';
    case 'active': return 'Active';
    case 'completed': return 'Completed';
  }
}

export function nextPaymentStatus(current: PaymentStatus): PaymentStatus {
  const order: PaymentStatus[] = ['not_paid', 'paid', 'partial', 'delayed', 'excused'];
  const idx = order.indexOf(current);
  return order[(idx + 1) % order.length];
}

export function statusColor(status: PaymentStatus): { text: string; bg: string } {
  switch (status) {
    case 'paid': return { text: '#059669', bg: '#ECFDF5' };
    case 'not_paid': return { text: '#DC2626', bg: '#FEF2F2' };
    case 'partial': return { text: '#D97706', bg: '#FFFBEB' };
    case 'delayed': return { text: '#7C3AED', bg: '#EDE9FE' };
    case 'excused': return { text: '#6B7280', bg: '#F3F4F6' };
  }
}

export function circleStatusColor(status: CircleStatus): { text: string; bg: string } {
  switch (status) {
    case 'planning': return { text: '#D97706', bg: '#FFFBEB' };
    case 'active': return { text: '#059669', bg: '#ECFDF5' };
    case 'completed': return { text: '#6B7280', bg: '#F3F4F6' };
  }
}

export function buildShareText(
  circleName: string,
  currency: string,
  payoutAmount: number,
  contributionAmount: number,
  frequency: Frequency,
  memberCount: number,
  cycles: Array<{ cycleNumber: number; dueDate: string; receiverName: string; totalPayout: number }>,
): string {
  const header = `===== ${circleName} =====\nSavings Circle Report\n\nPayout Amount: ${formatCurrency(payoutAmount, currency)}\nContribution: ${formatCurrency(contributionAmount, currency)} / person\nFrequency: ${formatFrequency(frequency)}\nMembers: ${memberCount}\n\nSCHEDULE:\n`;
  const rows = cycles
    .map(c => `Cycle ${c.cycleNumber} | ${c.dueDate} | ${c.receiverName} | ${formatCurrency(c.totalPayout, currency)}`)
    .join('\n');
  const footer = '\n\n- Savings Circle App\nPlan and track rotating savings groups.\nThis is a planning tool only. It does not process payments.';
  return header + rows + footer;
}
