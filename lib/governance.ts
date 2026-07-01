import type { AgentProfile, HitlMode } from "@/data/agentProfiles";
import type { Incident } from "@/data/mockData";

export type Decision = "approved" | "rejected" | "acked";

export type GovState =
  | "auto-executed"
  | "awaiting-approval"
  | "approved-executed"
  | "rejected"
  | "awaiting-ack"
  | "acknowledged";

const LABELS: Record<GovState, string> = {
  "auto-executed":     "Auto-executed",
  "awaiting-approval": "Approve to execute",
  "approved-executed": "Executed after approval",
  "rejected":          "Action rejected",
  "awaiting-ack":      "Acknowledge action",
  "acknowledged":      "Acknowledged",
};

export function governanceFor(
  incident: Pick<Incident, "id" | "responsibleAgentId" | "responsibleActionId">,
  profiles: Record<string, AgentProfile>,
  decisions: Record<string, Decision>,
): { mode: HitlMode; state: GovState; label: string; inQueue: boolean } {
  const agent = profiles[incident.responsibleAgentId];
  const action = agent?.actions.find(a => a.id === incident.responsibleActionId);
  const mode: HitlMode = action?.hitlMode ?? "auto";
  const decision = decisions[incident.id];

  let state: GovState;
  if (mode === "auto") {
    state = "auto-executed";
  } else if (mode === "approve") {
    state =
      decision === "approved" ? "approved-executed"
      : decision === "rejected" ? "rejected"
      : "awaiting-approval";
  } else {
    state = decision === "acked" ? "acknowledged" : "awaiting-ack";
  }

  const inQueue = state === "awaiting-approval" || state === "awaiting-ack";
  return { mode, state, label: LABELS[state], inQueue };
}

export function deriveQueue(
  incidents: Incident[],
  profiles: Record<string, AgentProfile>,
  decisions: Record<string, Decision>,
): Incident[] {
  return incidents.filter(
    i => i.status !== "RESOLVED" && governanceFor(i, profiles, decisions).inQueue,
  );
}
