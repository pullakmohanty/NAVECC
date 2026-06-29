export interface AgentProfile {
  id: string;
  name: string;
  role: string;
  status: "ACTIVE" | "ALERT";
  color: string;
  overview: string;
  inputs: string[];
  outputs: string[];
  tools: string[];
  configuration: { label: string; value: string }[];
  currentTask: string;
  useCases: string[];
  relatedAgents: { name: string; id: string; desc: string }[];
}

export const agentProfiles: Record<string, AgentProfile> = {
  "delivery-ops": {
    id: "delivery-ops",
    name: "Delivery Ops Agent",
    role: "Logistics and courier tracking",
    status: "ACTIVE",
    color: "#028090",
    overview:
      "The Delivery Ops Agent tracks live courier positions and logistics data across all active NHS homecare deliveries. When the CPXO detects a potential delivery exception it activates Delivery Ops to confirm the courier delay, calculate the ETA impact, and identify alternative route options. It is the first specialist agent to respond to any logistics exception.",
    inputs: [
      "Cell-signal GPS courier position",
      "Courier event log checkpoints",
      "Supply chain portal delivery status",
      "Route and traffic data",
    ],
    outputs: [
      "Confirmed courier delay report",
      "ETA delta calculation",
      "Alternative route recommendation",
      "Emergency dispatch trigger",
    ],
    tools: ["gps.getPosition", "routes.getAlternates", "eta.compute", "report.create", "cpxo.notify"],
    configuration: [
      { label: "SLA threshold", value: "4 hours (PNH)" },
      { label: "Trigger", value: "Courier delay detected" },
      { label: "Route check", value: "M6 · M25 · M42" },
    ],
    currentTask:
      "Tracking INC-00934 courier DPD-7741882 — M6 J7-J8 Birmingham — route update pending confirmation",
    useCases: [
      "Detect M6 and M25 courier delays before NHS absorption",
      "Calculate ETA delta for emergency dispatch decisions",
      "Identify backup courier routes automatically",
      "Confirm cold chain courier position during temperature excursion",
      "Track multiple deliveries simultaneously across NHS regions",
    ],
    relatedAgents: [
      { name: "CPXO Agent", id: "cpxo", desc: "Delegates tasks" },
      { name: "Clinical Risk Agent", id: "clinical-risk", desc: "Shares delay data" },
      { name: "Compliance Agent", id: "compliance", desc: "Logs findings" },
    ],
  },

  "clinical-risk": {
    id: "clinical-risk",
    name: "Clinical Risk Agent",
    role: "Patient safety and severity scoring",
    status: "ALERT",
    color: "#E05C5C",
    overview:
      "The Clinical Risk Agent assesses patient safety severity for every delivery exception. It checks drug-specific SLA thresholds against the Ultomiris, Soliris, and Strensiq protocols, evaluates haemolytic crisis risk for PNH patients, and automatically generates MHRA pharmacovigilance flags when delays exceed regulatory thresholds. It is the only agent that can escalate an exception to LIFE-CRITICAL and trigger emergency dispatch.",
    inputs: [
      "Patient clinical profile (ARV reference)",
      "Drug-specific SLA thresholds",
      "Delivery delay duration from Delivery Ops",
      "Diagnosis: PNH · aHUS · HPP",
    ],
    outputs: [
      "Severity classification (Low/Medium/Life-critical)",
      "MHRA pharmacovigilance flag",
      "Patient risk assessment score (0-1)",
      "Escalation notification to CPXO",
    ],
    tools: [
      "patient.getProfile",
      "sla.getThreshold",
      "risk.assess",
      "mhra.createFlag",
      "severity.escalate",
      "cpxo.alert",
    ],
    configuration: [
      { label: "MHRA flag threshold", value: "6 hours (PNH)" },
      { label: "Auto-escalate", value: "Yes — fully automated" },
      { label: "Risk model", value: "PNH · aHUS · HPP" },
    ],
    currentTask:
      "PNH threshold breach confirmed — INC-00934 Ultomiris 500mg delay exceeds 7h SLA — MHRA flag raised — severity escalated to LIFE-CRITICAL",
    useCases: [
      "Assess PNH patient risk for Ultomiris delivery delays",
      "Generate MHRA pharmacovigilance flags automatically at 6h threshold",
      "Escalate aHUS exceptions for Soliris cold chain breaches",
      "Score clinical severity for HPP patients on Strensiq",
      "Trigger emergency dispatch for LIFE-CRITICAL exceptions",
    ],
    relatedAgents: [
      { name: "CPXO Agent", id: "cpxo", desc: "Receives escalations" },
      { name: "Compliance Agent", id: "compliance", desc: "Logs MHRA flags" },
      { name: "Delivery Ops Agent", id: "delivery-ops", desc: "Provides delay data" },
    ],
  },

  "compliance": {
    id: "compliance",
    name: "Compliance Agent",
    role: "GDPR and pharma audit",
    status: "ACTIVE",
    color: "#E8A838",
    overview:
      "The Compliance Agent handles all regulatory and audit requirements automatically. It pseudonymises patient IDs under GDPR before any data is written, appends every agent decision to the append-only Reasoning Ledger, and generates MHRA pharmacovigilance entries without any manual intervention. Every compliance record is created automatically — no manual logging is ever required.",
    inputs: [
      "Exception records from CPXO",
      "Patient identifiers for pseudonymisation",
      "MHRA flag requests from Clinical Risk",
      "Agent action records and timestamps",
    ],
    outputs: [
      "GDPR-pseudonymised patient tokens",
      "Immutable Reasoning Ledger entries",
      "MHRA pharmacovigilance records",
      "SOC 2 and ISO 27001 audit trail",
    ],
    tools: ["gdpr.pseudonymise", "ledger.append", "mhra.appendFlag", "audit.seal", "compliance.notify"],
    configuration: [
      { label: "GDPR mode", value: "Pseudonymise all patient IDs" },
      { label: "Retention", value: "7 years" },
      { label: "Ledger", value: "Append-only · tamper-proof" },
    ],
    currentTask:
      "MHRA audit entry LOG-00296 appended to Reasoning Ledger for INC-00934 — regulatory entry confirmed — no manual action required",
    useCases: [
      "Auto-generate MHRA PV flags for Ultomiris delays exceeding 6h threshold",
      "Write tamper-proof audit entries for every automated action",
      "Pseudonymise PNH patient IDs before any data leaves the secure environment",
      "Produce regulator-ready audit trail on demand — SOC 2 and ISO 27001",
      "Log NHS staff hours absorbed by silent delivery failures",
    ],
    relatedAgents: [
      { name: "Clinical Risk Agent", id: "clinical-risk", desc: "Provides MHRA flags" },
      { name: "CPXO Agent", id: "cpxo", desc: "Provides exception records" },
      { name: "Engagement Agent", id: "engagement", desc: "Logs notifications" },
    ],
  },

  "engagement": {
    id: "engagement",
    name: "Engagement Agent",
    role: "Alerts and comms",
    status: "ACTIVE",
    color: "#005EB8",
    overview:
      "The Engagement Agent manages all outbound alerts and communications across the NHS homecare pathway. When an exception is confirmed it automatically drafts and dispatches notifications to homecare nurses, hospital pharmacists, and the Arvion ops team. It ensures the right people are informed at the right time without any manual coordination or human intervention.",
    inputs: [
      "Confirmed exception from CPXO",
      "Contact list for affected pathway",
      "ETA updates from Delivery Ops",
      "Severity level from Clinical Risk",
    ],
    outputs: [
      "Homecare nurse delay alert",
      "Hospital pharmacist ETA notification",
      "Arvion ops team exception report",
      "Dispatch confirmation to CPXO",
    ],
    tools: ["contacts.get", "alert.draft", "alert.send", "notifications.dispatch", "cpxo.confirm"],
    configuration: [
      { label: "Notify on", value: "Critical and High only" },
      { label: "Channels", value: "Email · SMS · Portal" },
      { label: "Response window", value: "15 minutes" },
    ],
    currentTask:
      "St Thomas Hospital pharmacist notification queued — Soliris 300mg ETA update — 3 notifications pending dispatch",
    useCases: [
      "Alert homecare nurses immediately when Ultomiris delivery is delayed",
      "Notify hospital pharmacy before courier arrives for dock preparation",
      "Send Arvion ops team exception reports for LIFE-CRITICAL cases",
      "Confirm emergency dispatch to affected homecare provider",
      "Queue multi-channel notifications for cold chain breach events",
    ],
    relatedAgents: [
      { name: "CPXO Agent", id: "cpxo", desc: "Receives task assignments" },
      { name: "Delivery Ops Agent", id: "delivery-ops", desc: "ETA updates" },
      { name: "Compliance Agent", id: "compliance", desc: "Logs all alerts sent" },
    ],
  },

  "cpxo": {
    id: "cpxo",
    name: "CPXO Agent",
    role: "Chief Patient Experience Officer",
    status: "ACTIVE",
    color: "#005EB8",
    overview:
      "The CPXO Agent is the top orchestrator of the NavECC platform. It wakes on a configurable heartbeat interval, reads all five active data signals simultaneously, correlates them to detect silent delivery exceptions, scores severity, and delegates tasks to specialist agents. It never executes actions directly — every action is performed by a specialist agent under its instruction.",
    inputs: [
      "Cell-signal GPS tag feed (live)",
      "Homecare nurse check-in data",
      "Supply chain portal status",
      "Delivery event log checkpoints",
      "Email and order data signals",
    ],
    outputs: [
      "Exception records with severity score",
      "Task assignments to specialist agents",
      "Heartbeat cycle log entries",
      "Signal correlation reports",
      "Goal ancestry for every task",
    ],
    tools: [
      "exception.create",
      "agents.assign",
      "signal.read",
      "severity.score",
      "heartbeat.log",
      "goal.trace",
    ],
    configuration: [
      { label: "Heartbeat interval", value: "30 seconds" },
      { label: "Primary goal", value: "Zero silent delivery failures" },
      { label: "Confirmation threshold", value: "3 sources required" },
    ],
    currentTask:
      "Monitoring 9 open exceptions across UK homecare pathway — heartbeat cycle #47 active — INC-00934 LIFE-CRITICAL in progress",
    useCases: [
      "Orchestrate silent delivery delay detection across all NHS regions",
      "Correlate five signal sources to confirm exceptions before escalating",
      "Delegate LIFE-CRITICAL PNH exceptions to all four specialist agents",
      "Maintain goal ancestry for every automated action taken",
      "Run continuous heartbeat monitoring every 30 seconds without interruption",
    ],
    relatedAgents: [
      { name: "Delivery Ops Agent", id: "delivery-ops", desc: "Logistics tracking" },
      { name: "Clinical Risk Agent", id: "clinical-risk", desc: "Patient safety" },
      { name: "Compliance Agent", id: "compliance", desc: "Audit and GDPR" },
      { name: "Engagement Agent", id: "engagement", desc: "Alerts and comms" },
    ],
  },
};
