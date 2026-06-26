# Silent Delivery Delay Detection — Design

> **Status:** Phase 1 LIVE — active use case.  
> **Inspired by:** Navedas.ai (operator console aesthetic) + Paperclip.ai (Linear-style task manager)

---

## Color System (exact hex — no approximations)

```
Navy     #0D1B3E   sidebar, navbar, avatar backgrounds
Teal     #028090   active states, links, accents, Delivery Ops agent
Coral    #E05C5C   critical alerts, Clinical Risk agent
Amber    #E8A838   high/warning states, Compliance agent, MHRA flag border
Green    #2D9E6A   resolved / success / on-time / LIVE badge
Purple   #3B3486   CPXO agent, Reasoning Ledger, How It Works diagrams
Blue     #185FA5   medium severity, Engagement agent
Surface  #F4F7FA   page background
White    #FFFFFF   card backgrounds
Muted    #64748B   secondary text, labels
Border   #E2E8F0   card borders, dividers
Dark     #334155   body text
Navy2    #0D1B3E   page titles
```

---

## Typography

| Element | Size | Weight | Color |
|---------|------|--------|-------|
| Page title | 18px | 500 | `#0D1B3E` |
| Section label | 11px | 500 uppercase + letter-spacing | `#64748B` |
| Body text | 13px | 400 | `#334155` |
| Muted / secondary | 12px | 400 | `#64748B` |
| ID / code | 12px | 400 monospace | `#028090` |
| Event summary | 13px | 400 italic | `#334155` |
| MetricCard number | 26px | 700 | `#0D1B3E` |
| MetricCard delta | 12px | 400 | green or coral |

---

## Layout Shell

### Navbar — 48px fixed top
- Background: `#0D1B3E` (navy)
- Left: "NavECC" bold white · separator · "Arvion Biosciences · UK Homecare Operations" muted
- Right: red badge showing pending action count · "Priya Nair" text · navy circle "PN" avatar

### Use Case Bar — 40px, sits below navbar (top: 48px)
- Background: white · bottom border `#E2E8F0`
- Three pills:
  - **"Silent delivery delay detection"** — solid teal border `#028090`, teal text, green `LIVE` badge
  - **"Regular prescription delivery"** — dashed grey border, grey text, "Coming soon" badge
  - **"Prescription refill management"** — dashed grey border, grey text, "Coming soon" badge

### Sidebar — 220px fixed left
- Background: `#0D1B3E` (navy)
- Top: 88px (below navbar + use case bar)
- Linear-style minimal navigation
- Active link: teal left border 3px + white text + subtle teal background tint
- Hover: subtle teal background
- Icons: Lucide React 16px

| Link | Icon |
|------|------|
| Dashboard | `LayoutDashboard` |
| Incidents | `AlertCircle` |
| Root Cause | `PieChart` |
| Audit Log | `FileText` |
| Agent Monitor | `Bot` |
| How It Works | `Network` |

### Main Content Area
- Left offset: 220px
- Top offset: 88px (navbar 48px + use case bar 40px)
- Background: `#F4F7FA`
- Padding: 24px

### Footer — 32px fixed bottom
- Background: white · top border `#E2E8F0`
- Text: "Arvion Biosciences · UK Homecare Operations · Data as of 25 Jun 2026 · 09:14"
- Size: 11px · color: `#64748B`

---

## Components

### MetricCard
```
White background
Border: 0.5px solid #E2E8F0
Border radius: 10px
No shadows — flat surface

Top: 11px uppercase muted label (#64748B, letter-spacing)
Middle: 26px bold number (#0D1B3E)
Below number: 12px delta row — trend arrow + green/coral color
Bottom: 3px colored bar (progress/trend indicator)
```

### IncidentRow
```
Full-width table row
Left: urgency color dot (coral=CRITICAL, coral=HIGH, amber=MEDIUM, green=RESOLVED)
Left: unread indicator dot for new unseen incidents
Columns: ID (monospace teal) · drug name · delay badge · source pills · evidence · status badge
Hover: subtle #F8FFFE tint
Click: navigate to /incidents/[id]
Source pills: "COURIER" "APPT" "NURSE" — small rounded badges
```

### AgentCard
```
White background, border #E2E8F0, border-radius lg
Header: agent name bold + role muted (13px)
Status row: pulsing dot (green=ACTIVE, red=ALERT) + "ACTIVE"/"ALERT" text
Last heartbeat: muted small timestamp
Current task: 13px italic grey
Bottom: thin 3px colored activity bar matching agent color
```

### AuditRow
```
Timestamp: left-aligned, 11px monospace, muted
Actor badge inline: SYSTEM (grey) / PHYSICIAN (teal) / USER (blue)
Category tag: small pill
Title: 13px bold #0D1B3E
Description: 12px muted
Linked incident tag below (if applicable)
MHRA/PV FLAG rows: amber left border 3px (#E8A838)
Zero edit controls visible — append-only feel
```

### ActionItem
```
Left severity indicator bar: 4px (red=CRITICAL, amber=HIGH)
Category pill + severity badge
Bold title 14px
Detail line 12px muted
Right: "Review" button (teal outline) + time remaining pill
```

### DataSourceCard
```
Source type pill top-left (COURIER / APPT / NURSE)
Org label: 11px uppercase muted
Bold finding: 14px #0D1B3E
Detail paragraph: 12px muted
Timestamp: bottom-right 11px muted
Top border: 3px teal (#028090)
```

### DatabaseCylinder (Reasoning Ledger)
```
Always SVG — never a box or rectangle
Structure:
  - Bottom ellipse (base)
  - Rectangle body connecting top and bottom
  - Top ellipse (rim, slightly lighter)
Fill: #3B3486 (purple)
Label below: "Reasoning ledger" 14px bold white
Sublabel: "Append-only · tamper-proof · GDPR-ready · regulator-facing" 12px muted
Used in: How It Works Architecture tab, Workflow tab, Use Case tab
```

---

## Micro-interactions

- **Pulsing dot** on Clinical Risk agent (ALERT state) — CSS pulse animation, red `#E05C5C`
- **Row hover** on incident table — teal tint `#F8FFFE` transition
- **Pending badge** on navbar — red count badge, updates on navigation
- **Heartbeat timestamp** — shows "X min ago" relative to page load
- **Unread dot** — blue dot on unseen incident rows

---

## Design Principles

1. **Flat surfaces** — zero gradients, zero shadows on any element
2. **Operator console** — dense data but structured, deliberate whitespace
3. **Append-only feel** — no edit/delete controls visible anywhere in audit views
4. **Goal ancestry** — every task/incident shows where it came from
5. **Human governance always last** — always below the dashed separator line, always labelled "post-action only"
6. **DATABASE CYLINDER** — Reasoning Ledger is never drawn as a box, always the SVG cylinder symbol
