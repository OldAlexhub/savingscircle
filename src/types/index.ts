export type Frequency = 'weekly' | 'biweekly' | 'monthly';
export type BuilderMode = 'A' | 'B' | 'C';
export type PaymentStatus = 'paid' | 'not_paid' | 'partial' | 'delayed' | 'excused';
export type CircleStatus = 'planning' | 'active' | 'completed';

export interface Member {
  id: string;
  name: string;
  isOrganizer: boolean;
  notes: string;
}

export interface Payment {
  memberId: string;
  status: PaymentStatus;
  paidAmount: number;
  notes: string;
  updatedAt: string;
}

export interface Cycle {
  id: string;
  cycleNumber: number;
  dueDate: string;
  receivingMemberId: string;
  contributionPerMember: number;
  totalPayout: number;
  payments: Payment[];
}

export interface Circle {
  id: string;
  name: string;
  currency: string;
  payoutAmount: number;
  frequency: Frequency;
  contributionAmount: number;
  numberOfMembers: number;
  startDate: string;
  members: Member[];
  payoutOrder: string[];
  isOrderLocked: boolean;
  cycles: Cycle[];
  createdAt: string;
  status: CircleStatus;
  builderMode: BuilderMode;
}

export interface BuilderCalculation {
  numberOfMembers: number;
  contributionAmount: number;
  totalPayout: number;
  durationLabel: string;
  totalCycles: number;
  wasRounded: boolean;
  roundingNote?: string;
}

export interface CycleStats {
  totalExpected: number;
  totalPaid: number;
  paidCount: number;
  notPaidCount: number;
  partialCount: number;
  delayedCount: number;
  excusedCount: number;
  remaining: number;
}

export interface CircleStats {
  completedCycles: number;
  totalCycles: number;
  progressPercent: number;
  totalPaidOverall: number;
  totalExpectedOverall: number;
  nextCycle?: Cycle;
  currentCycleIndex: number;
}
