import { BuilderCalculation, BuilderMode, Circle, CircleStats, Cycle, CycleStats, Frequency, Member, Payment } from '../types';

function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function cyclesLabel(n: number, freq: Frequency): string {
  if (freq === 'weekly') {
    return n === 1 ? '1 week' : `${n} weeks`;
  }
  if (freq === 'biweekly') {
    const months = (n * 2) / 4;
    return months % 1 === 0 ? `${months} months` : `${n * 2} weeks`;
  }
  return n === 1 ? '1 month' : `${n} months`;
}

export function calculateMode(
  mode: BuilderMode,
  params: {
    payoutAmount: number;
    frequency: Frequency;
    durationInCycles?: number;
    contributionPerPerson?: number;
    numberOfMembers?: number;
  },
): BuilderCalculation {
  const { payoutAmount, frequency } = params;

  if (mode === 'A') {
    const n = params.durationInCycles ?? 1;
    const raw = payoutAmount / n;
    const rounded = Math.ceil(raw * 100) / 100;
    const wasRounded = Math.abs(raw - rounded) > 0.001;
    return {
      numberOfMembers: n,
      contributionAmount: rounded,
      totalPayout: payoutAmount,
      durationLabel: cyclesLabel(n, frequency),
      totalCycles: n,
      wasRounded,
      roundingNote: wasRounded
        ? `Contribution rounded up to ${rounded.toFixed(2)} per person (exact: ${raw.toFixed(4)}).`
        : undefined,
    };
  }

  if (mode === 'B') {
    const contrib = params.contributionPerPerson ?? 1;
    const rawN = payoutAmount / contrib;
    const n = Math.ceil(rawN);
    const actualContrib = Math.ceil((payoutAmount / n) * 100) / 100;
    const wasRounded = n !== rawN || Math.abs(actualContrib - contrib) > 0.001;
    return {
      numberOfMembers: n,
      contributionAmount: actualContrib,
      totalPayout: payoutAmount,
      durationLabel: cyclesLabel(n, frequency),
      totalCycles: n,
      wasRounded,
      roundingNote: wasRounded
        ? `${n} members needed. Actual contribution: ${actualContrib.toFixed(2)} (slightly adjusted from ${contrib.toFixed(2)}).`
        : undefined,
    };
  }

  // Mode C
  const n = params.numberOfMembers ?? 1;
  const raw = payoutAmount / n;
  const rounded = Math.ceil(raw * 100) / 100;
  const wasRounded = Math.abs(raw - rounded) > 0.001;
  return {
    numberOfMembers: n,
    contributionAmount: rounded,
    totalPayout: payoutAmount,
    durationLabel: cyclesLabel(n, frequency),
    totalCycles: n,
    wasRounded,
    roundingNote: wasRounded
      ? `Contribution rounded up to ${rounded.toFixed(2)} per person (exact: ${raw.toFixed(4)}).`
      : undefined,
  };
}

function advanceDate(date: Date, freq: Frequency): Date {
  const next = new Date(date);
  if (freq === 'weekly') {
    next.setDate(next.getDate() + 7);
  } else if (freq === 'biweekly') {
    next.setDate(next.getDate() + 14);
  } else {
    next.setMonth(next.getMonth() + 1);
  }
  return next;
}

export function generateSchedule(
  circle: Pick<
    Circle,
    'startDate' | 'frequency' | 'payoutOrder' | 'members' | 'contributionAmount' | 'payoutAmount' | 'numberOfMembers'
  >,
): Cycle[] {
  const cycles: Cycle[] = [];
  let currentDate = new Date(circle.startDate);
  const memberIds = circle.members.map((m: Member) => m.id);
  const order = circle.payoutOrder.length === circle.numberOfMembers
    ? circle.payoutOrder
    : memberIds.slice(0, circle.numberOfMembers);

  for (let i = 0; i < circle.numberOfMembers; i++) {
    const receivingMemberId = order[i] ?? memberIds[i] ?? '';
    const payments: Payment[] = circle.members.map((m: Member) => ({
      memberId: m.id,
      status: 'not_paid',
      paidAmount: 0,
      notes: '',
      updatedAt: new Date().toISOString(),
    }));

    cycles.push({
      id: uid(),
      cycleNumber: i + 1,
      dueDate: currentDate.toISOString().split('T')[0],
      receivingMemberId,
      contributionPerMember: circle.contributionAmount,
      totalPayout: circle.payoutAmount,
      payments,
    });

    currentDate = advanceDate(currentDate, circle.frequency);
  }

  return cycles;
}

export function getCycleStats(cycle: Cycle): CycleStats {
  let paid = 0;
  let notPaid = 0;
  let partial = 0;
  let delayed = 0;
  let excused = 0;
  let totalPaid = 0;

  for (const p of cycle.payments) {
    switch (p.status) {
      case 'paid': paid++; totalPaid += cycle.contributionPerMember; break;
      case 'not_paid': notPaid++; break;
      case 'partial': partial++; totalPaid += p.paidAmount; break;
      case 'delayed': delayed++; break;
      case 'excused': excused++; break;
    }
  }

  const totalExpected = cycle.contributionPerMember * cycle.payments.length;
  return {
    totalExpected,
    totalPaid,
    paidCount: paid,
    notPaidCount: notPaid,
    partialCount: partial,
    delayedCount: delayed,
    excusedCount: excused,
    remaining: totalExpected - totalPaid,
  };
}

export function getCircleStats(circle: Circle): CircleStats {
  const total = circle.cycles.length;
  let completed = 0;
  let totalPaidOverall = 0;
  let totalExpectedOverall = 0;
  let currentCycleIndex = 0;

  for (let i = 0; i < circle.cycles.length; i++) {
    const stats = getCycleStats(circle.cycles[i]);
    totalExpectedOverall += stats.totalExpected;
    totalPaidOverall += stats.totalPaid;
    const allResolved = circle.cycles[i].payments.every(
      (p: Payment) => p.status === 'paid' || p.status === 'excused',
    );
    if (allResolved) {
      completed++;
      currentCycleIndex = i + 1;
    }
  }

  const nextCycle =
    currentCycleIndex < total ? circle.cycles[currentCycleIndex] : undefined;

  return {
    completedCycles: completed,
    totalCycles: total,
    progressPercent: total > 0 ? (completed / total) * 100 : 0,
    totalPaidOverall,
    totalExpectedOverall,
    nextCycle,
    currentCycleIndex,
  };
}

export function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
