# Silent Delivery Delay Detection — Backend

> **Status:** Phase 1 LIVE — active use case driving the entire NavECC platform.  
> **Demo mode:** All data served from `src/data/mockData.ts`. No real backend in demo build.

---

## Problem

Rare disease patients receive life-critical drugs (Ultomiris, Soliris, Strensiq) via NHS homecare nurses. When deliveries are delayed, NHS staff quietly absorb the problem — rescheduling infusions, rebooking nurses — without filing any complaint with Arvion. The manufacturer sees a late timestamp with zero context. This is the silent 1.3% failure rate.

NavECC detects the exception **before** NHS absorption silences the signal.

---

## Agent Architecture

### CPXO Agent — Chief Patient Experience Officer
- Wakes on heartbeat (scheduled scan cycle)
- Reads all five active data sources
- Correlates three signal types (logistics + scheduling + delivery status)
- Scores severity: LOW / MEDIUM / LIFE-CRITICAL
- Packages task with full goal ancestry and delegates to all four specialist agents simultaneously
- **Never executes actions directly**
- If no exception → logs clean heartbeat → sleeps

### Four Specialist Agents (parallel execution)

| Agent | Colour | Job |
|-------|--------|-----|
| Delivery Ops | `#028090` | Confirms delay from logistics data, maps courier live GPS position |
| Clinical Risk | `#E05C5C` | Scores patient safety severity, flags PNH/aHUS/HPP threshold breaches |
| Compliance | `#E8A838` | Appends exception to Reasoning Ledger, generates MHRA pharmacovigilance flag |
| Engagement | `#185FA5` | Drafts homecare nurse alerts, notifies Alexion ops, queues pharmacy notifications |

---

## Automated Action Engine (no human gate)

| Severity | Action |
|----------|--------|
| LOW | Monitor and log only |
| MEDIUM | Expedite existing courier + alert team |
| LIFE-CRITICAL | Emergency dispatch fires immediately — no approval — policy-matched |

---

## Five Active Data Sources

1. **Cell-signal temperature tags** — Live GPS + drug temperature every ~4 min. Exception: courier stationary >45 min outside route corridor.
2. **Homecare digital check-ins** — Nurse confirmation ping at expected delivery window. Exception: no response within 15 min.
3. **Delivery event logs** — Every DPD/DHL checkpoint scan. Exception: expected scan missed.
4. **Supply chain portal** — Shipment status timestamp. Exception: stale >2h with no update.
5. **Email and order data** — Parsed inbound nurse email ("still waiting…"). Exception: keyword match on delay language.

---

## Reasoning Ledger

- Append-only database — always rendered as DATABASE CYLINDER (never a box)
- Logs every exception, decision, signal source, action taken, outcome, and timestamp
- Tamper-proof · GDPR-ready · regulator-facing
- Compliance: SOC 2 · ISO 27001 · HIPAA · GDPR · MHRA pharmacovigilance

### Ledger Entry Schema
```typescript
interface LedgerEntry {
  id: string
  timestamp: string
  actor: "SYSTEM" | "PHYSICIAN" | "USER"
  category: "EVENT_CREATED" | "ROOT_CAUSE" | "PV_FLAG" | "REVIEW_ASSIGNED" | "ACTION_TAKEN" | "RESOLVED"
  title: string
  description: string
  incidentId?: string
  isMHRAFlag?: boolean       // amber left border in UI
  signalSources?: string[]
}
```

---

## Data Models

```typescript
interface Incident {
  id: string                 // "INC-00934"
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
  drug: string               // "Ultomiris 500mg"
  delayHours: number
  status: "OPEN" | "IN REVIEW" | "RESOLVED"
  rootCause: string
  evidenceLevel: "Confirmed" | "Probable" | "Possible"
  dataSources: ("COURIER" | "APPT" | "NURSE")[]
  patientRef: string         // "ARV-05934"
  pathway: "Healthcare at Home" | "NHS Hospital"
  detectedAt: string         // ISO 8601
  mhraFlag: boolean
  arvionVisibility: "ZERO" | "PARTIAL" | "FULL"
  treatmentPostponedHours: number
  nhsStaffHoursLost: number
  complaintFiled: boolean
  courierRef: string
  location: string
}
```

---

## Hero Scenario — INC-00934

```
07:00  Ultomiris 500mg dispatched for PNH patient, infusion at 10:00
08:12  Cell-signal tag: courier stationary 29 min — anomaly
08:31  Homecare nurse check-in window opens — no confirmation
08:39  Supply chain portal timestamp stale
08:44  Email signal: nurse sent "still waiting" to ops inbox
08:47  CPXO raises INC-00934 — LIFE-CRITICAL — three sources confirmed
08:47  All four agents delegated simultaneously
08:48  Emergency dispatch triggered — no approval needed
09:02  MHRA PV flag generated automatically
09:14  Review assigned to Priya Nair (post-action only)

WITHOUT NavECC → Courier arrives 7h late. Nurse reschedules quietly.
               → Arvion visibility: ZERO
WITH NavECC    → Exception raised at 08:47 — before nurse even noticed.
```
