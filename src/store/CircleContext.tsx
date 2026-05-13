import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Circle, CircleStatus, Cycle, Member, Payment, PaymentStatus } from '../types';
import { loadCircles, saveCircles } from './storage';

function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

interface CircleContextType {
  circles: Circle[];
  loading: boolean;

  addCircle: (circle: Circle) => Promise<void>;
  updateCircle: (id: string, updates: Partial<Circle>) => Promise<void>;
  deleteCircle: (id: string) => Promise<void>;
  getCircle: (id: string) => Circle | undefined;
  activateCircle: (id: string) => Promise<void>;
  completeCircle: (id: string) => Promise<void>;

  updatePayment: (
    circleId: string,
    cycleId: string,
    memberId: string,
    updates: Partial<Payment>,
  ) => Promise<void>;

  draft: Partial<Circle>;
  setDraft: (updates: Partial<Circle>) => void;
  resetDraft: () => void;
  saveDraft: () => Promise<string>;

  generateId: () => string;
}

const CircleContext = createContext<CircleContextType | null>(null);

export function CircleProvider({ children }: { children: React.ReactNode }) {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraftState] = useState<Partial<Circle>>({});
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadCircles().then(data => {
      setCircles(data);
      setLoading(false);
    });
  }, []);

  const persist = useCallback((updated: Circle[]) => {
    setCircles(updated);
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
    }
    saveTimer.current = setTimeout(() => saveCircles(updated), 300);
  }, []);

  const addCircle = useCallback(
    async (circle: Circle) => {
      persist([...circles, circle]);
    },
    [circles, persist],
  );

  const updateCircle = useCallback(
    async (id: string, updates: Partial<Circle>) => {
      persist(circles.map(c => (c.id === id ? { ...c, ...updates } : c)));
    },
    [circles, persist],
  );

  const deleteCircle = useCallback(
    async (id: string) => {
      persist(circles.filter(c => c.id !== id));
    },
    [circles, persist],
  );

  const getCircle = useCallback(
    (id: string) => circles.find(c => c.id === id),
    [circles],
  );

  const activateCircle = useCallback(
    async (id: string) => {
      await updateCircle(id, { status: 'active' as CircleStatus });
    },
    [updateCircle],
  );

  const completeCircle = useCallback(
    async (id: string) => {
      await updateCircle(id, { status: 'completed' as CircleStatus });
    },
    [updateCircle],
  );

  const updatePayment = useCallback(
    async (
      circleId: string,
      cycleId: string,
      memberId: string,
      updates: Partial<Payment>,
    ) => {
      const circle = circles.find(c => c.id === circleId);
      if (!circle) {
        return;
      }
      const updatedCycles = circle.cycles.map((cy: Cycle) => {
        if (cy.id !== cycleId) {
          return cy;
        }
        const updatedPayments = cy.payments.map((p: Payment) => {
          if (p.memberId !== memberId) {
            return p;
          }
          return { ...p, ...updates, updatedAt: new Date().toISOString() };
        });
        return { ...cy, payments: updatedPayments };
      });
      await updateCircle(circleId, { cycles: updatedCycles });
    },
    [circles, updateCircle],
  );

  const setDraft = useCallback((updates: Partial<Circle>) => {
    setDraftState(prev => ({ ...prev, ...updates }));
  }, []);

  const resetDraft = useCallback(() => {
    setDraftState({});
  }, []);

  const saveDraft = useCallback(async (): Promise<string> => {
    const id = uid();
    const circle: Circle = {
      id,
      name: draft.name ?? 'Untitled Circle',
      currency: draft.currency ?? 'USD',
      payoutAmount: draft.payoutAmount ?? 0,
      frequency: draft.frequency ?? 'monthly',
      contributionAmount: draft.contributionAmount ?? 0,
      numberOfMembers: draft.numberOfMembers ?? 0,
      startDate: draft.startDate ?? new Date().toISOString().split('T')[0],
      members: draft.members ?? [],
      payoutOrder: draft.payoutOrder ?? [],
      isOrderLocked: draft.isOrderLocked ?? false,
      cycles: draft.cycles ?? [],
      createdAt: new Date().toISOString(),
      status: 'planning',
      builderMode: draft.builderMode ?? 'A',
    };
    await addCircle(circle);
    setDraftState({});
    return id;
  }, [draft, addCircle]);

  const generateId = useCallback(() => uid(), []);

  const value = useMemo<CircleContextType>(
    () => ({
      circles,
      loading,
      addCircle,
      updateCircle,
      deleteCircle,
      getCircle,
      activateCircle,
      completeCircle,
      updatePayment,
      draft,
      setDraft,
      resetDraft,
      saveDraft,
      generateId,
    }),
    [
      circles,
      loading,
      addCircle,
      updateCircle,
      deleteCircle,
      getCircle,
      activateCircle,
      completeCircle,
      updatePayment,
      draft,
      setDraft,
      resetDraft,
      saveDraft,
      generateId,
    ],
  );

  return <CircleContext.Provider value={value}>{children}</CircleContext.Provider>;
}

export function useCircles(): CircleContextType {
  const ctx = useContext(CircleContext);
  if (!ctx) {
    throw new Error('useCircles must be used within CircleProvider');
  }
  return ctx;
}
