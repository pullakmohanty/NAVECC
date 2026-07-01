"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import type { Decision } from "@/lib/governance";

interface Ctx {
  decisions: Record<string, Decision>;
  decide: (incidentId: string, d: Decision) => void;
  reset: (incidentId: string) => void;
}

const GovernanceDecisionsContext = createContext<Ctx | null>(null);

export function GovernanceDecisionsProvider({ children }: { children: ReactNode }) {
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const decide = (incidentId: string, d: Decision) =>
    setDecisions(prev => ({ ...prev, [incidentId]: d }));
  const reset = (incidentId: string) =>
    setDecisions(prev => {
      const next = { ...prev };
      delete next[incidentId];
      return next;
    });
  return (
    <GovernanceDecisionsContext.Provider value={{ decisions, decide, reset }}>
      {children}
    </GovernanceDecisionsContext.Provider>
  );
}

export function useGovernanceDecisions() {
  const ctx = useContext(GovernanceDecisionsContext);
  if (!ctx) throw new Error("useGovernanceDecisions must be used within GovernanceDecisionsProvider");
  return ctx;
}
