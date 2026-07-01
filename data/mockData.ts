// NavECC - single source of truth for all mock data
// No backend, no API calls - all screens read from here

// ─── TYPES ────────────────────────────────────────────────────────────────────

export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type IncidentStatus = "OPEN" | "IN REVIEW" | "RESOLVED";
export type EvidenceLevel = "Confirmed" | "Probable" | "Possible";
export type DataSourceTag = "COURIER" | "APPT" | "NURSE";
export type AgentStatus = "ACTIVE" | "ALERT" | "IDLE";
export type ActorType = "SYSTEM" | "PHYSICIAN" | "USER";
export type AuditCategory =
  | "EVENT_CREATED"
  | "ROOT_CAUSE"
  | "PV_FLAG"
  | "REVIEW_ASSIGNED"
  | "ACTION_TAKEN"
  | "RESOLVED";
export type DataSourceType = "COURIER" | "APPT" | "NURSE" | "PORTAL" | "EMAIL";
export type DataSourceStatus = "LIVE" | "STALE" | "OFFLINE";

export interface Incident {
  id: string;
  severity: Severity;
  drug: string;
  delayHours: number;
  status: IncidentStatus;
  rootCause: string;
  evidenceLevel: EvidenceLevel;
  dataSources: DataSourceTag[];
  patientRef: string;
  pathway: "Healthcare at Home" | "NHS Hospital";
  detectedAt: string;
  date: string;
  mhraFlag: boolean;
  arvionVisibility: "ZERO" | "PARTIAL" | "FULL";
  treatmentPostponedHours: number;
  nhsStaffHoursLost: number;
  staffHoursBreakdown: { label: string; hours: number }[];
  complaintFiled: boolean;
  courierName: string;
  courierRef: string;
  location: string;
  isUnread: boolean;
  delayCause: string;
  eventSummary: string;
  responsibleAgentId: string;
  responsibleActionId: string;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  status: AgentStatus;
  color: string;
  lastHeartbeat: string;
  currentTask: string;
  signalsActive?: number;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  actor: ActorType;
  category: AuditCategory;
  title: string;
  description: string;
  incidentId?: string;
  isMHRAFlag?: boolean;
  signalSources?: string[];
}

export interface DataSource {
  id: string;
  name: string;
  type: DataSourceType;
  lastPing: string;
  status: DataSourceStatus;
}

export interface RootCause {
  label: string;
  rate: number;
  eventCount: number;
  avgDelayHours: number;
  description: string;
}

export interface KPI {
  openDelayEvents: number;
  openDelayEventsDelta: number;
  avgDeliveryDelayHours: number;
  avgDeliveryDelayDelta: number;
  nhsStaffHoursLost: number;
  nhsStaffHoursLostEvents: number;
  pendingApprovals: number;
}

export interface DelayBreakdownBar {
  month: string;
  onTime: number;
  delayed: number;
}

export interface NhsStaffHoursBar {
  label: string;
  hours: number;
}

// ─── KPI ──────────────────────────────────────────────────────────────────────

export const kpi: KPI = {
  openDelayEvents: 9,
  openDelayEventsDelta: +3,
  avgDeliveryDelayHours: 4.8,
  avgDeliveryDelayDelta: -0.9,
  nhsStaffHoursLost: 42.5,
  nhsStaffHoursLostEvents: 17,
  pendingApprovals: 3,
};

// ─── INCIDENTS ────────────────────────────────────────────────────────────────

