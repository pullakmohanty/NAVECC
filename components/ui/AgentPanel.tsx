"use client";

import { useState, useEffect } from "react";
import { X, Network, Truck, HeartPulse, Shield, Bell, Flag } from "lucide-react";
import type { ElementType } from "react";
import { useAgentProfiles } from "@/lib/AgentProfilesContext";
import type { DataSource, Action, Output, AuthMethod, HitlMode } from "@/data/agentProfiles";

const AGENT_ICONS: Record<string, ElementType> = {
  "delivery-ops":  Truck,
  "clinical-risk": HeartPulse,
  "compliance":    Shield,
  "engagement":    Bell,
  "cpxo":          Network,
};

const AUTH_LABELS: Record<AuthMethod, string> = {
  apikey: "API Key",
  oauth2: "OAuth 2.0",
  mtls:   "mTLS",
  jwt:    "Signed JWT",
};

const AUTH_FIELDS: Record<AuthMethod, { key: string; label: string; secret?: boolean }[]> = {
  apikey: [{ key: "keyName", label: "Key name" }, { key: "keyValue", label: "Key value", secret: true }],
  oauth2: [{ key: "tokenUrl", label: "Token URL" }, { key: "clientId", label: "Client ID" }, { key: "clientSecret", label: "Client secret", secret: true }, { key: "scope", label: "Scope" }],
  mtls:   [{ key: "keyId", label: "Key ID" }, { key: "privateKey", label: "Private key", secret: true }, { key: "ca", label: "CA certificate" }],
  jwt:    [{ key: "kid", label: "Key ID (kid)" }, { key: "privateKey", label: "Private key", secret: true }, { key: "issuer", label: "Issuer" }, { key: "audience", label: "Audience" }],
};

const HITL_OPTS: { value: HitlMode; label: string }[] = [
  { value: "auto",    label: "Auto-execute" },
  { value: "approve", label: "Approve before" },
  { value: "review",  label: "Review after" },
];

interface AgentPanelProps {
  agentId: string | null;
  onClose: () => void;
}

