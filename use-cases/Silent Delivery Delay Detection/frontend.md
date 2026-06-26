# Silent Delivery Delay Detection — Frontend

> **Status:** Phase 1 LIVE — active use case.  
> **Stack:** Next.js 14 App Router · TypeScript · Tailwind CSS · Recharts · Lucide React

---

## Routes

| Route | File | Screen |
|-------|------|--------|
| `/` | `src/app/page.tsx` | Dashboard |
| `/incidents/[id]` | `src/app/incidents/[id]/page.tsx` | Incident Detail |
| `/root-cause` | `src/app/root-cause/page.tsx` | Root Cause Analysis |
| `/audit-log` | `src/app/audit-log/page.tsx` | Clinical Audit Log |
| `/agents` | `src/app/agents/page.tsx` | Agent Monitor |
| `/how-it-works` | `src/app/how-it-works/page.tsx` | How It Works |

---

## Screen 1 — Dashboard (`/`)

**KPI MetricCards (4 cards):**
- Open delay events: **9** · delta +3 · red bottom bar
- Avg delivery delay: **4.8h** · delta -0.9h improving · green bottom bar
- NHS staff hours lost: **42.5h** · 17 events · amber bottom bar
- Pending approvals: **3** · red badge · red bottom bar

**Delay breakdown chart (Recharts dual stacked bar):**
- Baseline: 98.7% on-time vs 1.3% delayed
- Attributed root causes: Courier/Traffic 0.8% · Cold Chain 0.2% · Hospital Receiving 0.2% · Homecare Scheduling 0.1%

**Incidents table (6 rows, clickable):**
- INC-00934 first — CRITICAL — hero incident
- Columns: urgency dot · unread dot · ID · drug · delay · sources pills · evidence · status badge
- Row click → `/incidents/[id]`

**Approvals panel (3 items):**
- ActionItem components with red/amber left bar, Review button, time remaining pill

---

## Screen 2 — Incident Detail (`/incidents/[id]`)

**Hero incident: INC-00934**

**Header:**
- CRITICAL badge (coral) + OPEN badge + "Ultomiris 500mg — M6 Delivery Delay — INC-00934"

**Three DataSourceCards (horizontal row):**
- COURIER: DPD-7741882 · Stationary 7h on M6 J7–J8 Birmingham
- APPT: Infusion window 10:00–12:00 · missed · PNH urgency HIGH
- NURSE: Healthcare at Home · no check-in confirmation received

**Event summary (italic paragraph, highlighted background):**
- Full narrative of the M6 scenario

**Key fields:**
- Delay cause: M6 congestion
- Treatment postponed: 26 hours
- NHS staff hours lost: value
- Complaint filed: **None**
- Arvion visibility without NavECC: **ZERO** ← red highlight, prominent
- Proactive action possible: Yes

**NHS staff hours bar chart (Recharts horizontal bar)**

**Clinical audit log (4 entries for INC-00934):**
- `08:47:14` SYSTEM · EVENT CREATED
- `08:47:31` SYSTEM · ROOT CAUSE ASSIGNED
- `09:02:44` SYSTEM · **PV FLAG** ← amber left border (MHRA entry)
- `09:14:00` SYSTEM · REVIEW ASSIGNED

**Right panel:**
- Supply chain lead review form (Priya Nair)

---

## Screen 3 — Root Cause Analysis (`/root-cause`)

**Tabs:** Root Cause Analysis | Pending Approvals (3)

**Filters:**
- Drug: All / Ultomiris / Soliris / Strensiq
- Pathway: All / Homecare / NHS Hospital

**Recharts dual bar chart** — 30 days · 17 delay events

**Root cause cards (2×2 grid):**
| Root Cause | Rate | Events | Avg Delay |
|-----------|------|--------|-----------|
| Courier/Traffic | 0.8% | 9 | 5.8h |
| Cold Chain | 0.2% | 2 | 8.7h |
| Hospital Receiving | 0.2% | 2 | 4.1h |
| Homecare Scheduling | 0.1% | 1 | 2.7h |

Each card: percentage · event count · description · "Fix" link in teal

---

## Screen 4 — Clinical Audit Log (`/audit-log`)

**KPI cards (4):**
- Total entries: 148
- Approved decisions: 31
- System analysis entries: 94
- Delay events covered: 17

**Filter tabs:** All · Approvals · Root cause · Drug detection · Override

