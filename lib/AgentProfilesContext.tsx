"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { agentProfiles as initialProfiles, type AgentProfile } from "@/data/agentProfiles";

interface ContextType {
  profiles: Record<string, AgentProfile>;
  updateProfile: (agentId: string, updates: Partial<AgentProfile>) => void;
}

const AgentProfilesContext = createContext<ContextType | null>(null);

export function AgentProfilesProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState(initialProfiles);

  function updateProfile(agentId: string, updates: Partial<AgentProfile>) {
    setProfiles(prev => ({
      ...prev,
      [agentId]: { ...prev[agentId], ...updates },
    }));
  }

  return (
    <AgentProfilesContext.Provider value={{ profiles, updateProfile }}>
      {children}
    </AgentProfilesContext.Provider>
  );
}

export function useAgentProfiles() {
  const ctx = useContext(AgentProfilesContext);
  if (!ctx) throw new Error("useAgentProfiles must be used within AgentProfilesProvider");
  return ctx;
}
