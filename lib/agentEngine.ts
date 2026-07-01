// Server-side agent simulation engine
// Module-level state persists within a single Node.js process (Next.js dev server)

import {
  agents as baseAgents,
  auditLog as baseAuditLog,
  dataSources as baseDataSources,
} from "@/data/mockData";
import type { AuditEntry, Agent } from "@/data/mockData";

// ─── Module-level state ───────────────────────────────────────────────────────

let initialized = false;
let scanCount   = 0;

// Real ms timestamps for each agent's last heartbeat
const agentHeartbeatMs: Record<string, number> = {};

// Dynamic audit entries appended by CPXO scan cycles
const dynamicEntries: AuditEntry[] = [];

// Real ms timestamps for each signal source's last ping
const signalPingMs: Record<string, number> = {};

// Initial ages matching mockData display values
const HEARTBEAT_OFFSETS: Record<string, number> = {
  "cpxo":           1 * 60_000,
  "delivery-ops":   1 * 60_000,
  "clinical-risk":  1 * 60_000,
  "compliance":     3 * 60_000,
  "engagement":     5 * 60_000,
};

const SIGNAL_OFFSETS: Record<string, number> = {
  "cell-signal":          4 * 60_000,
  "homecare-checkins":   12 * 60_000,
  "delivery-event-logs":  1 * 60_000,
  "supply-chain-portal":  8 * 60_000,
  "email-order-data":    22 * 60_000,
};

// How often each signal source sends a new ping
const SIGNAL_REFRESH_MS: Record<string, number> = {
  "cell-signal":          4 * 60_000,
  "homecare-checkins":   12 * 60_000,
  "delivery-event-logs":  1 * 60_000,
  "supply-chain-portal":  8 * 60_000,
  "email-order-data":    22 * 60_000,
};

// ─── Internal helpers ─────────────────────────────────────────────────────────

function fmtAge(ms: number): string {
  const sec = Math.floor(ms / 1000);
  if (sec < 10)  return "just now";
  if (sec < 60)  return `${sec}s ago`;
  if (sec < 120) return "1 min ago";
  return `${Math.floor(sec / 60)} min ago`;
}

function runCPXOScan() {
  scanCount++;
  const now  = new Date();
  const ts   = now.toISOString();
  const ts2  = new Date(now.getTime() + 1000).toISOString();

  // Prepend newest entries (audit log is newest-first)
  dynamicEntries.unshift(
    {
      id:          `DYN-COMP-${scanCount}`,
      timestamp:   ts2,
      actor:       "SYSTEM",
      category:    "EVENT_CREATED",
      title:       `Reasoning Ledger updated - scan cycle ${scanCount} appended`,
      description: `Compliance agent appended clean heartbeat entry to the Reasoning Ledger. Append-only write confirmed. No anomalies detected in scan cycle ${scanCount}.`,
    },
    {
      id:          `DYN-CPXO-${scanCount}`,
      timestamp:   ts,
      actor:       "SYSTEM",
      category:    "EVENT_CREATED",
      title:       `CPXO heartbeat scan #${scanCount} - 9 exceptions active`,
      description: `CPXO agent completed scheduled scan cycle ${scanCount}. Monitored 9 active exceptions across UK homecare. All 5 signal sources responding. No new threshold breaches detected this cycle.`,
    }
  );

  // Reset all agent heartbeats
  const nowMs = Date.now();
  for (const agent of baseAgents) {
    agentHeartbeatMs[agent.id] = nowMs;
  }
}

function initEngine() {
  if (initialized) return;
  initialized = true;

  const nowMs = Date.now();

  // Seed agent heartbeats with realistic initial offsets
  for (const agent of baseAgents) {
    agentHeartbeatMs[agent.id] = nowMs - (HEARTBEAT_OFFSETS[agent.id] ?? 60_000);
  }

  // Seed signal timestamps
  for (const src of baseDataSources) {
    signalPingMs[src.id] = nowMs - (SIGNAL_OFFSETS[src.id] ?? 60_000);
  }

  // First scan runs immediately on server start
  runCPXOScan();

  // CPXO scans every 2 minutes
  setInterval(runCPXOScan, 2 * 60_000);

  // Each signal source refreshes on its own schedule
  for (const [srcId, intervalMs] of Object.entries(SIGNAL_REFRESH_MS)) {
    setInterval(() => { signalPingMs[srcId] = Date.now(); }, intervalMs);
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function getAgents(): Agent[] {
  initEngine();
  const nowMs = Date.now();
  return baseAgents.map(agent => ({
    ...agent,
    lastHeartbeat: fmtAge(nowMs - (agentHeartbeatMs[agent.id] ?? nowMs)),
  }));
}

export function getAuditLog(): AuditEntry[] {
  initEngine();
  // Dynamic entries first (newest), then base entries
  return [...dynamicEntries, ...baseAuditLog];
}

export function getSignals() {
  initEngine();
  const nowMs = Date.now();
  return baseDataSources.map(src => ({
    ...src,
    lastPingMs:    signalPingMs[src.id] ?? nowMs,
    lastPingAgeMs: nowMs - (signalPingMs[src.id] ?? nowMs),
  }));
}

export function getScanCount(): number {
  return scanCount;
}

let reviewCount = 0;

export function submitReview(payload: {
  incidentId: string;
  decision: string;
  rootCause: string;
  evidence: string;
  notes: string;
}) {
  initEngine();
  reviewCount++;
  const now = new Date().toISOString();
  const decisionLabel =
    payload.decision === "approve"   ? "Approved automated action" :
    payload.decision === "escalate"  ? "Escalated to clinical team" :
    payload.decision === "override"  ? "Override - manual action taken" :
                                       payload.decision;

  dynamicEntries.unshift({
    id:          `REV-${reviewCount}`,
    timestamp:   now,
    actor:       "USER",
    category:    "REVIEW_ASSIGNED",
    title:       `Governance review submitted - ${decisionLabel} - ${payload.incidentId}`,
    description: `Sarah Mitchell (Supply Chain Lead) completed post-action governance review. Decision: ${decisionLabel}. Root cause classification: ${payload.rootCause}. Evidence level: ${payload.evidence}.${payload.notes ? " Notes: " + payload.notes : ""}`,
    incidentId:  payload.incidentId,
  });
}
