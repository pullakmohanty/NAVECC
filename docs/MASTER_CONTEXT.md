# NavECC — Navedas Intelligence Platform
## Claude Code Session Context

**Project:** NavECC — Navedas Intelligence Platform  
**Client:** Arvion Biosciences · UK Homecare Operations  
**Logged-in user:** Sarah Mitchell (supply chain lead)  
**Demo date:** Monday 29 June 2026  
**Demo audience:** Olga Potaptseva (ECC consultant) representing Alexion / AstraZeneca rare disease division  

---

## The Problem

Rare disease patients receive life-critical drugs (Ultomiris, Soliris, Strensiq) via NHS homecare nurses and hospitals. When deliveries are delayed, NHS staff quietly absorb the problem — rescheduling infusions, rebooking nurses — without ever formally reporting it to Arvion. The manufacturer sees a late timestamp but gets zero context. This is the **silent 1.3% failure rate**. It is completely invisible.

**NavECC makes it visible — before NHS staff absorb it.**

Use case name: **"Missed. Silent. Never Flagged."**  
Resolution line: **"No longer missed. No longer silent. Now flagged."**

Opening demo line:
> "98.7% on-time delivery looks like a strong story — until you ask what is happening inside the 1.3% and nobody can answer it."

Closing demo line:
> "Your courier has been stationary on the M6 for 7 hours. The homecare nurse has not confirmed. No one has called. No complaint has been filed. Arvion visibility without NavECC: Zero. This is what changes."

---

## Platform Architecture — Eight Layers

### Layer 0 — Use Case Scope
- **UC1: Silent Delivery Delay Detection** — Phase 1 LIVE — this is what we are building
- UC2: Regular Prescription Delivery — future demo, not built
- UC3: Prescription Refill Management — future demo, not built

### Layer 1 — Three Signal Types (feed into CPXO)
- **Signal 1 — Real-time logistics:** Cell-signal GPS temperature tags, DPD/DHL courier position, drug condition data
- **Signal 2 — Treatment scheduling:** Infusion window timing, clinical urgency score, patient treatment schedule
- **Signal 3 — Delivery status:** Supply chain portal (stale timestamp), homecare nurse check-in ping (no confirmation), email/order data (weak signal detection), delivery event logs (missed checkpoint)

### Layer 2 — CPXO Agent (top orchestrator)
Full name: **Chief Patient Experience Officer Agent**
- Wakes on heartbeat, reads all five active data signals
- Correlates three signal types
- Detects silent exception BEFORE NHS absorption
- Scores severity against clinical urgency
- Creates tasks and delegates to specialist agents
- **NEVER executes directly**
- Key principle: Detects before NHS staff absorb the delay and silence it forever

### Layer 3 — Four Specialist Agents
| Agent | Color | Role |
|-------|-------|------|
| Delivery Ops | Teal `#028090` | Detects courier delay, maps live position, confirms exception from logistics data |
| Clinical Risk | Coral `#E05C5C` | Assesses patient safety severity, flags life-critical PNH/aHUS/HPP threshold breaches, scores urgency |
| Compliance | Amber `#E8A838` | Logs exception to Reasoning Ledger, generates MHRA pharmacovigilance flag, GDPR-compliant audit prep |
| Engagement | Blue `#185FA5` | Drafts homecare nurse alerts, notifies Alexion ops team, queues pharmacy notifications |

### Layer 4 — Automated Action Engine (NO human gate)
Three severity tiers — fully automated:
- **LOW:** Monitor and log only
- **MEDIUM:** Expedite existing courier + alert team
- **LIFE-CRITICAL:** Emergency dispatch fires automatically — policy-matched — no approval needed — action executes immediately

### Layer 5 — Active Data Layer (five sources)
1. **Cell-signal temperature tags** — Live GPS courier position + drug temperature every few minutes
2. **Homecare digital check-ins** — Proactive nurse confirmation ping at expected delivery window — no response = exception
3. **Delivery event logs** — Every courier checkpoint scan logged — missed scan = earliest detection signal
4. **Supply chain portal** — Stale "in transit" timestamp with no update confirms delay is real not a tag glitch
5. **Email and order data** — Quiet nurse email "still waiting" — weak signal Navedas catches automatically

