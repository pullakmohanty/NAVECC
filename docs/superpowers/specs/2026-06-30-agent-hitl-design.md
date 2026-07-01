# Agent Redesign — Input → Processing → Output with Human-in-the-Loop

*Design spec · 30 Jun 2026*

## 1. Goal

Restructure each NavECC agent around the canonical agent loop — **Input → Processing → Output** — and introduce a **Human-in-the-Loop (HITL)** control that lives inside Processing, configured **per action**. The control is both **structural** (the panel reads like a real agent) and **behavioral** (it is a live governance gate that re-flows incidents).

Two problems this solves:
- The current agent edit panel is an incoherent flat list (Overview · Inputs · Outputs · Tools · Configuration · …) where Inputs/Outputs are read-only, "Tools available" is unexplained dev jargon that overlaps Inputs/Outputs, and there is no "processing" concept.
- HITL exists only at the incident level today (Case Review). There is no way to configure the governance posture at the agent, and the brief's "HITL-first vs post-action" tension can't be demonstrated interactively.

## 2. Decisions (locked with stakeholder)

| Question | Decision |
|---|---|
| Intent | **Both** — structural reorg *and* a functional gate |
| Granularity | **Per-action** — each Action carries its own HITL mode |
| Incident linkage | **Fully live** — editing a mode re-flows every incident that uses that Action |
| Mode set | **Three** — Auto-execute · Approve before · Review after |
| Input auth | **NHS-aligned** — API Key · OAuth 2.0 · mTLS (keypair) · Signed JWT |
| Architecture | **A — derive-from-config** (single source of truth, reactive) |

## 3. Architecture — derive, don't duplicate

Agent configuration is the single source of truth. Incident governance state is **computed**, never stored redundantly.

- Each Action carries `hitlMode`.
- Each incident references the Action responsible for it (`responsibleAgentId` + `responsibleActionId`).
- A pure selector `governanceFor(incident, profiles)` returns the incident's governance state derived from that Action's **current** mode.
- The incident Case Review panel, the dashboard "Actions Awaiting Approval" queue, and the "Pending approvals" KPI all read the selector.
- Editing a mode in the agent panel updates `AgentProfilesContext` → every consumer re-derives reactively. No stale state, no imperative sync.

`AgentProfilesProvider` already wraps the app root (`app/layout.tsx`), so all pages can read agent config with no plumbing change.

## 4. Data model

```ts
type AuthMethod = "apikey" | "oauth2" | "mtls" | "jwt";

interface DataSource {          // was: inputs: string[]
  id: string;
  label: string;                // "Cell-signal GPS position"
  endpoint: string;             // "https://api.dpd…/gps" (may be "")
  authMethod: AuthMethod;
  authConfig: Record<string, string>;  // method-specific, secrets masked
  status: "connected" | "disconnected";
}

type HitlMode = "auto" | "approve" | "review";

interface Action {              // was: tools: string[]
  id: string;                   // "emergency.dispatch"
  label: string;                // "Emergency dispatch"
  hitlMode: HitlMode;
}

interface Output {              // was: outputs: string[]
  id: string;
  label: string;
  endpoint?: string;
}

// AgentProfile: inputs -> DataSource[]; tools -> actions: Action[]; outputs -> Output[]

interface Incident {
  // …existing…
  responsibleAgentId: string;   // "delivery-ops"
  responsibleActionId: string;  // "emergency.dispatch"
}
```

### Selector

```ts
type GovState = "auto-executed" | "awaiting-approval" | "awaiting-ack";

function governanceFor(incident, profiles): {
  mode: HitlMode;
  state: GovState;      // derived from mode (+ any local approve/ack the user has done)
  label: string;        // "Auto-executed" | "Approve to execute" | "Acknowledge action"
}
```

`state` maps from `mode`: `auto → auto-executed`, `approve → awaiting-approval`, `review → awaiting-ack`. A local, in-session decision (approve / acknowledge / reject) advances an incident past its awaiting state without mutating config.

## 5. Agent panel UI (widened slide-over)

Panel width **480px → ~640px** (responsive; caps at viewport width on small screens). Sections top-to-bottom:

1. **Header** — icon · name · status badge · close.
2. **Overview** — editable textarea.
3. **Inputs · data sources** — one card per source: status badge (Connected/Disconnected), `label`, `endpoint`, `authMethod` dropdown, **Configure** (expands auth fields per method), **Test connection** (mock → sets Connected). Add / edit / remove.
4. **Processing · actions** — one row per action: `label` + **HITL mode dropdown** (Auto-execute / Approve before / Review after). A flag icon marks any non-`auto` (gated) action. Legend below. Add / edit / remove.
5. **Outputs** — label (+ optional destination endpoint). Add / edit / remove.
6. **Configuration** — existing editable key/value fields (SLA threshold, trigger, …).
7. **Footer** — "Changes apply immediately" · Cancel · Save.