export function AgentPanel({ agentId, onClose }: AgentPanelProps) {
  const { profiles, updateProfile } = useAgentProfiles();
  const profile = agentId ? profiles[agentId] : null;

  const [inputs,  setInputs]  = useState<DataSource[]>(() => (profile ? structuredClone(profile.inputs)  : []));
  const [actions, setActions] = useState<Action[]>(()     => (profile ? structuredClone(profile.actions) : []));
  const [outputs, setOutputs] = useState<Output[]>(()     => (profile ? structuredClone(profile.outputs) : []));
  const [editedConfig, setEditedConfig] = useState<Record<string, string>>(() =>
    profile ? Object.fromEntries(profile.configuration.map(f => [f.label, f.value])) : {}
  );
  const [expanded, setExpanded] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  if (!profile || !agentId) return null;

  const Icon = AGENT_ICONS[profile.id] ?? Network;
  const isAlert = profile.status === "ALERT";

  // ── Input helpers ──
  const patchInput = (i: number, patch: Partial<DataSource>) =>
    setInputs(prev => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  const patchAuth = (i: number, key: string, val: string) =>
    setInputs(prev => prev.map((s, idx) => (idx === i ? { ...s, authConfig: { ...s.authConfig, [key]: val } } : s)));
  const toggleExpand = (id: string) =>
    setExpanded(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));

  function handleSave() {
    if (!profile) return;
    updateProfile(agentId!, {
      inputs, actions, outputs,
      configuration: profile.configuration.map(f => ({ label: f.label, value: editedConfig[f.label] ?? f.value })),
    });
    setSaved(true);
    setTimeout(onClose, 900);
  }

  function handleCancel() {
    if (profile) {
      setInputs(structuredClone(profile.inputs));
      setActions(structuredClone(profile.actions));
      setOutputs(structuredClone(profile.outputs));
      setEditedConfig(Object.fromEntries(profile.configuration.map(f => [f.label, f.value])));
    }
    onClose();
  }

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 60 }} />
      <div
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0,
          width: 640, maxWidth: "100vw",
          backgroundColor: "#FFFFFF", zIndex: 61, overflowY: "auto",
          borderLeft: "0.5px solid #E2E8F0", display: "flex", flexDirection: "column",
        }}
      >
        {/* Header */}
        <div style={{
          height: 60, backgroundColor: isAlert ? "#FEF2F2" : "#E8F1FB",
          borderBottom: "0.5px solid #E2E8F0", display: "flex", alignItems: "center",
          justifyContent: "space-between", padding: "0 20px", position: "sticky", top: 0, flexShrink: 0, zIndex: 1,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Icon size={20} color={profile.color} />
            <span style={{ fontSize: 16, fontWeight: 600, color: "#0D1B3E" }}>{profile.name}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className="text-white" style={{ fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 10, backgroundColor: isAlert ? "#DA291C" : "#085040" }}>
              {profile.status}
            </span>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 0 }}>
              <X size={18} color="#64748B" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: 20, flex: 1 }}>

          {/* Overview */}
          <div style={{ marginBottom: 22 }}>
            <div style={sectionLabel}>Overview</div>
            <p style={{ fontSize: 13, color: "#334155", lineHeight: 1.6, margin: 0 }}>{profile.overview}</p>
          </div>

          {/* INPUTS - data sources */}
          <div style={{ marginBottom: 22 }}>
            <div style={sectionLabel}>Inputs · data sources</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {inputs.map((src, i) => {
                const open = expanded.includes(src.id);
                const connected = src.status === "connected";
                return (
                  <div key={src.id} style={{ border: "0.5px solid #E2E8F0", borderRadius: 8, padding: "10px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: connected ? "#007F3B" : "#768692", flexShrink: 0 }} />
                      <input value={src.label} placeholder="Data source name"
                        onChange={e => patchInput(i, { label: e.target.value })}
                        style={{ ...cellInput, flex: 1, fontWeight: 500 }} />
                      <button onClick={() => setInputs(prev => prev.filter((_, idx) => idx !== i))} aria-label="Remove data source"
                        style={removeBtn}>×</button>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input value={src.endpoint} placeholder="https://endpoint…"
                        onChange={e => patchInput(i, { endpoint: e.target.value })}
                        style={{ ...cellInput, flex: 1, fontFamily: "var(--font-geist-mono), monospace", fontSize: 11 }} />
                      <select value={src.authMethod} onChange={e => patchInput(i, { authMethod: e.target.value as AuthMethod })}
                        style={{ ...cellInput, width: 110, cursor: "pointer" }}>
                        {(Object.keys(AUTH_LABELS) as AuthMethod[]).map(m => <option key={m} value={m}>{AUTH_LABELS[m]}</option>)}
                      </select>
                    </div>
                    <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                      <button onClick={() => toggleExpand(src.id)} className="text-blue"
                        style={linkBtn}>{open ? "Hide config" : "Configure"}</button>
                      <button onClick={() => patchInput(i, { status: "connected" })} className="text-blue" style={linkBtn}>
                        Test connection
                      </button>
                      <span style={{ fontSize: 10, color: connected ? "#007F3B" : "#768692", alignSelf: "center" }}>
                        {connected ? "Connected" : "Disconnected"}
                      </span>
                    </div>
                    {open && (
                      <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        {AUTH_FIELDS[src.authMethod].map(f => (
                          <div key={f.key}>
                            <label style={fieldLabel}>{f.label}</label>
                            <input value={src.authConfig[f.key] ?? ""} type={f.secret ? "password" : "text"} placeholder={f.label}
                              onChange={e => patchAuth(i, f.key, e.target.value)} style={{ ...cellInput, width: "100%" }} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              <button onClick={() => setInputs(prev => [...prev, { id: `src-${prev.length}-${prev.reduce((a, s) => a + s.id.length, 0)}`, label: "", endpoint: "", authMethod: "apikey", authConfig: {}, status: "disconnected" }])}
                className="text-blue" style={addBtn}>+ Add data source</button>
            </div>
          </div>

          {/* PROCESSING - actions */}
          <div style={{ marginBottom: 22 }}>
            <div style={sectionLabel}>Processing · actions</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {actions.map((a, i) => (
                <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {a.hitlMode !== "auto"
                    ? <Flag size={12} color="#005EB8" style={{ flexShrink: 0 }} />
                    : <span style={{ width: 12, flexShrink: 0 }} />}
                  <input value={a.label} placeholder="action.name"
                    onChange={e => setActions(prev => prev.map((x, idx) => (idx === i ? { ...x, id: e.target.value || x.id, label: e.target.value } : x)))}
                    style={{ ...cellInput, flex: 1, fontFamily: "var(--font-geist-mono), monospace", fontSize: 11.5 }} />
                  <select value={a.hitlMode} onChange={e => setActions(prev => prev.map((x, idx) => (idx === i ? { ...x, hitlMode: e.target.value as HitlMode } : x)))}
                    style={{ ...cellInput, width: 130, cursor: "pointer" }}>
                    {HITL_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <button onClick={() => setActions(prev => prev.filter((_, idx) => idx !== i))} aria-label="Remove action" style={removeBtn}>×</button>
                </div>
              ))}
              <button onClick={() => setActions(prev => [...prev, { id: `action-${prev.length}`, label: "", hitlMode: "auto" }])}
                className="text-blue" style={addBtn}>+ Add action</button>
              <p style={{ fontSize: 10, color: "#768692", margin: "4px 0 0 0", lineHeight: 1.5 }}>
                Auto-execute · Approve before (held for human) · Review after (acts, then acknowledge)
              </p>
            </div>
          </div>

          {/* OUTPUTS */}
          <div style={{ marginBottom: 22 }}>
            <div style={sectionLabel}>Outputs</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {outputs.map((o, i) => (
                <div key={o.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "#94A3B8", fontSize: 12, flexShrink: 0 }}>•</span>
                  <input value={o.label} placeholder="Output name"
                    onChange={e => setOutputs(prev => prev.map((x, idx) => (idx === i ? { ...x, label: e.target.value } : x)))}
                    style={{ ...cellInput, flex: 1 }} />
                  <input value={o.endpoint ?? ""} placeholder="destination (optional)"
                    onChange={e => setOutputs(prev => prev.map((x, idx) => (idx === i ? { ...x, endpoint: e.target.value } : x)))}
                    style={{ ...cellInput, width: 190, fontFamily: "var(--font-geist-mono), monospace", fontSize: 11 }} />
                  <button onClick={() => setOutputs(prev => prev.filter((_, idx) => idx !== i))} aria-label="Remove output" style={removeBtn}>×</button>
                </div>
              ))}
              <button onClick={() => setOutputs(prev => [...prev, { id: `out-${prev.length}`, label: "" }])}
                className="text-blue" style={addBtn}>+ Add output</button>
            </div>
          </div>

          {/* CONFIGURATION */}
          <div style={{ marginBottom: 22 }}>
            <div style={sectionLabel}>Configuration</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {profile.configuration.map(field => (
                <div key={field.label}>
                  <label style={fieldLabel}>{field.label}</label>
                  <input type="text" value={editedConfig[field.label] ?? field.value}
                    onChange={e => setEditedConfig(prev => ({ ...prev, [field.label]: e.target.value }))}
                    style={{ ...cellInput, width: "100%" }} />
                </div>
              ))}
            </div>
          </div>

          {/* Current task */}
          <div style={{ marginBottom: 22 }}>
            <div style={sectionLabel}>Current task</div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: isAlert ? "#DA291C" : "#085040", marginTop: 4, flexShrink: 0 }} />
              <p style={{ fontSize: 12, fontStyle: "italic", color: "#334155", lineHeight: 1.5, margin: 0 }}>{profile.currentTask}</p>
            </div>
          </div>

          {/* Use cases */}
          <div>
            <div style={sectionLabel}>Common use cases</div>
            {profile.useCases.map((useCase, i) => (
              <div key={i} className="text-blue" style={{ fontSize: 12, marginBottom: 6, display: "flex", gap: 6 }}>
                <span>→</span><span>{useCase}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          position: "sticky", bottom: 0, backgroundColor: "#FFFFFF",
          borderTop: "0.5px solid #E2E8F0", padding: "12px 20px",
          display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0,
        }}>
          <span style={{ fontSize: 11, fontStyle: "italic", color: "#64748B" }}>
            {saved ? "✓ Changes saved" : "Changes apply immediately"}
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handleCancel} style={{ padding: "7px 14px", backgroundColor: "#fff", border: "0.5px solid #E2E8F0", borderRadius: 6, fontSize: 12, color: "#334155", cursor: "pointer" }}>
              Cancel
            </button>
            <button onClick={handleSave} className="text-white" style={{ padding: "7px 14px", backgroundColor: "#005EB8", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
              Save changes
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

const sectionLabel = {
  fontSize: 10, fontWeight: 600, color: "#64748B",
  textTransform: "uppercase" as const, letterSpacing: "0.05em", marginBottom: 10,
};
const fieldLabel = {
  fontSize: 11, color: "#64748B", fontWeight: 500 as const, display: "block", marginBottom: 4,
};
const cellInput = {
  boxSizing: "border-box" as const, padding: "6px 9px",
  border: "0.5px solid #E2E8F0", borderRadius: 6, fontSize: 12, color: "#334155", outline: "none",
};
const removeBtn = {
  background: "none", border: "none", cursor: "pointer",
  fontSize: 16, lineHeight: 1, padding: "0 2px", color: "#94A3B8", flexShrink: 0,
};
const addBtn = {
  alignSelf: "flex-start" as const, fontSize: 11, border: "0.5px dashed #005EB8",
  borderRadius: 6, padding: "5px 10px", background: "#fff", cursor: "pointer", color: "#005EB8", marginTop: 2,
};
const linkBtn = {
  background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: 11, color: "#005EB8",
};
