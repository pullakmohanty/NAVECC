import { describe, it, expect } from "vitest";
import { governanceFor } from "./governance";
import type { AgentProfile } from "@/data/agentProfiles";
import type { Incident } from "@/data/mockData";

const profiles: Record<string, AgentProfile> = {
  "delivery-ops": {
    id: "delivery-ops",
    actions: [{ id: "emergency.dispatch", label: "emergency.dispatch", hitlMode: "review" }],
  } as unknown as AgentProfile,
};
const inc = {
  id: "INC-1",
  responsibleAgentId: "delivery-ops",
  responsibleActionId: "emergency.dispatch",
} as unknown as Incident;

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
  it("approve mode + approved -> approved-executed, not queued", () => {
    profiles["delivery-ops"].actions[0].hitlMode = "approve";
    const g = governanceFor(inc, profiles, { "INC-1": "approved" });
    expect(g.state).toBe("approved-executed");
    expect(g.inQueue).toBe(false);
  });
  it("approve mode + rejected -> rejected, not queued", () => {
    profiles["delivery-ops"].actions[0].hitlMode = "approve";
    const g = governanceFor(inc, profiles, { "INC-1": "rejected" });
    expect(g.state).toBe("rejected");
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