export const incidents: Incident[] = [
  {
    // Hero incident - always first row
    id: "INC-00934",
    responsibleAgentId: "delivery-ops",
    responsibleActionId: "emergency.dispatch",
    severity: "CRITICAL",
    drug: "Ultomiris 500mg",
    delayHours: 7.2,
    status: "IN REVIEW",
    rootCause: "Courier / Traffic",
    evidenceLevel: "Confirmed",
    dataSources: ["COURIER", "APPT", "NURSE"],
    patientRef: "ARV-05934",
    pathway: "Healthcare at Home",
    detectedAt: "2026-06-25T08:47:00Z",
    date: "25 Jun 2026",
    mhraFlag: true,
    arvionVisibility: "ZERO",
    treatmentPostponedHours: 26,
    nhsStaffHoursLost: 3.5,
    staffHoursBreakdown: [
      { label: "Nurse rebooking", hours: 1.5 },
      { label: "Infusion reschedule", hours: 1.0 },
      { label: "Pharmacy coordination", hours: 0.6 },
      { label: "Patient liaison", hours: 0.4 },
    ],
    complaintFiled: false,
    courierName: "DPD",
    courierRef: "DPD-7741882",
    location: "M6 · J7-J8 Birmingham",
    isUnread: true,
    delayCause: "M6 congestion: courier stationary near J7-J8 Birmingham for 7+ hours",
    eventSummary:
      "Ultomiris 500mg dispatched at 07:00 for a PNH patient scheduled for infusion at 10:00. DPD courier became stationary on the M6 near Junction 7-8 Birmingham at 07:43. Cell-signal tag detected no movement by 08:12. Homecare nurse check-in window opened at 08:31 with no confirmation received. Supply chain portal timestamp remained stale from 07:43. A weak email signal was automatically detected at 08:44, the homecare nurse sending 'still waiting'. CPXO raised exception INC-00934 at 08:47, before NHS staff were aware the delivery was late. Without NavECC, the courier would have arrived 7 hours late, the nurse would have quietly rescheduled, and Arvion would have seen only a late timestamp with zero context.",
  },
  {
    id: "INC-00928",
    responsibleAgentId: "compliance",
    responsibleActionId: "coldchain.hold",
    severity: "HIGH",
    drug: "Soliris 300mg",
    delayHours: 5.6,
    status: "IN REVIEW",
    rootCause: "Cold Chain",
    evidenceLevel: "Probable",
    dataSources: ["COURIER", "APPT"],
    patientRef: "ARV-05928",
    pathway: "Healthcare at Home",
    detectedAt: "2026-06-24T11:22:00Z",
    date: "24 Jun 2026",
    mhraFlag: false,
    arvionVisibility: "PARTIAL",
    treatmentPostponedHours: 18,
    nhsStaffHoursLost: 2.8,
    staffHoursBreakdown: [
      { label: "Pharmacy coordination", hours: 1.0 },
      { label: "Infusion reschedule", hours: 0.8 },
      { label: "Nurse rebooking", hours: 0.6 },
      { label: "Patient liaison", hours: 0.4 },
    ],
    complaintFiled: false,
    courierName: "DHL",
    courierRef: "DHL-3392041",
    location: "Leeds Distribution Hub",
    isUnread: true,
    delayCause: "Temperature excursion detected at Leeds hub - cold chain integrity at risk",
    eventSummary:
      "Soliris 300mg shipment temperature rose above threshold during transit through Leeds distribution hub. Cold chain tag flagged excursion at 11:22. Delivery held pending pharmacist assessment. Infusion window at risk.",
  },
  {
    id: "INC-00921",
    responsibleAgentId: "engagement",
    responsibleActionId: "ward.notify",
    severity: "HIGH",
    drug: "Strensiq 80mg",
    delayHours: 4.1,
    status: "IN REVIEW",
    rootCause: "Hospital Receiving",
    evidenceLevel: "Confirmed",
    dataSources: ["COURIER", "NURSE"],
    patientRef: "ARV-05921",
    pathway: "NHS Hospital",
    detectedAt: "2026-06-23T14:05:00Z",
    date: "23 Jun 2026",
    mhraFlag: false,
    arvionVisibility: "PARTIAL",
    treatmentPostponedHours: 12,
    nhsStaffHoursLost: 1.9,
    staffHoursBreakdown: [
      { label: "Pharmacy coordination", hours: 0.8 },
      { label: "Nurse rebooking", hours: 0.5 },
      { label: "Infusion reschedule", hours: 0.4 },
      { label: "Patient liaison", hours: 0.2 },
    ],
    complaintFiled: false,
    courierName: "DPD",
    courierRef: "DPD-6619203",
    location: "St Thomas' Hospital - Receiving Bay",
    isUnread: false,
    delayCause: "Hospital receiving bay unmanned - delivery held at security desk for 4h",
    eventSummary:
      "Strensiq 80mg delivered to St Thomas' Hospital at 10:05 but receiving bay was unmanned. Package held at security desk. Homecare nurse not notified. Delivery system showed 'delivered' while drug was inaccessible.",
  },
  {
    id: "INC-00915",
    responsibleAgentId: "delivery-ops",
    responsibleActionId: "routes.getAlternates",
    severity: "MEDIUM",
    drug: "Ultomiris 500mg",
    delayHours: 3.8,
    status: "OPEN",
    rootCause: "Courier / Traffic",
    evidenceLevel: "Confirmed",
    dataSources: ["COURIER", "APPT", "NURSE"],
    patientRef: "ARV-05915",
    pathway: "Healthcare at Home",
    detectedAt: "2026-06-22T09:31:00Z",
    date: "22 Jun 2026",
    mhraFlag: false,
    arvionVisibility: "ZERO",
    treatmentPostponedHours: 8,
    nhsStaffHoursLost: 1.2,
    staffHoursBreakdown: [
      { label: "Nurse rebooking", hours: 0.6 },
      { label: "Infusion reschedule", hours: 0.3 },
      { label: "Pharmacy coordination", hours: 0.2 },
      { label: "Patient liaison", hours: 0.1 },
    ],
    complaintFiled: false,
    courierName: "DPD",
    courierRef: "DPD-7730091",
    location: "A14 · Cambridge to Ipswich",
    isUnread: false,
    delayCause: "A14 accident - courier rerouted, ETA pushed by 3.8h",
    eventSummary:
      "Ultomiris 500mg delayed due to A14 road accident. Courier rerouted. Infusion window at medium risk. NavECC detected via courier position stall and missed nurse check-in.",
  },
  {
    id: "INC-00909",
    responsibleAgentId: "engagement",
    responsibleActionId: "ward.notify",
    severity: "MEDIUM",
    drug: "Soliris 300mg",
    delayHours: 2.7,
    status: "RESOLVED",
    rootCause: "Homecare Scheduling",
    evidenceLevel: "Possible",
    dataSources: ["COURIER"],
    patientRef: "ARV-05909",
    pathway: "Healthcare at Home",
    detectedAt: "2026-06-20T08:14:00Z",
    date: "20 Jun 2026",
    mhraFlag: false,
    arvionVisibility: "PARTIAL",
    treatmentPostponedHours: 4,
    nhsStaffHoursLost: 0.8,
    staffHoursBreakdown: [
      { label: "Nurse rebooking", hours: 0.4 },
      { label: "Infusion reschedule", hours: 0.2 },
      { label: "Pharmacy coordination", hours: 0.1 },
      { label: "Patient liaison", hours: 0.1 },
    ],
    complaintFiled: false,
    courierName: "DHL",
    courierRef: "DHL-3381204",
    location: "Bristol · Homecare Schedule Mismatch",
    isUnread: false,
    delayCause: "Homecare nurse appointment rescheduled without updating logistics",
    eventSummary:
      "Soliris 300mg delivered on time but homecare nurse appointment had been rescheduled without updating the logistics portal. Drug delivered to unmanned address. Resolved after NavECC alerted ops team.",
  },
  {
    id: "INC-00903",
    responsibleAgentId: "delivery-ops",
    responsibleActionId: "emergency.dispatch",
    severity: "HIGH",
    drug: "Ultomiris 500mg",
    delayHours: 6.9,
    status: "OPEN",
    rootCause: "Courier / Traffic",
    evidenceLevel: "Confirmed",
    dataSources: ["COURIER", "APPT", "NURSE"],
    patientRef: "ARV-05903",
    pathway: "Healthcare at Home",
    detectedAt: "2026-06-18T07:58:00Z",
    date: "18 Jun 2026",
    mhraFlag: false,
    arvionVisibility: "ZERO",
    treatmentPostponedHours: 22,
    nhsStaffHoursLost: 3.1,
    staffHoursBreakdown: [
      { label: "Nurse rebooking", hours: 1.4 },
      { label: "Infusion reschedule", hours: 0.9 },
      { label: "Pharmacy coordination", hours: 0.5 },
      { label: "Patient liaison", hours: 0.3 },
    ],
    complaintFiled: false,
    courierName: "DPD",
    courierRef: "DPD-7718844",
    location: "M25 · J10-J12 Surrey",
    isUnread: false,
    delayCause: "M25 congestion - courier delayed 6.9h with no proactive alert from carrier",
    eventSummary:
      "Ultomiris 500mg for PNH patient delayed 6.9h on M25. Carrier sent no alert. No complaint filed. NavECC detected via stale portal timestamp and cell-signal tag position freeze.",
  },
  // ─── 90-day historical incidents ─────────────────────────────────────────
  {
    id: "INC-00897",
    responsibleAgentId: "delivery-ops",
    responsibleActionId: "emergency.dispatch",
    severity: "HIGH",
    drug: "Ultomiris 500mg",
    delayHours: 5.1,
    status: "RESOLVED",
    rootCause: "Courier / Traffic",
    evidenceLevel: "Confirmed",
    dataSources: ["COURIER", "APPT"],
    patientRef: "ARV-05897",
    pathway: "Healthcare at Home",
    detectedAt: "2026-05-12T10:15:00Z",
    date: "12 May 2026",
    mhraFlag: false,
    arvionVisibility: "ZERO",
    treatmentPostponedHours: 14,
    nhsStaffHoursLost: 2.1,
    staffHoursBreakdown: [
      { label: "Nurse rebooking", hours: 0.9 },
      { label: "Infusion reschedule", hours: 0.6 },
      { label: "Pharmacy coordination", hours: 0.4 },
      { label: "Patient liaison", hours: 0.2 },
    ],
    complaintFiled: false,
    courierName: "DPD",
    courierRef: "DPD-7706612",
    location: "M1 · J28-J30 Nottingham",
    isUnread: false,
    delayCause: "M1 roadworks - courier diverted, ETA pushed 5.1h",
    eventSummary:
      "Ultomiris 500mg delayed 5.1h due to M1 roadworks near Nottingham. Resolved after emergency re-route. No complaint filed.",
  },
  {
    id: "INC-00881",
    responsibleAgentId: "engagement",
    responsibleActionId: "ward.notify",
    severity: "MEDIUM",
    drug: "Soliris 300mg",
    delayHours: 3.2,
    status: "RESOLVED",
    rootCause: "Homecare Scheduling",
    evidenceLevel: "Probable",
    dataSources: ["COURIER"],
    patientRef: "ARV-05881",
    pathway: "Healthcare at Home",
    detectedAt: "2026-04-25T14:30:00Z",
    date: "25 Apr 2026",
    mhraFlag: false,
    arvionVisibility: "PARTIAL",
    treatmentPostponedHours: 6,
    nhsStaffHoursLost: 1.4,
    staffHoursBreakdown: [
      { label: "Nurse rebooking", hours: 0.7 },
      { label: "Infusion reschedule", hours: 0.4 },
      { label: "Pharmacy coordination", hours: 0.2 },
      { label: "Patient liaison", hours: 0.1 },
    ],
    complaintFiled: false,
    courierName: "DHL",
    courierRef: "DHL-3370088",
    location: "Manchester · Homecare Schedule Mismatch",
    isUnread: false,
    delayCause: "Homecare nurse appointment changed without logistics update - delivery to unmanned address",
    eventSummary:
      "Soliris 300mg delivered on time but nurse appointment had been moved. Resolved after NavECC ops alert.",
  },
  {
    id: "INC-00865",
    responsibleAgentId: "compliance",
    responsibleActionId: "coldchain.hold",
    severity: "HIGH",
    drug: "Strensiq 80mg",
    delayHours: 4.8,
    status: "RESOLVED",
    rootCause: "Cold Chain",
    evidenceLevel: "Confirmed",
    dataSources: ["COURIER", "APPT"],
    patientRef: "ARV-05865",
    pathway: "NHS Hospital",
    detectedAt: "2026-04-09T09:20:00Z",
    date: "9 Apr 2026",
    mhraFlag: false,
    arvionVisibility: "PARTIAL",
    treatmentPostponedHours: 10,
    nhsStaffHoursLost: 2.6,
    staffHoursBreakdown: [
      { label: "Pharmacy coordination", hours: 0.9 },
      { label: "Infusion reschedule", hours: 0.7 },
      { label: "Nurse rebooking", hours: 0.5 },
      { label: "Patient liaison", hours: 0.5 },
    ],
    complaintFiled: false,
    courierName: "DHL",
    courierRef: "DHL-3355041",
    location: "Sheffield · Cold Chain Hold",
    isUnread: false,
    delayCause: "Temperature excursion at Sheffield depot - Strensiq held for pharmacist review",
    eventSummary:
      "Strensiq 80mg flagged at Sheffield cold-chain checkpoint. Held 4.8h pending pharmacist sign-off. Resolved after integrity confirmed.",
  },
];