### Layer 6 — Reasoning Ledger (database)
- Architecture: **Append-only database** — shown as a **DATABASE CYLINDER symbol** (not a box — always rendered as SVG cylinder with two ellipses and a rect body)
- Contents: Every exception, every decision, every signal source, every action taken, every outcome, every timestamp
- Properties: Tamper-proof, GDPR-ready, regulator-facing, no manual logging needed
- Compliance: SOC 2, ISO 27001, HIPAA, GDPR
- Color: Purple `#3B3486`

### Layer 7 — Compliance and Audit Output
SOC 2 · ISO 27001 · HIPAA-ready · GDPR · Pharma regulator reports · OTD dashboard · MHRA pharmacovigilance flags

### Layer 8 — Human Governance (POST-ACTION ONLY)
- **CRITICAL:** Humans are NOT in the operational loop
- Human board reviews AFTER action executes
- Roles: Review ledger, update detection thresholds, sign off exception reports, governance oversight
- Always separated by a **dashed line** in all diagrams
- Label: **"Human involvement — post-action only"**

---

## Workflow — End to End (Nine Steps)

1. **Heartbeat fires** — CPXO agent wakes on schedule, new scan cycle begins
2. **CPXO reads all three signal types** — Real-time logistics + Treatment scheduling + Delivery status — all five data sources active
3. **Exception detected** — No complaint filed · no call made · signals converge · NHS absorption bypassed. If no exception: log clean heartbeat → sleep. If exception confirmed: continue.
4. **Exception classified by severity** — LOW / MEDIUM / LIFE-CRITICAL
5. **CPXO packages task and delegates** — Full goal ancestry attached. Patient ID · drug · delay duration · risk level · all four agents assigned simultaneously · parallel execution
6. **Four specialist agents run in parallel** — Delivery Ops maps courier · Clinical Risk assesses safety · Compliance logs exception · Engagement drafts alerts
7. **Automated action executes — NO HUMAN GATE** — Policy-matched · fires immediately
8. **Reasoning Ledger records everything** — DATABASE CYLINDER — append-only — Exception · severity · all signals · action taken · outcome · timestamp — Tamper-proof · regulator-ready
9. **Exception resolved** — Treatment continuity restored · Patient safe · OTD updated · Hidden disruption eliminated · Audit trail complete

*(Dashed separator)*

**Step 10 — Human post-action review:** Alexion ops reviews ledger · Updates detection thresholds · Signs off exception reports

---

## Six Screens to Build

### Screen 1 — Main Dashboard (`src/app/page.tsx`)
- Four KPI MetricCards: Open delay events (9, +3) · Avg delivery delay (4.8h, -0.9h) · NHS staff hours lost (42.5h, 17 events) · Pending approvals (3, red)
- Delay breakdown bar chart: dual stacked bar, baseline 98.7% vs attributed root causes
- Incidents table: 6 open incidents, clickable rows
- Approvals panel: 3 actions awaiting sign-off

### Screen 2 — Incident Detail (`src/app/incidents/[id]/page.tsx`)
- Hero incident: **INC-00934 CRITICAL**
- Header: urgency + status badges + full title
- Three DataSourceCards: COURIER / APPT / NURSE
- Event summary paragraph (italic, highlighted)
- Key fields: delay cause, treatment postponed, staff hours, complaint filed: None, **Arvion visibility: ZERO (red)**, proactive action possible
- NHS staff hours bar chart (Recharts horizontal)
- Clinical audit log: 4 entries for INC-00934 including MHRA PV FLAG with amber highlight
- Right panel: supply chain lead review form

### Screen 3 — Root Cause Analysis (`src/app/root-cause/page.tsx`)
- Tabs: Root Cause Analysis | Pending Approvals (3)
- Subtitle: Last 30 days · 17 delay events
- Drug filters: All / Ultomiris / Soliris / Strensiq
- Pathway filters: All / Homecare / NHS Hospital
- Large dual bar chart (Recharts)
- Four root cause cards 2×2 grid: Courier/Traffic 0.8% · Cold Chain 0.2% · Hospital Receiving 0.2% · Homecare Scheduling 0.1%

### Screen 4 — Clinical Audit Log (`src/app/audit-log/page.tsx`)
- Four KPI cards: Total entries (148) · Approved decisions (31) · System analysis entries (94) · Delay events covered (17)
- Filter tabs: All / Approvals / Root cause / Drug detection / Override
- Search bar + Export CSV button
- Chronological entries with date separators
- Actor badges: SYSTEM / PHYSICIAN / USER
- MHRA entry highlighted with amber left border
- Append-only indicator visible