**Auth fields per method (Configure expander):**
- **API Key** — key name, key value (masked)
- **OAuth 2.0** — token URL, client ID, client secret (masked), scope
- **mTLS** — client cert, private key / Key ID ref (masked), CA cert
- **Signed JWT** — key ID (kid), private key (masked), issuer, audience

Everything on the panel is add/edit/remove editable; saving persists to `AgentProfilesContext`.

## 6. Incident-side behavior (per mode)

`governanceFor` drives three distinct presentations of the **same** incident:

| Mode | Execution / ledger | Case Review | Process stepper | Queue + KPI |
|---|---|---|---|---|
| **Auto-execute** | Fires immediately; ledger "policy-matched, no approval" | Read-only "Auto-executed" note | Detected → Classified → **Actioned ✓** → Closed | Not in queue; not counted |
| **Approve before** | **Held — not executed**; ledger "awaiting approval" | **Approve / Reject** (pre-execution) | Detected → Classified → **Approval (active)** → Actioned *(pending)* → Closed | In queue as "Approve to execute"; counted |
| **Review after** | Fires, then awaits ack; ledger "awaiting acknowledgement" | **Acknowledge / Escalate** | Detected → Classified → Actioned ✓ → **Review (active)** → Closed | In queue as "Acknowledge action"; counted |

The ACTION_TAKEN ledger entry text becomes **mode-aware** (derived), so it never contradicts the current mode. Approving a held action appends an "executed after approval" entry; rejecting appends a "cancelled by reviewer" entry.

**New state introduced:** *Approve-before* adds a held-action state and an "Approval" step that precedes "Actioned" — the largest new piece.

## 7. Default configuration (seed data)

Action modes chosen so the app is coherent on load and resolves the brief's governance contradictions (e.g. issue #3, INC-00903's "no human approval"):

- **Delivery Ops** — `routes.getAlternates` auto · `eta.compute` auto · `emergency.dispatch` **review** · `report.create` auto
- **Clinical Risk** — `severity.score` auto · `mhra.flag` auto · `escalate.critical` **review**
- **Compliance** — `audit.write` auto · `pv.flag` auto · `coldchain.hold` **review**
- **Engagement** — `ops.alert` auto · `pharmacist.notify` auto · `ward.notify` **review**

Incident → responsible action:
- INC-00934, INC-00903 → Delivery Ops · `emergency.dispatch`
- INC-00928, INC-00865 → Compliance · `coldchain.hold`
- INC-00921 → Engagement · `ward.notify`
- INC-00915, INC-00909, INC-00881, INC-00897 → mapped to their root-cause's natural action (monitoring/auto where no action was taken)

Because 934 and 903 share `emergency.dispatch`, unifying them under one mode **fixes** the earlier 903 "no human approval" inconsistency automatically.

Input data sources get realistic NHS-style seed endpoints/auth (e.g. GPS via mTLS, homecare portal via OAuth 2.0, MHRA PV endpoint via Signed JWT), most `connected`.

## 8. The live demo flow

1. Open **Delivery Ops** → **Processing** → set `emergency.dispatch` from **review** → **Approve before** → Save.
2. Open **INC-00934**: dispatch now shows **held, awaiting pre-approval**; Case Review shows **Approve / Reject**; stepper shows the Approval step before Actioned.
3. Dashboard: INC-00934 (and INC-00903) appear as **"Approve to execute"**; Pending-approvals KPI ticks up.
4. Flip back to **Auto-execute** → both re-flow to auto-executed, leave the queue, KPI drops.

## 9. Scope / phasing

Buildable in layered order (each independently verifiable):
1. Data model migration (inputs/tools/outputs → structured; incident responsible-action fields; seed data).
2. `governanceFor` selector + unit-level checks.
3. Agent panel redesign (Input/Processing/Output, wider, auth expanders, HITL dropdowns).
4. Incident Case Review reads the selector; add the Approve-before held state + Approval step.
5. Dashboard queue + KPI read the selector. The current static `pendingApprovals` array and the hardcoded `FILTER_KPI.approvals` count are **replaced** by values derived from `governanceFor` across all incidents (approve-unapproved + review-unacked). The dashboard "Actions Awaiting Approval" cards render the derived queue with mode-appropriate CTAs ("Approve to execute" vs "Acknowledge action").

## 10. Out of scope (YAGNI)

- Real network calls / real auth — "Test connection" is mocked; secrets are display-only.
- Persistence beyond in-session React context (resets on reload, like today).
- Per-incident *override* of an action's mode — mode is per-action, applied uniformly to all incidents using it (this is the point of "fully live").
- CPXO orchestrator gets the same panel shell but has no gated actions (it "never executes directly").

## 11. Verification

- Flipping each mode on `emergency.dispatch` produces the three documented Case Review states on INC-00934 and INC-00903.
- Dashboard queue count and Pending-approvals KPI match the number of incidents whose responsible action is `approve`(unapproved) or `review`(unacked).
- Auto-execute incidents never appear in the queue.
- Editing/adding/removing an input, action, or output persists and re-renders; Cancel restores.
- `npm run build` passes (TypeScript clean).