// ─── AGENTS ───────────────────────────────────────────────────────────────────

export const agents: Agent[] = [
  {
    id: "cpxo",
    name: "CPXO Agent",
    role: "Chief Patient Experience Officer",
    status: "ACTIVE",
    color: "#005EB8",
    lastHeartbeat: "1 min ago",
    currentTask: "Monitoring 9 open exceptions across UK homecare",
    signalsActive: 5,
  },
  {
    id: "delivery-ops",
    name: "Delivery Ops",
    role: "Courier & logistics specialist",
    status: "ACTIVE",
    color: "#028090",
    lastHeartbeat: "1 min ago",
    currentTask: "Tracking INC-00934 courier - M6 route pending",
  },
  {
    id: "clinical-risk",
    name: "Clinical Risk",
    role: "Patient safety & severity scoring",
    status: "ALERT",
    color: "#005EB8",
    lastHeartbeat: "1 min ago",
    currentTask: "PNH threshold breach - INC-00934 exceeds 7h SLA",
  },
  {
    id: "compliance",
    name: "Compliance",
    role: "Audit, GDPR & pharmacovigilance",
    status: "ACTIVE",
    color: "#028090",
    lastHeartbeat: "3 min ago",
    currentTask: "MHRA audit entry appended for INC-00934",
  },
  {
    id: "engagement",
    name: "Engagement",
    role: "Homecare & ops team alerts",
    status: "ACTIVE",
    color: "#005EB8",
    lastHeartbeat: "5 min ago",
    currentTask: "St Thomas pharmacist notification queued",
  },
];