### Screen 5 — Agent Monitor (`src/app/agents/page.tsx`)
- CPXO Agent hero card (full width, purple): Name + role, ACTIVE status + pulsing dot, Last heartbeat: 1 minute ago, signals active: 5/5
- Four specialist AgentCards in a row: Delivery Ops (teal) ACTIVE · Clinical Risk (coral) ALERT pulsing · Compliance (amber) ACTIVE · Engagement (blue) ACTIVE
- Signal feed panel (five data sources with last ping timestamps): Cell-signal tags 4 min ago · Homecare check-ins 12 min ago · Delivery event logs 1 min ago · Supply chain portal 8 min ago · Email and order data 22 min ago

### Screen 6 — How It Works (`src/app/how-it-works/page.tsx`)
- Three tabs: Architecture | Workflow | Use Case
- Each tab renders an SVG diagram matching the provided architecture/workflow diagrams
- Reasoning Ledger always rendered as DATABASE CYLINDER (SVG with two ellipses + rect body, purple)
- Each node clickable with tooltip
- Human governance always below dashed separator

---

## Design Language

### Colors (exact hex — no approximations)
```
Navy     #0D1B3E   sidebar, navbar backgrounds
Teal     #028090   active states, links, accents
Coral    #E05C5C   critical alerts
Amber    #E8A838   high / warning states
Green    #2D9E6A   resolved / success / on-time
Purple   #3B3486   CPXO agent / Reasoning Ledger
Blue     #185FA5   medium / engagement agent
Surface  #F4F7FA   page background
White    #FFFFFF   card backgrounds
Muted    #64748B   secondary text
Border   #E2E8F0   card borders
```

### Typography
- Page titles: 18px weight 500 `#0D1B3E`
- Section labels: 11px weight 500 uppercase letter-spacing `#64748B`
- Body: 13px weight 400 `#334155`
- Muted: 12px weight 400 `#64748B`
- IDs/codes: 12px monospace `#028090`
- Event summaries: 13px italic `#334155`

### Layout Shell
- **Navbar:** 48px fixed top, navy background. Left: "NavECC" bold white + separator + "Arvion Biosciences · UK Homecare Operations" muted. Right: red badge "N actions pending" + "Sarah Mitchell" text + navy circle "PN" avatar
- **Use case bar:** 40px below navbar, white background. Three pills: "Silent delivery delay detection" (solid teal border, teal text, green LIVE badge) · "Regular prescription delivery" (dashed grey, "coming soon") · "Prescription refill management" (dashed grey, "coming soon")
- **Sidebar:** 220px fixed left, navy background. Linear-style minimal nav. Active: teal left border + white text + subtle teal bg. Icons: Lucide React 16px. Links: Dashboard (LayoutDashboard) · Incidents (AlertCircle) · Root Cause (PieChart) · Audit Log (FileText) · Agent Monitor (Bot) · How It Works (Network)
- **Main content:** offset 220px left, 88px top, background `#F4F7FA`, padding 24px
- **Footer:** 32px fixed bottom, white. "Arvion Biosciences · UK Homecare Operations · Data as of 25 Jun 2026 · 09:14" — 11px muted text

### Components

**MetricCard** (Paperclip-style)
- White bg, 0.5px border `#E2E8F0`, radius 10px
- 11px uppercase muted label top
- 26px bold number in navy
- 12px delta row with trend arrow + color
- 3px colored bottom bar (progress/trend)
- Flat surface — zero shadows

**IncidentRow** (Paperclip IssueRow-style)
- Full-width table row, left urgency color dot, unread dot for new unseen
- Urgency badge + drug name + delay
- Data source pills: COURIER / APPT / NURSE
- Inline evidence level, status badge right-aligned
- Hover: subtle `#F8FFFE` tint
- Click: navigates to `/incidents/[id]`

**AgentCard** (Paperclip agent-style)
- White bg, border, radius-lg
- Agent name bold + role muted header
- Pulsing status dot (green=ACTIVE, red=ALERT)
- Last heartbeat timestamp muted small
- Current task in 13px italic grey
- Thin colored activity bar at bottom

**AuditRow** (Navedas.ai Reasoning Ledger-style)
- Timestamp left — monospace 11px muted
- Actor badge inline: SYSTEM grey / PHYSICIAN teal / USER blue
- Category tag · Bold title 13px · Description 12px muted
- Linked incident tags below
- MHRA/PV FLAG entries: amber left border
- Append-only — zero edit controls visible

