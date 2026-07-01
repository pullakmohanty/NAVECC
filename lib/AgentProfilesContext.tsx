"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { agentProfiles as initialProfiles, type AgentProfile } from "@/data/agentProfiles";

interface ContextType {
  profiles: Record<string, AgentProfile>;
  updateProfile: (agentId: string, updates: Partial<AgentProfile>) => void;
  addProfile: (profile: AgentProfile) => void;
  removeProfile: (agentId: string) => void;
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

  function addProfile(profile: AgentProfile) {
    setProfiles(prev => ({ ...prev, [profile.id]: profile }));
  }

  function removeProfile(agentId: string) {
    setProfiles(prev => {
      const next = { ...prev };
      delete next[agentId];
      return next;
    });
  }

  return (
    <AgentProfilesContext.Provider value={{ profiles, updateProfile, addProfile, removeProfile }}>
      {children}
    </AgentProfilesContext.Provider>
  );
}

export function useAgentProfiles() {
  const ctx = useContext(AgentProfilesContext);
  if (!ctx) throw new Error("useAgentProfiles must be used within AgentProfilesProvider");
  return ctx;
}
