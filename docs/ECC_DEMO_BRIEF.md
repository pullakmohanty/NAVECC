# NavECC — Demo Brief for Olga at ECC
*Prepared 30 Jun 2026 · Based on live review of navecc.vercel.app*

---

## Context

**Demo system:** NavECC — Navedas Intelligence
**Client scenario:** Arvion Biosciences UK, rare disease homecare delivery
**Demo audience:** Olga at ECC — assume supply chain / operations lead at a pharma company running NHS homecare pathways
**Demo URL:** https://navecc.vercel.app
**Password:** Nav@2026

NavECC monitors rare-disease drug deliveries across NHS homecare pathways (PNH, aHUS, HPP lines) and detects silent delivery delays — events where the courier is late, the infusion gets rescheduled, and NHS nurses absorb the disruption quietly, with no alert ever reaching the supply chain team. The system links three independent signals (courier GPS, homecare scheduling portal, nurse check-in) into a single structured delay event, attributes root cause, and surfaces it for human review before it becomes a patient disruption.

---

## Setup Wizard (3 steps)

When a new user logs in, they go through a 3-step setup before landing on the dashboard. This is a strong demo moment — walk Olga through it before going to the dashboard.

### Step 1 — Select use case

Four use cases shown. Only one is live:

| Use case | Status |
|----------|--------|
| Silent delivery delay detection | **Live** |
| NHS Workaround Quantification | Coming soon |
| Proactive Intervention | Coming soon |
| Attribution Model | Coming soon |

Agent stack for "Silent delivery delay detection": CPXO, Delivery Ops, Clinical Risk, Compliance, Engagement.

### Step 2 — Customise agents

Shows the CPXO Agent with an editable instruction:

> *"Monitor all active UK homecare deliveries for Ultomiris, Soliris, and Strensiq. Detect silent delivery delays before NHS staff absorb them. Flag exceptions at 4-hour SLA breach. Trigger MHRA pharmacovigilance flag at 6 hours for PNH patients."*

Configuration fields:
- **Heartbeat interval:** 30 seconds
- **Primary goal:** Zero silent delivery failures
- **Tools:** `exception.create`, `agents.assign`, `signal.read`

Four sub-agents shown (all Active, each with an Edit button):
- Delivery Ops Agent — Logistics & courier tracking
- Clinical Risk Agent — Patient safety & severity
- Compliance Agent — GDPR & pharma audit
- Engagement Agent — Alerts & comms

Activation log at the bottom shows agents coming online sequentially with timestamps — good demo moment, feels live.

### Step 3 — Review and launch

Configuration summary table (as currently shown in demo):

| Field | Value |
|-------|-------|
| Use case | Silent delivery delay detection |
| Agents active | 5 agents |
| CPXO heartbeat | Every 30 seconds |
| SLA threshold | 4 hours (PNH) |
| MHRA flag at | 6 hours (PNH) |
| Emergency dispatch | Fully automated ⚠️ |
| GDPR mode | Pseudonymise patient IDs |
| Human involvement | Post-action only ⚠️ |

> **Note for devs:** "Emergency dispatch: Fully automated" and "Human involvement: Post-action only" contradict the HITL-first governance narrative. Change "Fully automated" to "Policy-matched" and reconsider "Post-action only" as the default label. See issues section below.

---

## Live Pages — What Each Screen Shows

### Dashboard (`/`)

The landing page after setup. Shows the last 30 days of activity for Arvion Biosciences UK Homecare Ops.

**KPI tiles (top row):**
| Metric | Value | Delta |
|--------|-------|-------|
| Open delay events | 9 | +3 this week |
| Avg delivery delay | 4.8h | -0.9h improving |
| NHS staff hours lost | 42.5h | 17 events |
| Pending approvals | 3 | Action required |

**Delivery Performance Breakdown chart:**
- Baseline unattributed: 98.7% on-time
- Current period (last 30 days): 1.3% silent delay rate
- Segments: Courier/Traffic, Cold chain, Hospital receiving, Homecare scheduling, On-time (98.7%)

**Left panel — Operation:**
- Client: Arvion Biosciences
- Operations unit: UK Homecare Ops
- "Improve sensitivity" control
- Monitored drugs: Ultomiris 500mg (3 open), Soliris 300mg (1 open), Strensiq 80mg (1 open)
- NHS Regions: Midlands, London, NW England, South East, Yorkshire, South West