// ─── DATA SOURCES ─────────────────────────────────────────────────────────────

export const dataSources: DataSource[] = [
  {
    id: "cell-signal",
    name: "Cell-signal tags",
    type: "COURIER",
    lastPing: "4 min ago",
    status: "LIVE",
  },
  {
    id: "homecare-checkins",
    name: "Homecare check-ins",
    type: "NURSE",
    lastPing: "12 min ago",
    status: "LIVE",
  },
  {
    id: "delivery-event-logs",
    name: "Delivery event logs",
    type: "COURIER",
    lastPing: "1 min ago",
    status: "LIVE",
  },
  {
    id: "supply-chain-portal",
    name: "Supply chain portal",
    type: "PORTAL",
    lastPing: "8 min ago",
    status: "LIVE",
  },
  {
    id: "email-order-data",
    name: "Email and order data",
    type: "EMAIL",
    lastPing: "22 min ago",
    status: "LIVE",
  },
];

// ─── AUDIT LOG ────────────────────────────────────────────────────────────────

export const auditLog: AuditEntry[] = [
  {
    id: "LOG-00294",
    timestamp: "2026-06-25T09:14:00Z",
    actor: "SYSTEM",
    category: "REVIEW_ASSIGNED",
    title: "Review assigned to Sarah Mitchell",
    description:
      "Exception INC-00934 assigned to Supply Chain Lead Sarah Mitchell for post-action governance review. Ledger entry is read-only.",
    incidentId: "INC-00934",
  },
  {
    // Most important entry - amber left border in UI
    id: "LOG-00293",
    timestamp: "2026-06-25T09:02:44Z",
    actor: "SYSTEM",
    category: "PV_FLAG",
    title: "MHRA audit entry generated - delay exceeds 6h threshold for Ultomiris (PNH)",
    description:
      "Pharmacovigilance flag automatically generated. Ultomiris 500mg delivery delay of 7.2h exceeds the 6h MHRA reporting threshold for PNH patients. Entry appended to regulator-facing ledger. No manual action required.",
    incidentId: "INC-00934",
    isMHRAFlag: true,
    signalSources: ["Cell-signal tags", "Supply chain portal", "Homecare check-ins"],
  },
  {
    id: "LOG-00277",
    timestamp: "2026-06-25T08:48:00Z",
    actor: "SYSTEM",
    category: "ACTION_TAKEN",
    title: "Emergency dispatch triggered - INC-00934 - awaiting acknowledgement",
    description:
      "Automated action engine triggered emergency courier dispatch for the PNH patient after the 7.2h M6 delay. Backup DPD unit re-routed from the Birmingham depot to recover the infusion. Action executed - policy-matched - awaiting human acknowledgement.",
    incidentId: "INC-00934",
  },
  {
    id: "LOG-00292",
    timestamp: "2026-06-25T08:47:31Z",
    actor: "SYSTEM",
    category: "ROOT_CAUSE",
    title: "Root cause assigned - Courier / Traffic (M6 congestion)",
    description:
      "Delivery Ops agent confirmed DPD courier DPD-7741882 stationary on M6 J7-J8 Birmingham. Root cause classified as Courier / Traffic. ETA delta: +7.2h vs scheduled infusion window.",
    incidentId: "INC-00934",
    signalSources: ["Cell-signal tags", "Delivery event logs"],
  },
  {
    id: "LOG-00291",
    timestamp: "2026-06-25T08:47:14Z",
    actor: "SYSTEM",
    category: "EVENT_CREATED",
    title: "Exception INC-00934 created - three sources confirmed",
    description:
      "CPXO agent raised silent delivery exception for Ultomiris 500mg (ARV-05934). Three independent signals confirmed: courier position freeze (cell-signal tag), missed nurse check-in (homecare portal), stale supply chain timestamp. Severity: LIFE-CRITICAL. Four specialist agents delegated simultaneously.",
    incidentId: "INC-00934",
    signalSources: [
      "Cell-signal tags",
      "Homecare check-ins",
      "Supply chain portal",
      "Email and order data",
    ],
  },
  {
    id: "LOG-00290",
    timestamp: "2026-06-24T15:43:00Z",
    actor: "PHYSICIAN",
    category: "REVIEW_ASSIGNED",
    title: "INC-00928 clinical review completed",
    description:
      "Clinical pharmacist reviewed cold chain excursion for Soliris 300mg. Drug integrity confirmed within acceptable range. Delivery approved to proceed with monitoring.",
    incidentId: "INC-00928",
  },
  {
    id: "LOG-00289",
    timestamp: "2026-06-24T11:22:18Z",
    actor: "SYSTEM",
    category: "EVENT_CREATED",
    title: "Exception INC-00928 created - cold chain temperature excursion",
    description:
      "Soliris 300mg temperature tag detected excursion above 8°C at Leeds distribution hub. CPXO raised exception. Clinical Risk agent flagging for pharmacist review.",
    incidentId: "INC-00928",
    signalSources: ["Cell-signal tags", "Supply chain portal"],
  },
  {
    id: "LOG-00288",
    timestamp: "2026-06-23T16:20:00Z",
    actor: "USER",
    category: "REVIEW_ASSIGNED",
    title: "INC-00921 escalated to ward pharmacist - St Thomas'",
    description:
      "Supply chain lead escalated Strensiq 80mg receiving bay delay to ward pharmacist. Patient treatment window rescheduled. Audit trail complete.",
    incidentId: "INC-00921",
  },
  {
    id: "LOG-00287",
    timestamp: "2026-06-23T14:05:33Z",
    actor: "SYSTEM",
    category: "EVENT_CREATED",
    title: "Exception INC-00921 created - hospital receiving bay unmanned",
    description:
      "Strensiq 80mg confirmed delivered to St Thomas' security desk at 10:05. Receiving bay unmanned. Delivery system falsely showing 'Delivered'. CPXO raised exception via nurse check-in gap.",
    incidentId: "INC-00921",
    signalSources: ["Delivery event logs", "Homecare check-ins"],
  },
  // ── INC-00915 (OPEN) - Courier / Traffic, A14 accident - detected & classified, monitoring ──
  {
    id: "LOG-00275",
    timestamp: "2026-06-22T09:32:00Z",
    actor: "SYSTEM",
    category: "ROOT_CAUSE",
    title: "Root cause assigned - Courier / Traffic (A14 accident)",
    description:
      "Delay attributed to an A14 accident near Cambridge. Courier rerouted, ETA pushed 3.8h. Within SLA - monitoring, no automated action triggered yet.",
    incidentId: "INC-00915",
  },
  {
    id: "LOG-00274",
    timestamp: "2026-06-22T09:31:00Z",
    actor: "SYSTEM",
    category: "EVENT_CREATED",
    title: "Exception INC-00915 created - A14 accident delay",
    description:
      "Ultomiris 500mg courier rerouted after an A14 accident near Cambridge. CPXO detected via courier GPS diversion and stale portal timestamp. Two signals confirmed.",
    incidentId: "INC-00915",
    signalSources: ["Cell-signal tags", "Supply chain portal"],
  },
  {
    id: "LOG-00286",
    timestamp: "2026-06-20T11:44:00Z",
    actor: "SYSTEM",
    category: "RESOLVED",
    title: "INC-00909 resolved - homecare schedule mismatch corrected",
    description:
      "Soliris 300mg redelivery completed. Homecare scheduling system updated. Ops team confirmed patient treated. Incident closed.",
    incidentId: "INC-00909",
  },
  {
    id: "LOG-00273",
    timestamp: "2026-06-20T09:30:00Z",
    actor: "SYSTEM",
    category: "ACTION_TAKEN",
    title: "Homecare ETA re-sync triggered - INC-00909",
    description:
      "Engagement agent re-synced the logistics ETA with the homecare portal and rebooked the nurse visit to the corrected slot. Redelivery coordinated.",
    incidentId: "INC-00909",
  },
  {
    id: "LOG-00272",
    timestamp: "2026-06-20T08:15:00Z",
    actor: "SYSTEM",
    category: "ROOT_CAUSE",
    title: "Root cause assigned - Homecare Scheduling",
    description:
      "Delay attributed to a nurse appointment rescheduled without updating the logistics portal - drug left unattended at the address.",
    incidentId: "INC-00909",
  },
  {
    id: "LOG-00285",
    timestamp: "2026-06-20T08:14:22Z",
    actor: "SYSTEM",
    category: "EVENT_CREATED",
    title: "Exception INC-00909 created - homecare scheduling mismatch",
    description:
      "Soliris 300mg delivered to patient address but nurse appointment rescheduled without updating logistics portal. Drug unattended. CPXO detected via courier delivery confirmation vs nurse check-in absence.",
    incidentId: "INC-00909",
    signalSources: ["Delivery event logs"],
  },
  {
    id: "LOG-00284",
    timestamp: "2026-06-18T13:12:00Z",
    actor: "SYSTEM",
    category: "ACTION_TAKEN",
    title: "Emergency dispatch triggered - INC-00903 - no human approval",
    description:
      "Automated action engine escalated INC-00903 to emergency courier dispatch. Second DPD unit dispatched from Birmingham depot. Action executed immediately - policy-matched - no human approval required.",
    incidentId: "INC-00903",
  },
  {
    id: "LOG-00276",
    timestamp: "2026-06-18T07:59:00Z",
    actor: "SYSTEM",
    category: "ROOT_CAUSE",
    title: "Root cause assigned - Courier / Traffic (M25 congestion)",
    description:
      "Delay attributed to M25 J10-J12 congestion in Surrey. Courier delayed 6.9h with no proactive carrier alert. Automated emergency dispatch triggered - awaiting human acknowledgement.",
    incidentId: "INC-00903",
  },
  {
    id: "LOG-00283",
    timestamp: "2026-06-18T07:58:11Z",
    actor: "SYSTEM",
    category: "EVENT_CREATED",
    title: "Exception INC-00903 created - M25 delay, no carrier alert",
    description:
      "Ultomiris 500mg courier delayed 6.9h on M25. Carrier DPD sent no proactive alert. CPXO detected via stale portal timestamp and cell-signal position freeze. Three signals confirmed.",
    incidentId: "INC-00903",
    signalSources: ["Cell-signal tags", "Supply chain portal", "Email and order data"],
  },

  // ── INC-00897 (RESOLVED) - Courier / Traffic, M1 roadworks ──
  {
    id: "LOG-00271",
    timestamp: "2026-05-12T13:20:00Z",
    actor: "SYSTEM",
    category: "RESOLVED",
    title: "INC-00897 resolved - emergency re-route completed",
    description:
      "Ultomiris 500mg re-routed around the M1 roadworks via backup courier and delivered the same day. Infusion administered. Ops team confirmed patient treated. Incident closed.",
    incidentId: "INC-00897",
  },
  {
    id: "LOG-00270",
    timestamp: "2026-05-12T10:42:00Z",
    actor: "SYSTEM",
    category: "ACTION_TAKEN",
    title: "Backup courier dispatched - INC-00897",
    description:
      "Automated action engine triggered the M1/M25 corridor backup courier SLA. Replacement DPD unit re-routed via the A52. Delivery recovered within the treatment window.",
    incidentId: "INC-00897",
  },
  {
    id: "LOG-00269",
    timestamp: "2026-05-12T10:16:00Z",
    actor: "SYSTEM",
    category: "ROOT_CAUSE",
    title: "Root cause assigned - Courier / Traffic (M1 roadworks)",
    description:
      "Delay attributed to M1 J28-J30 roadworks near Nottingham. Courier diverted and ETA pushed 5.1h.",
    incidentId: "INC-00897",
  },
  {
    id: "LOG-00268",
    timestamp: "2026-05-12T10:15:00Z",
    actor: "SYSTEM",
    category: "EVENT_CREATED",
    title: "Exception INC-00897 created - M1 roadworks delay",
    description:
      "Ultomiris 500mg delayed 5.1h by M1 roadworks. CPXO detected via courier GPS diversion and missed infusion window. Two signals confirmed.",
    incidentId: "INC-00897",
    signalSources: ["Cell-signal tags", "Delivery event logs"],
  },

  // ── INC-00881 (RESOLVED) - Homecare Scheduling ──
  {
    id: "LOG-00261",
    timestamp: "2026-04-25T17:10:00Z",
    actor: "SYSTEM",
    category: "RESOLVED",
    title: "INC-00881 resolved - homecare schedule corrected",
    description:
      "Soliris 300mg redelivery coordinated after the nurse appointment change. Homecare portal updated with the revised slot. Ops confirmed patient treated. Incident closed.",
    incidentId: "INC-00881",
  },
  {
    id: "LOG-00260",
    timestamp: "2026-04-25T15:05:00Z",
    actor: "SYSTEM",
    category: "ACTION_TAKEN",
    title: "Homecare ETA sync triggered - INC-00881",
    description:
      "Engagement agent notified the homecare provider of the revised nurse availability and re-synced the logistics ETA. Redelivery booked to the corrected window.",
    incidentId: "INC-00881",
  },
  {
    id: "LOG-00259",
    timestamp: "2026-04-25T14:31:00Z",
    actor: "SYSTEM",
    category: "ROOT_CAUSE",
    title: "Root cause assigned - Homecare Scheduling",
    description:
      "Delay attributed to a nurse appointment moved without updating the logistics portal - delivery made to an unmanned address.",
    incidentId: "INC-00881",
  },
  {
    id: "LOG-00258",
    timestamp: "2026-04-25T14:30:00Z",
    actor: "SYSTEM",
    category: "EVENT_CREATED",
    title: "Exception INC-00881 created - homecare scheduling mismatch",
    description:
      "Soliris 300mg delivered on time but the nurse appointment had been rescheduled. CPXO detected via delivery confirmation versus nurse check-in absence.",
    incidentId: "INC-00881",
    signalSources: ["Delivery event logs"],
  },

  // ── INC-00865 (RESOLVED) - Cold Chain, Sheffield ──
  {
    id: "LOG-00251",
    timestamp: "2026-04-09T13:30:00Z",
    actor: "PHYSICIAN",
    category: "RESOLVED",
    title: "INC-00865 resolved - cold chain integrity confirmed",
    description:
      "Strensiq 80mg released after the pharmacist confirmed the temperature excursion stayed within stability limits. Dispensed and administered. Incident closed.",
    incidentId: "INC-00865",
  },
  {
    id: "LOG-00250",
    timestamp: "2026-04-09T10:05:00Z",
    actor: "SYSTEM",
    category: "ACTION_TAKEN",
    title: "Pharmacist verification hold actioned - INC-00865",
    description:
      "Compliance agent raised pharmacist pre-notification on the cold-chain excursion. Strensiq held at the Sheffield depot pending integrity sign-off.",
    incidentId: "INC-00865",
  },
  {
    id: "LOG-00249",
    timestamp: "2026-04-09T09:21:00Z",
    actor: "SYSTEM",
    category: "ROOT_CAUSE",
    title: "Root cause assigned - Cold Chain (temperature excursion)",
    description:
      "Delay attributed to a temperature excursion at the Sheffield depot - Strensiq held for mandatory pharmacist review.",
    incidentId: "INC-00865",
  },
  {
    id: "LOG-00248",
    timestamp: "2026-04-09T09:20:00Z",
    actor: "SYSTEM",
    category: "EVENT_CREATED",
    title: "Exception INC-00865 created - cold chain temperature excursion",
    description:
      "Strensiq 80mg flagged at the Sheffield cold-chain checkpoint. CPXO detected via temperature tag breach and held the delivery. Two signals confirmed.",
    incidentId: "INC-00865",
    signalSources: ["Cell-signal tags", "Supply chain portal"],
  },
];