**Search bar + Export CSV button**

**Chronological AuditRow entries** with date separators:
- Actor badges: SYSTEM (grey) / PHYSICIAN (teal) / USER (blue)
- MHRA PV FLAG entry: amber left border — `09:02:44` · "MHRA audit entry generated — delay exceeds 6h threshold for Ultomiris (PNH)"
- Append-only indicator — no edit controls visible anywhere

---

## Screen 5 — Agent Monitor (`/agents`)

**CPXO hero card (full width, purple `#3B3486`):**
- "Chief Patient Experience Officer Agent"
- Status: ACTIVE · pulsing green dot
- Last heartbeat: 1 minute ago
- Current task: "Monitoring 9 open exceptions across UK homecare"
- Signals active: 5/5

**Four specialist AgentCards (row):**
| Agent | Colour | Status | Task |
|-------|--------|--------|------|
| Delivery Ops | teal | ACTIVE | Tracking INC-00934 courier — M6 route pending |
| Clinical Risk | coral | **ALERT** (pulsing red) | PNH threshold breach — INC-00934 exceeds 7h SLA |
| Compliance | amber | ACTIVE | MHRA audit entry appended for INC-00934 |
| Engagement | blue | ACTIVE | St Thomas pharmacist notification queued |

**Signal feed panel (five sources):**
- Cell-signal tags · 4 min ago · LIVE
- Homecare check-ins · 12 min ago · LIVE
- Delivery event logs · 1 min ago · LIVE
- Supply chain portal · 8 min ago · LIVE
- Email and order data · 22 min ago · LIVE

---

## Screen 6 — How It Works (`/how-it-works`)

**Three tabs:** Architecture | Workflow | Use Case

**Tab 1 — Architecture:**
- SVG diagram — 8 layers top to bottom
- Use case scope (3 boxes at top, UC1 active, UC2/UC3 dashed)
- Three signal input boxes
- CPXO agent (full-width purple)
- Four specialist agent boxes
- Automated action engine (coral)
- Five active data source boxes
- Reasoning Ledger as DATABASE CYLINDER (purple SVG cylinder)
- Compliance output (teal)
- Dashed separator
- Human governance (grey dashed) — "Human involvement — post-action only"
- Each node clickable with tooltip

**Tab 2 — Workflow:**
- SVG flowchart — 9 steps
- Heartbeat → signals → CPXO detection → severity tiers → parallel agents → automated action → DATABASE CYLINDER → resolution
- "No issue → sleep" loop back arrow
- Dashed separator before human post-action review

**Tab 3 — Use Case:**
- SVG implementation diagram
- "Silent Delivery Delay Detection" title
- Three signal columns with sub-sources
- NHS absorption layer (dashed, bypassed)
- CPXO detection engine (purple)
- Three severity tiers
- DATABASE CYLINDER
- Three outcome boxes
- Dashed separator + human post-action review

---

## Component Map

```
src/
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Footer.tsx
│   │   └── UseCaseBar.tsx
│   ├── ui/
│   │   ├── MetricCard.tsx
│   │   ├── IncidentRow.tsx
│   │   ├── AgentCard.tsx
│   │   ├── AuditRow.tsx
│   │   ├── ActionItem.tsx
│   │   ├── DataSourceCard.tsx
│   │   └── DatabaseCylinder.tsx   ← SVG cylinder, always used for Reasoning Ledger
│   └── charts/
│       ├── DelayBreakdownChart.tsx
│       ├── RootCauseChart.tsx
│       └── StaffHoursChart.tsx
├── data/
│   └── mockData.ts                ← single source of truth for all data
└── app/
    ├── page.tsx
    ├── incidents/[id]/page.tsx
    ├── root-cause/page.tsx
    ├── audit-log/page.tsx
    ├── agents/page.tsx
    └── how-it-works/page.tsx
```

---

## Data Flow

```
src/data/mockData.ts
        │
        ├── incidents[]        → Dashboard table, Incident Detail
        ├── agents[]           → Agent Monitor
        ├── auditLog[]         → Audit Log, Incident Detail (filtered)
        ├── dataSources[]      → Agent Monitor signal feed
        ├── kpi{}              → Dashboard MetricCards
        └── rootCauses[]       → Root Cause Analysis
```

All components are read-only. No state mutations. No API calls. No auth.
