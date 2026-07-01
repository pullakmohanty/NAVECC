# Agent HITL Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure agents into Input → Processing → Output, with a per-action Human-in-the-Loop mode that live-drives incident governance across the app.

**Architecture:** Agent config is the single source of truth (React context, already app-wide). A pure selector `governanceFor(incident, profiles, decisions)` derives each incident's governance state from the responsible action's current HITL mode plus any in-session human decision. The incident Case Review, dashboard approvals queue, and Pending-approvals KPI all read the selector — flipping a mode re-flows everything reactively.

**Tech Stack:** Next.js 16 (App Router, Turbopack), React 19, TypeScript, inline-styled components, Vitest (added for pure-logic tests only).

## Global Constraints

- Next.js 16.2.9 / React 19 — App Router, client components use `"use client"`.
- No real network calls: "Test connection" is mocked; auth secrets are display-only strings.
- Persistence is in-session React context only (resets on reload) — matches existing app.
- Copy rules (demo brief): no "AI/ML/model/intelligence" (except brand "Navedas Intelligence"); use hyphens not em-dashes; NHS palette (blue `#005EB8`, black `#212B32`, red `#DA291C`, amber `#FFB81C`/text `#8A6500`, grey `#768692`).
- `AgentProfilesProvider` already wraps root in `app/layout.tsx` — do not re-add.
- Verify UI tasks with `npm run build` (must pass, TS clean) — do NOT run `next build` while `next dev` is live (stop dev or rely on the reviewer's browser); UI behavior verified in browser.

---

## File Structure

- `data/agentProfiles.ts` (MODIFY) — new types (`HitlMode`, `AuthMethod`, `DataSource`, `Action`, `Output`), extended `AgentProfile`, migrated seed data with modes/endpoints/auth.
- `data/mockData.ts` (MODIFY) — add `responsibleAgentId` + `responsibleActionId` to `Incident` + seed values.
- `lib/governance.ts` (NEW) — `GovState`, `governanceFor()`, `deriveQueue()` pure selectors.
- `lib/governance.test.ts` (NEW) — Vitest unit tests for the selector.
- `lib/GovernanceDecisionsContext.tsx` (NEW) — in-session store of human decisions (approve/reject/ack) per incident.
- `lib/AgentProfilesContext.tsx` (MODIFY) — type only follows `AgentProfile` change (no logic change).
- `app/layout.tsx` (MODIFY) — wrap children in `GovernanceDecisionsProvider`.
- `components/ui/AgentPanel.tsx` (REWRITE) — Input/Processing/Output, wider, auth expanders, per-action HITL dropdowns.
- `app/incidents/[id]/page.tsx` (MODIFY) — Case Review derives from `governanceFor`; add Approve-before held state + Approval step; wire decisions.
- `app/page.tsx` (MODIFY) — dashboard "Actions Awaiting Approval" + Pending-approvals KPI derive from `deriveQueue`.
- `vitest.config.ts` (NEW), `package.json` (MODIFY) — Vitest wiring.

---

## Task 1: Type foundation + data-model migration

**Files:**
- Modify: `data/agentProfiles.ts` (types + interface + all seed profiles)
- Modify: `data/mockData.ts` (Incident interface + incident seed values)

**Interfaces:**
- Produces:
  - `type HitlMode = "auto" | "approve" | "review"`
  - `type AuthMethod = "apikey" | "oauth2" | "mtls" | "jwt"`
  - `interface DataSource { id: string; label: string; endpoint: string; authMethod: AuthMethod; authConfig: Record<string,string>; status: "connected" | "disconnected" }`
  - `interface Action { id: string; label: string; hitlMode: HitlMode }`
  - `interface Output { id: string; label: string; endpoint?: string }`
  - `AgentProfile` now has `inputs: DataSource[]`, `actions: Action[]`, `outputs: Output[]` (replacing `inputs: string[]`, `tools: string[]`, `outputs: string[]`).
  - `Incident` gains `responsibleAgentId: string; responsibleActionId: string`.

- [ ] **Step 1: Replace the type block + `AgentProfile` interface at the top of `data/agentProfiles.ts`**

```ts
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
```

- [ ] **Step 2: Migrate every profile's `inputs`, `tools`→`actions`, `outputs` to the new shapes**

For each of the 5 profiles (`cpxo`, `delivery-ops`, `clinical-risk`, `compliance`, `engagement`), convert the string arrays. Example for `delivery-ops` (apply the same pattern to all; keep existing labels as the `label` values):

```ts
inputs: [
  { id: "gps",    label: "Cell-signal GPS courier position", endpoint: "https://api.dpd.co.uk/v2/telemetry/position", authMethod: "mtls",   authConfig: { keyId: "dpd-mtls-01", ca: "NHS Root CA" }, status: "connected" },
  { id: "eventlog", label: "Courier event log checkpoints",  endpoint: "https://api.dpd.co.uk/v2/events",            authMethod: "apikey", authConfig: { keyName: "x-api-key", keyValue: "••••••••" }, status: "connected" },
  { id: "portal", label: "Supply chain portal delivery status", endpoint: "https://portal.arvion.uk/api/deliveries", authMethod: "oauth2", authConfig: { tokenUrl: "https://portal.arvion.uk/oauth/token", clientId: "navecc-delivery", scope: "deliveries.read" }, status: "connected" },
  { id: "traffic", label: "Route and traffic data",          endpoint: "https://api.trafficengland.com/v1/incidents", authMethod: "apikey", authConfig: { keyName: "apikey", keyValue: "••••••••" }, status: "disconnected" },
],
actions: [
  { id: "routes.getAlternates", label: "routes.getAlternates", hitlMode: "auto" },
  { id: "eta.compute",          label: "eta.compute",          hitlMode: "auto" },
  { id: "emergency.dispatch",   label: "emergency.dispatch",   hitlMode: "review" },
  { id: "report.create",        label: "report.create",        hitlMode: "auto" },
],
outputs: [
  { id: "delayreport", label: "Confirmed courier delay report", endpoint: "https://portal.arvion.uk/api/exceptions" },
  { id: "etadelta",    label: "ETA delta calculation" },
  { id: "altroute",    label: "Alternative route recommendation" },
  { id: "dispatch",    label: "Emergency dispatch trigger" },
],
```

Apply defaults per the spec §7 for the other agents' `actions` hitlMode:
- `clinical-risk`: `severity.score` auto, `mhra.flag` auto, `escalate.critical` review
- `compliance`: `audit.write` auto, `pv.flag` auto, `coldchain.hold` review
- `engagement`: `ops.alert` auto, `pharmacist.notify` auto, `ward.notify` review
- `cpxo`: convert its `tools` (`exception.create`, `agents.assign`, `signal.read`) to actions, all `auto` (orchestrator never gates).

Give every agent's inputs/outputs the same structured treatment (reuse existing labels; pick sensible endpoint/auth: GPS/temperature → mtls, portals → oauth2, regulator/MHRA → jwt, misc → apikey; mark 1 input per agent `disconnected` for realism).

- [ ] **Step 3: Add responsible-action fields to `Incident` in `data/mockData.ts`**

In the `Incident` interface add:

```ts
  responsibleAgentId: string;
  responsibleActionId: string;
```

- [ ] **Step 4: Seed the responsible action on each incident**

Add to each incident object (map per spec §7):

```ts
// INC-00934, INC-00903:
responsibleAgentId: "delivery-ops", responsibleActionId: "emergency.dispatch",
// INC-00928, INC-00865:
responsibleAgentId: "compliance",   responsibleActionId: "coldchain.hold",
// INC-00921:
responsibleAgentId: "engagement",   responsibleActionId: "ward.notify",
// INC-00915 (monitoring, no action taken):
responsibleAgentId: "delivery-ops", responsibleActionId: "routes.getAlternates",
// INC-00909, INC-00881 (homecare):
responsibleAgentId: "engagement",   responsibleActionId: "ward.notify",
// INC-00897 (courier):
responsibleAgentId: "delivery-ops", responsibleActionId: "emergency.dispatch",
```

- [ ] **Step 5: Fix all now-broken references to `.tools` / string inputs/outputs**

Search and update consumers so the project type-checks:
- `app/setup/page.tsx` — `CPXO_TOOLS`, sub-agent tool chips: read `profile.actions.map(a => a.label)` or keep its own local list (it has `CPXO_TOOLS` constant — leave that literal, it's setup-only).
- `components/ui/AgentPanel.tsx` — will be rewritten in Task 5; for now change `profile.tools`→`profile.actions.map(a=>a.label)`, `profile.inputs`/`profile.outputs` map `.label`, so it compiles. (Full rewrite later.)
- Any other `.tools` usage: `grep -rn "\.tools" app components lib`.

- [ ] **Step 6: Verify type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add data/agentProfiles.ts data/mockData.ts app/setup/page.tsx components/ui/AgentPanel.tsx
git commit -m "feat(agents): structured inputs/actions/outputs + incident responsible-action"
```

---

## Task 2: `governanceFor` selector + Vitest

**Files:**
- Create: `lib/governance.ts`
- Create: `lib/governance.test.ts`
- Create: `vitest.config.ts`
- Modify: `package.json` (devDeps + `test` script)

**Interfaces:**
- Consumes: `HitlMode`, `Action`, `AgentProfile` (agentProfiles.ts); `Incident` (mockData.ts).
- Produces:
  - `type Decision = "approved" | "rejected" | "acked"`
  - `type GovState = "auto-executed" | "awaiting-approval" | "approved-executed" | "rejected" | "awaiting-ack" | "acknowledged"`
  - `function governanceFor(incident, profiles, decisions): { mode: HitlMode; state: GovState; label: string; inQueue: boolean }`
  - `function deriveQueue(incidents, profiles, decisions): Incident[]`

- [ ] **Step 1: Add Vitest deps + script**

Run:
```bash
npm i -D vitest@^2
```
Then in `package.json` `scripts` add: `"test": "vitest run"`.

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
export default defineConfig({ test: { environment: "node", include: ["lib/**/*.test.ts"] } });
```

- [ ] **Step 3: Write the failing test `lib/governance.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { governanceFor } from "./governance";
import type { AgentProfile } from "@/data/agentProfiles";
import type { Incident } from "@/data/mockData";

const profiles = {
  "delivery-ops": {
    id: "delivery-ops", actions: [{ id: "emergency.dispatch", label: "emergency.dispatch", hitlMode: "review" }],
  } as unknown as AgentProfile,
};
const inc = { id: "INC-1", responsibleAgentId: "delivery-ops", responsibleActionId: "emergency.dispatch" } as unknown as Incident;

describe("governanceFor", () => {
  it("auto mode -> auto-executed, not queued", () => {
    profiles["delivery-ops"].actions[0].hitlMode = "auto";
    const g = governanceFor(inc, profiles, {});
    expect(g.state).toBe("auto-executed");
    expect(g.inQueue).toBe(false);
  });
  it("approve mode, no decision -> awaiting-approval, queued", () => {
    profiles["delivery-ops"].actions[0].hitlMode = "approve";
    const g = governanceFor(inc, profiles, {});
    expect(g.state).toBe("awaiting-approval");
    expect(g.inQueue).toBe(true);
  });
  it("approve mode + approved decision -> approved-executed, not queued", () => {
    profiles["delivery-ops"].actions[0].hitlMode = "approve";
    const g = governanceFor(inc, profiles, { "INC-1": "approved" });
    expect(g.state).toBe("approved-executed");
    expect(g.inQueue).toBe(false);
  });
  it("review mode, no decision -> awaiting-ack, queued", () => {
    profiles["delivery-ops"].actions[0].hitlMode = "review";
    const g = governanceFor(inc, profiles, {});
    expect(g.state).toBe("awaiting-ack");
    expect(g.inQueue).toBe(true);
  });
  it("review mode + acked -> acknowledged, not queued", () => {
    profiles["delivery-ops"].actions[0].hitlMode = "review";
    const g = governanceFor(inc, profiles, { "INC-1": "acked" });
    expect(g.state).toBe("acknowledged");
    expect(g.inQueue).toBe(false);
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — cannot find `./governance`.

- [ ] **Step 5: Implement `lib/governance.ts`**

```ts
import type { AgentProfile, HitlMode } from "@/data/agentProfiles";
import type { Incident } from "@/data/mockData";

export type Decision = "approved" | "rejected" | "acked";
export type GovState =
  | "auto-executed" | "awaiting-approval" | "approved-executed"
  | "rejected" | "awaiting-ack" | "acknowledged";

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
  if (mode === "auto") state = "auto-executed";
  else if (mode === "approve") {
    state = decision === "approved" ? "approved-executed"
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
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npm test`
Expected: PASS (5 passed).

- [ ] **Step 7: Commit**

```bash
git add lib/governance.ts lib/governance.test.ts vitest.config.ts package.json package-lock.json
git commit -m "feat(governance): governanceFor selector + deriveQueue with tests"
```

---

## Task 3: In-session decisions context

**Files:**
- Create: `lib/GovernanceDecisionsContext.tsx`
- Modify: `app/layout.tsx` (wrap children)

**Interfaces:**
- Consumes: `Decision` (governance.ts).
- Produces: `useGovernanceDecisions()` → `{ decisions: Record<string, Decision>; decide(incidentId: string, d: Decision): void; reset(incidentId: string): void }`.

- [ ] **Step 1: Create the context**

```tsx
"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import type { Decision } from "@/lib/governance";

interface Ctx {
  decisions: Record<string, Decision>;
  decide: (incidentId: string, d: Decision) => void;
  reset: (incidentId: string) => void;
}
const C = createContext<Ctx | null>(null);

export function GovernanceDecisionsProvider({ children }: { children: ReactNode }) {
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const decide = (id: string, d: Decision) => setDecisions(p => ({ ...p, [id]: d }));
  const reset  = (id: string) => setDecisions(p => { const n = { ...p }; delete n[id]; return n; });
  return <C.Provider value={{ decisions, decide, reset }}>{children}</C.Provider>;
}
export function useGovernanceDecisions() {
  const ctx = useContext(C);
  if (!ctx) throw new Error("useGovernanceDecisions must be used within GovernanceDecisionsProvider");
  return ctx;
}
```

- [ ] **Step 2: Wrap in `app/layout.tsx`** — nest inside the existing `AgentProfilesProvider`:

```tsx
<AgentProfilesProvider>
  <GovernanceDecisionsProvider>
    {children}
  </GovernanceDecisionsProvider>
</AgentProfilesProvider>
```
(add the import at top).

- [ ] **Step 3: Verify type-check** — `npx tsc --noEmit` → no errors.

- [ ] **Step 4: Commit**

```bash
git add lib/GovernanceDecisionsContext.tsx app/layout.tsx
git commit -m "feat(governance): in-session human-decision store"
```

---

## Task 4: Agent panel rewrite (Input → Processing → Output)

**Files:**
- Rewrite: `components/ui/AgentPanel.tsx`

**Interfaces:**
- Consumes: `useAgentProfiles()` (updated `AgentProfile` with `inputs: DataSource[]`, `actions: Action[]`, `outputs: Output[]`); types from `data/agentProfiles.ts`.
- Produces: the edit panel; `updateProfile(agentId, { inputs, actions, outputs, configuration })`.

- [ ] **Step 1: Widen the panel + state**

Change the slide-over width from `480` to `640` (add `maxWidth: "100vw"`). Replace edit state with:

```tsx
const [inputs,  setInputs]  = useState<DataSource[]>(() => profile ? structuredClone(profile.inputs)  : []);
const [actions, setActions] = useState<Action[]>(()     => profile ? structuredClone(profile.actions) : []);
const [outputs, setOutputs] = useState<Output[]>(()     => profile ? structuredClone(profile.outputs) : []);
const [editedConfig, setEditedConfig] = useState<Record<string,string>>(() =>
  profile ? Object.fromEntries(profile.configuration.map(f => [f.label, f.value])) : {});
```

`handleSave` passes `{ inputs, actions, outputs, configuration: [...] }` to `updateProfile`; `handleCancel` restores from `profile`.

- [ ] **Step 2: Inputs section — data-source cards with auth expander**

Render each `inputs[i]` as a card: status dot (`connected` → green `#007F3B`, else grey `#768692`), editable `label`, editable `endpoint`, `authMethod` `<select>` (API Key / OAuth 2.0 / mTLS / Signed JWT), a "Configure" toggle that expands method-specific `authConfig` fields, a mock "Test connection" button (sets `status: "connected"`), and a remove `×`. "+ Add data source" appends `{ id: crypto-free slug from label or index, label: "", endpoint: "", authMethod: "apikey", authConfig: {}, status: "disconnected" }`. (Generate ids as `src-${i}` on add; do not use Math.random.) Auth fields per method exactly as spec §5.

- [ ] **Step 3: Processing section — actions with HITL dropdown**

Render each `actions[i]`: editable `label` (mono font) + a `hitlMode` `<select>` with options Auto-execute / Approve before / Review after; show a small flag glyph when `hitlMode !== "auto"`. Remove `×`; "+ Add action" appends `{ id: \`action-${i}\`, label: "", hitlMode: "auto" }`. Below the list, a one-line legend.

- [ ] **Step 4: Outputs + Configuration**

Outputs: editable `label` (+ optional `endpoint`), add/remove. Configuration: keep existing editable key/value inputs.

- [ ] **Step 5: Verify build + browser**

Run: `npm run build` → passes.
Browser: open `/agents` → Delivery Ops → confirm Inputs cards (with auth expander + Test connection), Processing actions with mode dropdowns, editable Outputs/Config; Save persists; reopen shows saved values.

- [ ] **Step 6: Commit**

```bash
git add components/ui/AgentPanel.tsx
git commit -m "feat(agents): Input/Processing/Output panel with auth + per-action HITL"
```

---

## Task 5: Incident Case Review derives from governance

**Files:**
- Modify: `app/incidents/[id]/page.tsx`

**Interfaces:**
- Consumes: `governanceFor` (governance.ts), `useAgentProfiles()`, `useGovernanceDecisions()`.
- Produces: Case Review states driven by `gov.state`; approval/ack/reject buttons call `decide(id, …)`.

- [ ] **Step 1: Wire the selector**

In the component: `const { profiles } = useAgentProfiles(); const { decisions, decide } = useGovernanceDecisions(); const gov = incident ? governanceFor(incident, profiles, decisions) : null;`

- [ ] **Step 2: Replace `hasPendingApproval`/`hasAction`/`needsReview`/`isMonitoring` derivations**

Derive from `gov`:
- `awaitingApproval = gov?.state === "awaiting-approval"` (Approve-before, undecided)
- `awaitingAck = gov?.state === "awaiting-ack"`
- `executed = gov && ["auto-executed","approved-executed","acknowledged"].includes(gov.state)`
- `isMonitoring` stays for open incidents whose action mode implies no queued decision AND nothing executed — for `auto` that's `executed` (skip monitoring). Keep `isResolved` as-is.

- [ ] **Step 3: Process stepper by mode**

- `approve` + undecided: Detected✓ Classified✓ **Approval(active)** Actioned(pending) Closed.
- `approve` approved / `review` / `auto`: Actioned✓; Review active only when `awaitingAck`; Closed when `isResolved`.
Compute the `Actioned.done` as `gov?.state !== "awaiting-approval"` (held actions aren't actioned yet). Insert an "Approval" step label only for `approve` mode (conditionally build the steps array).

- [ ] **Step 4: Panel body by state**

- `awaitingApproval` → header "Approve before execution", show **Approve to execute** (calls `decide(id,"approved")`) and **Reject** (`decide(id,"rejected")`).
- `awaitingAck` → existing decision/acknowledge form; the acknowledge button calls `decide(id,"acked")` (keep the `/api/review` POST too if desired).
- `auto-executed`/`approved-executed`/`acknowledged` → read-only "Auto-executed"/"Executed after approval"/"Acknowledged" panel.
- `rejected` → read-only "Action rejected" panel.
- `isResolved` → existing Closed panel (unchanged).
Panel remains rendered for all incidents (keep Task-from-last-session ungating).

- [ ] **Step 5: Verify build + browser**

Run: `npm run build` → passes.
Browser: set Delivery Ops `emergency.dispatch` = Approve before → open INC-00934 → shows Approve/Reject + Approval step; click Approve → state → executed. Set = Review after → shows Acknowledge. Set = Auto → read-only auto-executed.

- [ ] **Step 6: Commit**

```bash
git add app/incidents/[id]/page.tsx
git commit -m "feat(incidents): Case Review derives from per-action HITL mode"
```

---

## Task 6: Dashboard queue + KPI derive from governance

**Files:**
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `deriveQueue`/`governanceFor` (governance.ts), `useAgentProfiles()`, `useGovernanceDecisions()`.

- [ ] **Step 1: Replace static `pendingApprovals` usage**

In the dashboard: `const { profiles } = useAgentProfiles(); const { decisions } = useGovernanceDecisions();` then `const queue = deriveQueue(allIncidents, profiles, decisions);` (fetch `allIncidents` from `/api/incidents` like the incident page, or reuse `filteredIncidents`). Render "Actions Awaiting Approval" from `queue`; each card's CTA label from `governanceFor(inc,…).label` ("Approve to execute" vs "Acknowledge action"); clicking routes to the incident.

- [ ] **Step 2: Derive the Pending-approvals KPI**

Replace the hardcoded `approvals` value in the metric strip with `queue.length` (keep the other KPIs). Keep the amber/red styling.

- [ ] **Step 3: Verify build + browser**

Run: `npm run build` → passes.
Browser: with `emergency.dispatch` = Approve before, dashboard shows INC-00934 + INC-00903 as "Approve to execute" and Pending-approvals count reflects the queue; flip to Auto → they drop and count decreases.

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "feat(dashboard): approvals queue + KPI derive from HITL governance"
```

---

## Self-Review

**Spec coverage:** §3 architecture → Tasks 2-3,5-6. §4 data model → Task 1. §5 panel → Task 4. §6 per-mode behavior → Tasks 5-6. §7 seed defaults → Task 1. §8 demo flow → verified in Tasks 5-6 steps. §9 phasing → task order. §10 out-of-scope respected (mock auth, session-only). §11 verification → each task's verify step + Task 2 unit tests. No gaps.

**Placeholders:** none — all code shown; auth-field lists point to spec §5 which enumerates them explicitly (repeated here would duplicate, but the exact fields are: apikey→keyName/keyValue; oauth2→tokenUrl/clientId/clientSecret/scope; mtls→clientCert/privateKey|keyId/ca; jwt→kid/privateKey/issuer/audience).

**Type consistency:** `HitlMode`/`AuthMethod`/`DataSource`/`Action`/`Output`/`AgentProfile` defined in Task 1, imported thereafter. `Decision`/`GovState`/`governanceFor`/`deriveQueue` defined Task 2, consumed Tasks 5-6. `useGovernanceDecisions` (Task 3) → `decide(id, "approved"|"rejected"|"acked")` matches `Decision`. Incident `responsibleAgentId`/`responsibleActionId` (Task 1) consumed by selector (Task 2). Consistent.