// ─── ROOT CAUSES ──────────────────────────────────────────────────────────────

export const rootCauses: RootCause[] = [
  {
    label: "Courier / Traffic",
    rate: 0.8,
    eventCount: 9,
    avgDelayHours: 5.8,
    description:
      "Road congestion, route diversions, and courier vehicle breakdowns. Primary driver of LIFE-CRITICAL exceptions.",
  },
  {
    label: "Cold Chain",
    rate: 0.2,
    eventCount: 2,
    avgDelayHours: 8.7,
    description:
      "Temperature excursions at distribution hubs or during last-mile transit. Longest average delays.",
  },
  {
    label: "Hospital Receiving",
    rate: 0.2,
    eventCount: 2,
    avgDelayHours: 4.1,
    description:
      "Unmanned receiving bays, security desk handoffs, and ward porter delays at NHS hospital sites.",
  },
  {
    label: "Homecare Scheduling",
    rate: 0.1,
    eventCount: 1,
    avgDelayHours: 2.7,
    description:
      "Nurse appointment rescheduled without updating the logistics or delivery confirmation system.",
  },
];

// ─── DELAY BREAKDOWN CHART DATA ───────────────────────────────────────────────

export const delayBreakdown: DelayBreakdownBar[] = [
  { month: "Jan", onTime: 99.1, delayed: 0.9 },
  { month: "Feb", onTime: 98.8, delayed: 1.2 },
  { month: "Mar", onTime: 99.2, delayed: 0.8 },
  { month: "Apr", onTime: 98.5, delayed: 1.5 },
  { month: "May", onTime: 98.9, delayed: 1.1 },
  { month: "Jun", onTime: 98.7, delayed: 1.3 },
];