**Active Exceptions table (7 incidents shown):**
| ID | Drug | Route | Delay | Sources | Status |
|----|------|-------|-------|---------|--------|
| INC-00934 | Ultomiris 500mg | M6 · J7-J8 Birmingham | 7.2h | COURIER APPT NURSE | OPEN |
| INC-00928 | Soliris 300mg | Leeds Distribution Hub | 5.6h | COURIER APPT | IN REVIEW |
| INC-00921 | Strensiq 80mg | St Thomas' Hospital — Receiving Bay | 4.1h | COURIER NURSE | IN REVIEW |
| INC-00915 | Ultomiris 500mg | A14 · Cambridge to Ipswich | 3.8h | COURIER NURSE | OPEN |
| INC-00909 | Soliris 300mg | Bristol · Homecare Schedule Mismatch | 2.7h | COURIER | RESOLVED |
| INC-00903 | Ultomiris 500mg | M25 · J10-J12 Surrey | 6.9h | COURIER NURSE | OPEN |

**Right rail — Actions Awaiting Approval (3 items):**
1. CRITICAL · Acknowledge emergency dispatch — INC-00934 (DPD-7741882, M6 J7-J8 delay, PNH patient) — 12 min ago
2. HIGH · Confirm cold chain action taken — INC-00928 (Soliris 300mg, Leeds hub temp excursion, 5.6h delay) — 1.5h ago
3. HIGH · Confirm ward notification sent — INC-00921 (Strensiq 80mg, St Thomas' receiving bay, 4.3h delay) — 3h ago

**"Talk to CPXO Agent" FAB** — bottom right, opens an AI assistant chat.

---

### Incident Detail (`/incidents/INC-00934`)

The richest screen. Drill-down on one delay event.

**Header:**
- INC-00934 · CRITICAL · OPEN
- *Ultomiris 500mg delivery 7.2h late · infusion postponed 26 hours · Healthcare at Home*
- Patient ref: ARV-05934 (opaque token — no patient name/DOB) · Drug: Ultomiris 500mg · Pathway: Healthcare at Home · Detected: 25 Jun 2026 · 08:47 · Evidence: Confirmed

**Event summary (generated narrative):**
> "Ultomiris 500mg dispatched at 07:00 for a PNH patient scheduled for infusion at 10:00. DPD courier became stationary on the M6 near Junction 7–8 Birmingham at 07:43. Cell-signal tag detected no movement by 08:12. Homecare nurse check-in window opened at 08:31 with no confirmation received. Supply chain portal timestamp remained stale from 07:43. A weak email signal was automatically detected at 08:44, the homecare nurse sending 'still waiting'. CPXO raised exception INC-00934 at 08:47, before NHS staff were aware the delivery was late. Without NavECC, the courier would have arrived 7 hours late, the nurse would have quietly rescheduled, and Arvion would have seen only a late timestamp with zero context."

**Three-signal correlation grid:**
| Signal | Source | Event | Detail | Timestamp |
|--------|--------|-------|--------|-----------|
| COURIER · DPD | Delivery 7.2h late | M6 congestion: courier stationary near J7-J8 Birmingham for 7+ hours · courier ref DPD-7741882 | 25 Jun 2026 · 08:47 |
| APPT · Healthcare at Home | Infusion appointment rescheduled | Missed infusion window · 26h treatment postponed · patient on critical therapy | 25 Jun 2026 · 08:47 |
| NURSE · Healthcare at Home | Nurse visit rebooked | 3h 30m NHS rescheduling · no complaint filed · patient unaware of delay | 25 Jun 2026 · 08:47 |

**Incident fields:**
- Delay cause: M6 congestion — courier stationary for 7+ hours
- Treatment postponed: 26 hours
- NHS staff time lost: 3h 30m
- Patient complaint filed: None, patient was unaware
- Arvion visibility without NavECC: Zero, no signal received
- Proactive action: Detected post-delivery (Phase 1 scope)
- Pathway: Healthcare at Home
- Detected: 25 Jun 2026 · 08:47

**Process status (5-step):** Detected → Classified → Actioned → Review (current) → Closed

**Reasoning Ledger (right panel, append-only):**
- 09:14:00 SYSTEM — Review assigned to Sarah Mitchell
- 09:02:44 SYSTEM — MHRA audit entry generated — delay exceeds 6h threshold for Ultomiris (PNH)
- 08:47:31 SYSTEM — Root cause assigned — Courier / Traffic (M6 congestion)
- 08:47:14 SYSTEM — Exception INC-00934 created — three sources confirmed

**Case Review panel:**
- Human involvement — post-action only. Actions have already been executed.
- YOUR DECISION: Select decision (dropdown)
- ROOT CAUSE CLASSIFICATION: Accept — Courier / Traffic (dropdown)
- REVIEW NOTES: text area
- Buttons: Acknowledge action · Escalate · Save Draft

---

### Root Cause Analysis (`/root-cause`)

**Summary KPIs:**
| Metric | Value |
|--------|-------|
| Silent delay rate | 1.3% (17 of 1,307 deliveries) |
| Avg delay duration | 4.8h across all root causes |
| NHS hours absorbed | 42.5h staff time lost silently |
| Complaints filed | 0 — patients never reported |

**Delay attribution (donut chart):**
- Courier / Traffic: 0.8%
- Cold Chain: 0.2%
- Hospital Receiving: 0.2%
- Homecare Scheduling: 0.1%

**Four root cause cards:**

**Courier / Traffic — 0.8% · 9 events · avg 5.8h delay · Highest frequency**
- Description: Courier arrived outside delivery window — M6 and M25 congestion, road closures, handover delays between depots
- Affected incidents: INC-00934 (7.2h CRITICAL), INC-00915 (3.8h MEDIUM), INC-00903 (6.9h HIGH) + 5 more
- Detected via: COURIER GPS, PORTAL STALE, NURSE PING, EMAIL SIGNAL
- Fix: Pre-dispatch route alerts + backup courier SLA for M6/M25 corridor. Real-time GPS monitoring per delivery.
- NHS impact: 28.5h absorbed

**Cold Chain — 0.2% · 2 events · avg 8.7h delay · Longest delay**
- Description: Temperature excursion during transit triggers mandatory pharmacist verification hold before dispensing
- Affected incidents: INC-00928 (5.6h HIGH), INC-00781 (2.1h MEDIUM)
- Detected via: TEMP TAG, PORTAL STALE, COURIER GPS
- Fix: Real-time temperature threshold alerts before dispatch. Cold chain validation at hub. Automated pharmacist pre-notification.
- NHS impact: 8.5h absorbed

**Hospital Receiving — 0.2% · 2 events · avg 4.1h delay · NHS site issue**
- Description: Pharmacy receiving desk unavailable at delivery — shift change, short staffing, or documentation gap at NHS hospital sites
- Affected incidents: INC-00921 (4.1h HIGH), INC-00887 (4.6h HIGH)
- Detected via: DELIVERY LOGS, NURSE PING, PORTAL STALE
- Fix: Pre-notify pharmacy receiving desk 2h before courier arrival with ETA confirmation. Automated dock booking.
- NHS impact: 4.2h absorbed

**Homecare Scheduling — 0.1% · 1 event · avg 2.7h delay · Lowest impact**
- Description: Nurse unavailable to match revised delivery time — coordination gap between logistics ETA and homecare scheduling
- Affected incidents: INC-00909 (2.7h RESOLVED)
- Detected via: NURSE PING, EMAIL SIGNAL, PORTAL STALE
- Fix: Share logistics ETA with homecare portal in real time. Automated nurse availability check before dispatch.
- NHS impact: 1.3h absorbed

**Key insight:**
> Courier / Traffic alone accounts for 62% of all delay events. Fixing the M6 and M25 SLA closes the majority of the 1.3% gap immediately. Cold Chain causes the longest individual delays despite its low frequency — a single breach costs 8.7h on average.

**Priority actions:**
1. Enforce backup courier SLA — M6/M25 corridor
2. Deploy cold chain hub validation before dispatch
3. Integrate homecare ETA portal sync in real time

---

### Clinical Audit Log (`/audit-log`)

**Summary strip:**
| Total entries | Approved decisions | System analysis | Delay events covered |
|--------------|-------------------|-----------------|----------------------|
| 14 | 3 | 12 | 5 |

**Badge:** APPEND-ONLY · TAMPER-PROOF

**Filters:** All · Approvals · Root cause · Drug detection · Override

**Log entries (newest first):**

30 Jun 2026:
- 28:89:03 SYSTEM EVENT — Reasoning Ledger updated — scan cycle 1 appended
- 28:89:02 SYSTEM EVENT — CPXO heartbeat scan #1 — 9 exceptions active

25 Jun 2026:
- 09:14:00 SYSTEM REVIEW — Review assigned to Sarah Mitchell (INC-00934)
- 09:02:44 SYSTEM PV FLAG — MHRA audit entry generated — delay exceeds 6h threshold for Ultomiris (PNH)
- 08:47:31 SYSTEM ROOT CAUSE — Root cause assigned — Courier / Traffic (M6 congestion)
- 08:47:14 SYSTEM EVENT — Exception INC-00934 created — three sources confirmed

24 Jun 2026:
- 15:43:00 PHYSICIAN REVIEW — INC-00928 clinical review completed (cold chain excursion confirmed within range)
- 11:22:18 SYSTEM EVENT — Exception INC-00928 created — cold chain temperature excursion (Soliris 300mg, Leeds hub)

23 Jun 2026:
- 16:28:00 USER REVIEW — INC-00921 escalated to ward pharmacist — St Thomas'
- 14:85:33 SYSTEM EVENT — Exception INC-00921 created — hospital receiving bay unmanned

20 Jun 2026:
- 11:44:08 SYSTEM RESOLVED — INC-00909 resolved — homecare schedule mismatch corrected
- 08:14:22 SYSTEM EVENT — Exception INC-00909 created — homecare scheduling mismatch (Soliris 300mg)

18 Jun 2026:
- 13:17:08 SYSTEM ACTION — Emergency dispatch triggered — INC-00903 — no human approval ⚠️
- 07:58:11 SYSTEM EVENT — Exception INC-00903 created — M25 delay, no carrier alert

**Footer:** `Showing 14 of 14 ledger entries. No edit or delete operations permitted. SOC 2 · ISO 27001 · HIPAA · GDPR` ⚠️ (HIPAA should be UK GDPR · MHRA)

---

### Agent Monitor (`/agents`)

**Header:** Agent Monitor · CPXO orchestration · Silent Delivery Delay Detection · real-time status · LIVE

**CPXO Agent:**
- Role: Chief Patient Experience Officer — never executes directly
- Status: ACTIVE
- Last heartbeat: 1 min ago
- Current message: *"Monitoring 9 open exceptions across UK homecare"*

**Specialist agents (all ACTIVE):**

| Agent | Role | Last heartbeat | Current activity |
|-------|------|----------------|-----------------|
| Delivery Ops | Courier & logistics specialist | just now | Tracking INC-00934 courier — M6 route pending |
| Clinical Risk | Patient safety & severity scoring | just now | PNH threshold breach — INC-00934 exceeds 7h SLA |
| Compliance | Audit, GDPR & pharmacovigilance | just now | MHRA audit entry appended for INC-00934 |
| Engagement | Homecare & ops team alerts | just now | St Thomas pharmacist notification queued |

**Tool calls visible per agent** (READ/WRITE/ALERT WRITE/NOTIFY/SEND)

**Active data signals:**
- Cell-signal tags — 4 min ago
- Homecare check-ins — 12 min ago
- Delivery event logs — 1 min ago
- Supply chain portal — 8 min ago
- Email and order data — 22 min ago

**Activity log (center column):**
- 09:14:00 — Scan complete · 9 exceptions active
- 09:02:44 — MHRA flag generated · ledger updated
- 08:48:00 — Emergency dispatch confirmed · INC-00934
- 08:47:31 — Clinical Risk agent raised ALERT
- 08:47:14 — Exception INC-00934 escalated to CRITICAL

**Footer:** *"All actions are fully automated and policy-matched. Human involvement is post-action only. Review exceptions in the Audit Log."*

---

### How It Works (`/how-it-works`)

Technical walkthrough of agent execution. Left sidebar lists all agents + Reasoning Ledger. CPXO Agent selected by default.

**CPXO Agent — current task:**
- Active execution — heartbeat cycle #47
- Processing INC-00934 · LIFE-CRITICAL

**Execution steps (step 3/6 in progress):**
1. Wake on heartbeat — Cycle initiated · 09:14:00
2. Read Signal 1: Real-time logistics — DPD-7741882 stationary M6 J7-J8 · 7.2h
3. Read Signal 2: Treatment scheduling — ARV-05934 infusion window: MISSED (in progress)

**Tool calls this cycle:**
- READ `logistics.getCourierPosition(ARV-DEL-00934)` → stationary: true · 7.2h · M6 J7-J8 Birmingham
- READ `schedule.getInfusionWindow(ARV-05934)` → scheduled: 10:00 · MISSED · Ultomiris 500mg

**Goal ancestry:**
- COMPANY GOAL: Zero silent delivery failures in rare disease treatment pathways
  - DEPARTMENT GOAL: [↓]
    - CURRENT TASK: Resolve INC-00934 · Ultomiris 500mg · PNH · LIFE-CRITICAL

---

## Recommended Demo Flow for Olga

1. **Setup wizard** (Steps 1–3) — let Olga select the use case herself, shows product configurability
2. **Dashboard** — 30-second orient: KPIs, delivery chart, open incidents table, pending approvals
3. **INC-00934 incident detail** — click through from dashboard; walk the three-signal grid, read the event summary narrative aloud, show the Reasoning Ledger
4. **Root Cause Analysis** — show the attribution breakdown, read the Key insight box, walk one root cause card
5. **Audit Log** — briefly, for compliance signal; point out the MHRA PV flag entry

Skip or hold back for follow-up: Agent Monitor, How It Works (for technical buyers only).

**Total demo time: ~20 minutes.**

---

## Issues to Fix Before Showing Olga

### Critical

1. **"Emergency dispatch: Fully automated"** in Step 3 summary — change to "Policy-matched" or add clarifying text. Currently reads as zero human control.
2. **"Human involvement: Post-action only"** in Step 3 summary — this is baked into the launch config and reinforced across the product. If the governance story is HITL-first, this label needs to change to "Approval required" or similar.
3. **Audit log entry (18 Jun) — "no human approval"** — the INC-00903 entry explicitly says "Action executed immediately — policy-matched — no human approval required." Remove or reframe.
4. **Incident detail governance panel** — shows "Human involvement — post-action only. Actions have already been executed." Add at least one pending incident where the human approves before execution, so the approval flow is demonstrated live.
5. **HIPAA in audit log footer** — UK product, UK client. Replace with `SOC 2 · ISO 27001 · UK GDPR · MHRA`.

### High

6. **"LIFE-CRITICAL" severity label** — appears in How It Works while processing INC-00934. Patient filed no complaint and was unaware. Change to `CRITICAL` or `Priority 1`.
7. **Three "Coming soon" tabs** — de-emphasise visually or move roadmap items off the product chrome. Currently three of four nav tabs say "Coming soon" on every page.

### Nice to have

8. Standardise "Incidents" vs "delivery delay events" across all copy — pick one.
9. Add one-line framing note on Agent Monitor for non-technical viewers.
10. Step 2 activation log is a strong demo moment — make sure it always plays visibly when entering the step.

---

## Vocabulary Rules (apply across all demo copy)

### Use
- "Delivery delay event" or "Incident" — not "SilentClinicalDelay"
- "Root cause analysis" — standard pharma ops
- "Evidence level" — Confirmed / Probable / Possible
- "Homecare" — the delivery pathway
- "Infusion appointment" — what gets rescheduled
- "NHS staff hours" — the hidden cost metric
- "Clinical audit log" — the immutable record
- "Pending approval" — the human review queue
- "Estimated probability" — for system-calculated confidence scores
- "Automated analysis" — for system-generated findings

### Never use in UI copy
- "AI", "machine learning", "model", "intelligence"
- "HITL", "HITL-First"
- "SilentClinicalDelay", "correlation engine"
- "Compounding Intelligence", "Smart Policy Agent"
- "Within-Boundary Install"
- "Attribution Model", "Decision Gate", "Reasoning Ledger" (internal naming only)
- Marketing phrases: "before/after [product name]", "you decide"
- Date in page headings — dates belong in filter controls or footer timestamp

---

## Data in the Demo

**Client:** Arvion Biosciences UK
**Operations unit:** UK Homecare Operations
**Data as of:** 25 Jun 2026 · 09:14

**Monitored drugs:**
- Ultomiris 500mg (PNH indication)
- Soliris 300mg
- Strensiq 80mg (aHUS)

**NHS regions:** Midlands · London · NW England · South East · Yorkshire · South West

**Homecare provider shown:** Healthcare at Home

**Key incident IDs:** INC-00934 (hero, CRITICAL) · INC-00928 (cold chain, HIGH) · INC-00921 (hospital receiving, HIGH) · INC-00903 (M25, automated dispatch)

**Patient ref format:** ARV-05934 (opaque token — no name, DOB, or NHS number stored)

**Key supplier:** DPD UK (courier ref DPD-7741882)

**MHRA threshold:** 6 hours for PNH patients (Ultomiris)
**SLA threshold:** 4 hours
**CPXO heartbeat:** 30 seconds
