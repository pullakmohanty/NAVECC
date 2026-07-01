export type HitlMode = "auto" | "approve" | "review";
export type AuthMethod = "apikey" | "oauth2" | "mtls" | "jwt";

export interface DataSource {
  id: string;
  label: string;
  endpoint: string;
  authMethod: AuthMethod;
  authConfig: Record<string, string>;
  status: "connected" | "disconnected";
}

export interface Action {
  id: string;
  label: string;
  hitlMode: HitlMode;
}

export interface Output {
  id: string;
  label: string;
  endpoint?: string;
}

export interface AgentProfile {
  id: string;
  name: string;
  role: string;
  status: "ACTIVE" | "ALERT";
  color: string;
  overview: string;
  inputs: DataSource[];
  actions: Action[];
  outputs: Output[];
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
      { id: "gps",      label: "Cell-signal GPS courier position",     endpoint: "https://api.dpd.co.uk/v2/telemetry/position", authMethod: "mtls",   authConfig: { keyId: "dpd-mtls-01", ca: "NHS Root CA" },                                            status: "connected" },
      { id: "eventlog", label: "Courier event log checkpoints",        endpoint: "https://api.dpd.co.uk/v2/events",            authMethod: "apikey", authConfig: { keyName: "x-api-key", keyValue: "••••••••" },                                         status: "connected" },
      { id: "portal",   label: "Supply chain portal delivery status",  endpoint: "https://portal.arvion.uk/api/deliveries",    authMethod: "oauth2", authConfig: { tokenUrl: "https://portal.arvion.uk/oauth/token", clientId: "navecc-delivery", scope: "deliveries.read" }, status: "connected" },
      { id: "traffic",  label: "Route and traffic data",               endpoint: "https://api.trafficengland.com/v1/incidents", authMethod: "apikey", authConfig: { keyName: "apikey", keyValue: "••••••••" },                                            status: "disconnected" },
    ],
    actions: [
      { id: "gps.getPosition",      label: "gps.getPosition",      hitlMode: "auto" },
      { id: "routes.getAlternates", label: "routes.getAlternates", hitlMode: "auto" },
      { id: "eta.compute",          label: "eta.compute",          hitlMode: "auto" },
      { id: "report.create",        label: "report.create",        hitlMode: "auto" },
      { id: "cpxo.notify",          label: "cpxo.notify",          hitlMode: "auto" },
      { id: "emergency.dispatch",   label: "emergency.dispatch",   hitlMode: "review" },
    ],
    outputs: [
      { id: "delayreport", label: "Confirmed courier delay report",     endpoint: "https://portal.arvion.uk/api/exceptions" },
      { id: "etadelta",    label: "ETA delta calculation" },
      { id: "altroute",    label: "Alternative route recommendation" },
      { id: "dispatch",    label: "Emergency dispatch trigger",         endpoint: "https://api.dpd.co.uk/v2/dispatch" },
    ],
    configuration: [
      { label: "SLA threshold", value: "4 hours (PNH)" },
      { label: "Trigger", value: "Courier delay detected" },
      { label: "Route check", value: "M6 · M25 · M42" },
    ],
    currentTask:
      "Tracking INC-00934 courier DPD-7741882 - M6 J7-J8 Birmingham - route update pending confirmation",
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
      "The Clinical Risk Agent assesses patient safety severity for every delivery exception. It checks drug-specific SLA thresholds against the Ultomiris, Soliris, and Strensiq protocols, evaluates haemolytic crisis risk for PNH patients, and automatically generates MHRA pharmacovigilance flags when delays exceed regulatory thresholds. It is the only agent that can escalate an exception to CRITICAL and trigger emergency dispatch.",
    inputs: [
      { id: "profile",   label: "Patient clinical profile (ARV reference)", endpoint: "https://ehr.arvion.uk/fhir/Patient",   authMethod: "oauth2", authConfig: { tokenUrl: "https://ehr.arvion.uk/oauth/token", clientId: "navecc-clinical", scope: "patient.read" },   status: "connected" },
      { id: "sla",       label: "Drug-specific SLA thresholds",            endpoint: "https://config.navecc.uk/sla",          authMethod: "apikey", authConfig: { keyName: "x-api-key", keyValue: "••••••••" },                                              status: "connected" },
      { id: "delay",     label: "Delivery delay duration from Delivery Ops", endpoint: "internal://delivery-ops/delay",       authMethod: "apikey", authConfig: { keyName: "agent-token", keyValue: "••••••••" },                                            status: "connected" },
      { id: "diagnosis", label: "Diagnosis: PNH · aHUS · HPP",             endpoint: "https://ehr.arvion.uk/fhir/Condition", authMethod: "oauth2", authConfig: { tokenUrl: "https://ehr.arvion.uk/oauth/token", clientId: "navecc-clinical", scope: "condition.read" }, status: "disconnected" },
    ],
    actions: [
      { id: "patient.getProfile", label: "patient.getProfile", hitlMode: "auto" },
      { id: "sla.getThreshold",   label: "sla.getThreshold",   hitlMode: "auto" },
      { id: "risk.assess",        label: "risk.assess",        hitlMode: "auto" },
      { id: "mhra.createFlag",    label: "mhra.createFlag",    hitlMode: "auto" },
      { id: "severity.escalate",  label: "severity.escalate",  hitlMode: "review" },
      { id: "cpxo.alert",         label: "cpxo.alert",         hitlMode: "auto" },
    ],
    outputs: [
      { id: "severity", label: "Severity classification (Low/Medium/Critical)" },
      { id: "mhraflag", label: "MHRA pharmacovigilance flag", endpoint: "https://mhra.gov.uk/pv/api/flags" },
      { id: "riskscore", label: "Patient risk assessment score (0-1)" },
      { id: "escalation", label: "Escalation notification to CPXO" },
    ],
    configuration: [
      { label: "MHRA flag threshold", value: "6 hours (PNH)" },
      { label: "Auto-escalate", value: "Yes - fully automated" },
      { label: "Risk model", value: "PNH · aHUS · HPP" },
    ],
    currentTask:
      "PNH threshold breach confirmed - INC-00934 Ultomiris 500mg delay exceeds 7h SLA - MHRA flag raised - severity escalated to CRITICAL",
    useCases: [
      "Assess PNH patient risk for Ultomiris delivery delays",
      "Generate MHRA pharmacovigilance flags automatically at 6h threshold",
      "Escalate aHUS exceptions for Soliris cold chain breaches",
      "Score clinical severity for HPP patients on Strensiq",
      "Trigger emergency dispatch for CRITICAL exceptions",
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
      "The Compliance Agent handles all regulatory and audit requirements automatically. It pseudonymises patient IDs under GDPR before any data is written, appends every agent decision to the append-only ledger, and generates MHRA pharmacovigilance entries without any manual intervention. Every compliance record is created automatically - no manual logging is ever required.",
    inputs: [
      { id: "exceptions", label: "Exception records from CPXO",             endpoint: "internal://cpxo/exceptions",           authMethod: "apikey", authConfig: { keyName: "agent-token", keyValue: "••••••••" },                                             status: "connected" },
      { id: "patientids", label: "Patient identifiers for pseudonymisation", endpoint: "https://ehr.arvion.uk/fhir/Patient",  authMethod: "oauth2", authConfig: { tokenUrl: "https://ehr.arvion.uk/oauth/token", clientId: "navecc-compliance", scope: "patient.read" }, status: "connected" },
      { id: "mhrareq",    label: "MHRA flag requests from Clinical Risk",    endpoint: "internal://clinical-risk/mhra",        authMethod: "apikey", authConfig: { keyName: "agent-token", keyValue: "••••••••" },                                             status: "connected" },
      { id: "actionlog",  label: "Agent action records and timestamps",     endpoint: "https://ledger.navecc.uk/api/entries", authMethod: "jwt",    authConfig: { kid: "navecc-ledger-01", issuer: "navecc", audience: "ledger" },                            status: "disconnected" },
    ],
    actions: [
      { id: "gdpr.pseudonymise", label: "gdpr.pseudonymise", hitlMode: "auto" },
      { id: "ledger.append",     label: "ledger.append",     hitlMode: "auto" },
      { id: "mhra.appendFlag",   label: "mhra.appendFlag",   hitlMode: "auto" },
      { id: "audit.seal",        label: "audit.seal",        hitlMode: "auto" },
      { id: "compliance.notify", label: "compliance.notify", hitlMode: "auto" },
      { id: "coldchain.hold",    label: "coldchain.hold",    hitlMode: "review" },
    ],
    outputs: [
      { id: "tokens",   label: "GDPR-pseudonymised patient tokens" },
      { id: "ledger",   label: "Immutable ledger entries",             endpoint: "https://ledger.navecc.uk/api/entries" },
      { id: "pvrecord", label: "MHRA pharmacovigilance records",       endpoint: "https://mhra.gov.uk/pv/api/records" },
      { id: "audit",    label: "SOC 2 and ISO 27001 audit trail" },
    ],
    configuration: [
      { label: "GDPR mode", value: "Pseudonymise all patient IDs" },
      { label: "Retention", value: "7 years" },
      { label: "Ledger", value: "Append-only · tamper-proof" },
    ],
    currentTask:
      "MHRA audit entry LOG-00296 appended to ledger for INC-00934 - regulatory entry confirmed - no manual action required",
    useCases: [
      "Auto-generate MHRA PV flags for Ultomiris delays exceeding 6h threshold",
      "Write tamper-proof audit entries for every automated action",
      "Pseudonymise PNH patient IDs before any data leaves the secure environment",
      "Produce regulator-ready audit trail on demand - SOC 2 and ISO 27001",
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
      { id: "exception", label: "Confirmed exception from CPXO",     endpoint: "internal://cpxo/exceptions",            authMethod: "apikey", authConfig: { keyName: "agent-token", keyValue: "••••••••" },                                          status: "connected" },
      { id: "contacts",  label: "Contact list for affected pathway", endpoint: "https://directory.nhs.uk/api/contacts", authMethod: "oauth2", authConfig: { tokenUrl: "https://directory.nhs.uk/oauth/token", clientId: "navecc-engage", scope: "contacts.read" }, status: "connected" },
      { id: "eta",       label: "ETA updates from Delivery Ops",     endpoint: "internal://delivery-ops/eta",           authMethod: "apikey", authConfig: { keyName: "agent-token", keyValue: "••••••••" },                                          status: "connected" },
      { id: "severity",  label: "Severity level from Clinical Risk", endpoint: "internal://clinical-risk/severity",     authMethod: "apikey", authConfig: { keyName: "agent-token", keyValue: "••••••••" },                                          status: "disconnected" },
    ],
    actions: [
      { id: "contacts.get",          label: "contacts.get",          hitlMode: "auto" },
      { id: "alert.draft",           label: "alert.draft",           hitlMode: "auto" },
      { id: "alert.send",            label: "alert.send",            hitlMode: "auto" },
      { id: "notifications.dispatch", label: "notifications.dispatch", hitlMode: "auto" },
      { id: "cpxo.confirm",          label: "cpxo.confirm",          hitlMode: "auto" },
      { id: "ward.notify",           label: "ward.notify",           hitlMode: "review" },
    ],
    outputs: [
      { id: "nursealert",   label: "Homecare nurse delay alert" },
      { id: "pharmnotify",  label: "Hospital pharmacist ETA notification" },
      { id: "opsreport",    label: "Arvion ops team exception report" },
      { id: "dispatchconf", label: "Dispatch confirmation to CPXO" },
    ],
    configuration: [
      { label: "Notify on", value: "Critical and High only" },
      { label: "Channels", value: "Email · SMS · Portal" },
      { label: "Response window", value: "15 minutes" },
    ],
    currentTask:
      "St Thomas Hospital pharmacist notification queued - Soliris 300mg ETA update - 3 notifications pending dispatch",
    useCases: [
      "Alert homecare nurses immediately when Ultomiris delivery is delayed",
      "Notify hospital pharmacy before courier arrives for dock preparation",
      "Send Arvion ops team exception reports for CRITICAL cases",
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
      "The CPXO Agent is the top orchestrator of the NavECC platform. It wakes on a configurable heartbeat interval, reads all five active data signals simultaneously, correlates them to detect silent delivery exceptions, scores severity, and delegates tasks to specialist agents. It never executes actions directly - every action is performed by a specialist agent under its instruction.",
    inputs: [
      { id: "gpsfeed",  label: "Cell-signal GPS tag feed (live)",     endpoint: "https://api.dpd.co.uk/v2/telemetry/stream", authMethod: "mtls",   authConfig: { keyId: "dpd-mtls-01", ca: "NHS Root CA" },                                              status: "connected" },
      { id: "checkins", label: "Homecare nurse check-in data",        endpoint: "https://api.hah.co.uk/v1/checkins",         authMethod: "oauth2", authConfig: { tokenUrl: "https://api.hah.co.uk/oauth/token", clientId: "navecc-cpxo", scope: "checkins.read" }, status: "connected" },
      { id: "portal",   label: "Supply chain portal status",          endpoint: "https://portal.arvion.uk/api/status",       authMethod: "oauth2", authConfig: { tokenUrl: "https://portal.arvion.uk/oauth/token", clientId: "navecc-cpxo", scope: "status.read" }, status: "connected" },
      { id: "events",   label: "Delivery event log checkpoints",      endpoint: "https://api.dpd.co.uk/v2/events",           authMethod: "apikey", authConfig: { keyName: "x-api-key", keyValue: "••••••••" },                                          status: "connected" },
      { id: "email",    label: "Email and order data signals",        endpoint: "https://mail.arvion.uk/api/signals",        authMethod: "jwt",    authConfig: { kid: "navecc-mail-01", issuer: "navecc", audience: "mail" },                            status: "disconnected" },
    ],
    actions: [
      { id: "exception.create", label: "exception.create", hitlMode: "auto" },
      { id: "agents.assign",    label: "agents.assign",    hitlMode: "auto" },
      { id: "signal.read",      label: "signal.read",      hitlMode: "auto" },
      { id: "severity.score",   label: "severity.score",   hitlMode: "auto" },
      { id: "heartbeat.log",    label: "heartbeat.log",    hitlMode: "auto" },
      { id: "goal.trace",       label: "goal.trace",       hitlMode: "auto" },
    ],
    outputs: [
      { id: "exceptions", label: "Exception records with severity score" },
      { id: "assignments", label: "Task assignments to specialist agents" },
      { id: "heartbeat",  label: "Heartbeat cycle log entries" },
      { id: "correlation", label: "Signal correlation reports" },
      { id: "ancestry",   label: "Goal ancestry for every task" },
    ],
    configuration: [
      { label: "Heartbeat interval", value: "30 seconds" },
      { label: "Primary goal", value: "Zero silent delivery failures" },
      { label: "Confirmation threshold", value: "3 sources required" },
    ],
    currentTask:
      "Monitoring 9 open exceptions across UK homecare pathway - heartbeat cycle #47 active - INC-00934 CRITICAL in progress",
    useCases: [
      "Orchestrate silent delivery delay detection across all NHS regions",
      "Correlate five signal sources to confirm exceptions before escalating",
      "Delegate CRITICAL PNH exceptions to all four specialist agents",
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