// ─── NHS STAFF HOURS CHART DATA (incident detail) ────────────────────────────

// Aggregate across all 17 delay events - sums to the 42.5h headline total.
export const nhsStaffHours: NhsStaffHoursBar[] = [
  { label: "Nurse rebooking", hours: 15.5 },
  { label: "Infusion reschedule", hours: 11.6 },
  { label: "Pharmacy coordination", hours: 10.3 },
  { label: "Patient liaison", hours: 5.1 },
];

// ─── PENDING APPROVALS ────────────────────────────────────────────────────────

export const pendingApprovals = [
  {
    id: "ACT-001",
    severity: "CRITICAL" as Severity,
    category: "Emergency dispatch",
    title: "Acknowledge emergency dispatch - INC-00934",
    detail: "DPD-7741882 stationary M6 J7-J8 · 7.2h delay · PNH patient",
    timeRemaining: "12 min",
    incidentId: "INC-00934",
  },
  {
    id: "ACT-002",
    severity: "HIGH" as Severity,
    category: "Cold chain review",
    title: "Confirm cold chain action taken - INC-00928",
    detail: "Soliris 300mg · Leeds hub temperature excursion · 5.6h delay",
    timeRemaining: "1.5h",
    incidentId: "INC-00928",
  },
  {
    id: "ACT-003",
    severity: "HIGH" as Severity,
    category: "Hospital escalation",
    title: "Confirm ward notification sent - INC-00921",
    detail: "Strensiq 80mg · St Thomas' receiving bay · 4.1h delay",
    timeRemaining: "3h",
    incidentId: "INC-00921",
  },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

export function getIncidentById(id: string): Incident | undefined {
  return incidents.find((i) => i.id === id);
}

export function getAuditEntriesForIncident(incidentId: string): AuditEntry[] {
  return auditLog.filter((e) => e.incidentId === incidentId);
}

export const severityColor: Record<Severity, string> = {
  CRITICAL: "#005EB8",
  HIGH:     "#028090",
  MEDIUM:   "#005EB8",
  LOW:      "#028090",
};

export const severityOrder: Record<Severity, number> = {
  CRITICAL: 0,
  HIGH:     1,
  MEDIUM:   2,
  LOW:      3,
};