**ActionItem** (Paperclip Inbox-style)
- Left severity indicator bar (red or amber)
- Category + severity badge · Bold title · Detail line muted
- Review button right-aligned · Time remaining pill

**DataSourceCard** (horizontal three-column)
- Source type pill top-left · Org label muted uppercase small
- Bold finding 14px · Detail paragraph 12px muted
- Timestamp bottom-right muted · Subtle teal top border per source type

**DATABASE CYLINDER** (Reasoning Ledger symbol)
- Rendered as proper SVG cylinder: two ellipses (top rim + bottom base) + rect body
- Purple fill `#3B3486`
- Label: "Reasoning ledger"
- Sublabel: "Append-only · tamper-proof · GDPR-ready · regulator-facing"

### Micro-interactions
- Pulsing animation on ALERT agent status dot
- Row hover teal tint on incident table
- Pending approval badge count updates
- Heartbeat timestamp updates every 60s
- New incident unread dot indicator

---

## Tech Stack

```
Framework:  Next.js 14 App Router
Language:   TypeScript (strict)
Styling:    Tailwind CSS
Charts:     Recharts
Icons:      Lucide React
Utilities:  clsx + tailwind-merge
Date:       date-fns
Data:       src/data/mockData.ts only (no backend, no API calls, no auth)
```

---

## Mock Data

### Incidents
| ID | Severity | Drug | Delay | Status | Root Cause | Sources |
|----|----------|------|-------|--------|-----------|---------|
| **INC-00934** | **CRITICAL** | Ultomiris 500mg | 7.2h | OPEN | Courier/Traffic | COURIER+APPT+NURSE |
| INC-00928 | HIGH | Soliris 300mg | 5.6h | IN REVIEW | Cold Chain | COURIER+APPT |
| INC-00921 | HIGH | Strensiq 80mg | 4.1h | IN REVIEW | Hospital Receiving | COURIER+NURSE |
| INC-00915 | MEDIUM | Ultomiris 500mg | 3.8h | OPEN | Courier/Traffic | COURIER+APPT+NURSE |
| INC-00909 | MEDIUM | Soliris 300mg | 2.7h | RESOLVED | Homecare Scheduling | COURIER |
| INC-00903 | HIGH | Ultomiris 500mg | 6.9h | OPEN | Courier/Traffic | COURIER+APPT+NURSE |

**INC-00934 is the hero incident** — M6 congestion near Birmingham · Treatment postponed 26 hours · Arvion visibility without NavECC: ZERO · MHRA PV flag generated

### Agents
| Agent | Status | Last seen | Current task |
|-------|--------|-----------|-------------|
| CPXO | ACTIVE | 1 min ago | Monitoring 9 open exceptions across UK homecare |
| Delivery Ops | ACTIVE | 1 min ago | Tracking INC-00934 courier — M6 route pending |
| Clinical Risk | **ALERT** | 1 min ago | PNH threshold breach — INC-00934 exceeds 7h SLA |
| Compliance | ACTIVE | 3 min ago | MHRA audit entry appended for INC-00934 |
| Engagement | ACTIVE | 5 min ago | St Thomas pharmacist notification queued |

### Audit Log Highlights
Most important entry (amber highlight):
- `2026-06-25 09:02:44` · SYSTEM · pharmacovigilance · **PV FLAG**
- Title: "MHRA audit entry generated — delay exceeds 6h threshold for Ultomiris (PNH)"

Other key entries:
- `08:47:14` — EVENT CREATED (three sources linked)
- `08:47:31` — ROOT CAUSE ASSIGNED (M6 congestion)
- `09:14:00` — REVIEW ASSIGNED to Sarah Mitchell

---

## Build Rules

1. Build one component at a time — confirm each before building next
2. Use **exact hex colors** from this file — no approximations
3. All data comes from `src/data/mockData.ts` only
4. No backend, no API calls, no auth
5. Desktop only — no mobile responsive needed
6. **Flat surfaces — zero gradients, zero shadows**
7. Reasoning Ledger = **DATABASE CYLINDER** always (SVG cylinder, never a box)
8. Human governance always below dashed separator, labelled "Human involvement — post-action only"
9. Emergency dispatch is always automated — no human gate, no approval step
10. **INC-00934 is the hero incident** — must be first row in the table, most detailed screen
11. **"Arvion visibility without NavECC: Zero"** must be highlighted in red on incident detail
12. **MHRA PV FLAG entry** must have amber left border in the audit log
13. Flat design — no shadows on any card or surface
