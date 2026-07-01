"use client";

import { useState, useEffect } from "react";
import { X, Network, Truck, HeartPulse, Shield, Bell } from "lucide-react";
import type { ElementType } from "react";
import { useAgentProfiles } from "@/lib/AgentProfilesContext";

const AGENT_ICONS: Record<string, ElementType> = {
  "delivery-ops":  Truck,
  "clinical-risk": HeartPulse,
  "compliance":    Shield,
  "engagement":    Bell,
  "cpxo":          Network,
};

interface AgentPanelProps {
  agentId: string | null;
  onClose: () => void;
}

export function AgentPanel({ agentId, onClose }: AgentPanelProps) {
  const { profiles, updateProfile } = useAgentProfiles();
  const profile = agentId ? profiles[agentId] : null;

  const [editedConfig, setEditedConfig] = useState<Record<string, string>>(() =>
    profile ? Object.fromEntries(profile.configuration.map(f => [f.label, f.value])) : {}
  );
  const [editedTools,   setEditedTools]   = useState<string[]>(() => (profile ? profile.actions.map(a => a.label) : []));
  const [editedInputs,  setEditedInputs]  = useState<string[]>(() => (profile ? profile.inputs.map(i => i.label) : []));
  const [editedOutputs, setEditedOutputs] = useState<string[]>(() => (profile ? profile.outputs.map(o => o.label) : []));
  const [saved,         setSaved]         = useState(false);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  if (!profile || !agentId) return null;

  const Icon = AGENT_ICONS[profile.id] ?? Network;

  function handleConfigChange(label: string, value: string) {
    setEditedConfig(prev => ({ ...prev, [label]: value }));
  }

  function handleSave() {
    if (!profile) return;
    updateProfile(agentId!, {
      configuration: profile.configuration.map(f => ({ label: f.label, value: editedConfig[f.label] ?? f.value })),
    });
    setSaved(true);
    setTimeout(onClose, 1000);
  }

  function handleCancel() {
    if (profile) {
      setEditedConfig(Object.fromEntries(profile.configuration.map(f => [f.label, f.value])));
      setEditedTools(profile.actions.map(a => a.label));
      setEditedInputs(profile.inputs.map(i => i.label));
      setEditedOutputs(profile.outputs.map(o => o.label));
    }
    onClose();
  }

  const isAlert = profile.status === "ALERT";

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 60 }}
      />
      <div
        style={{
          position: "fixed",
          top: 0, right: 0, bottom: 0,
          width: 480,
          backgroundColor: "#FFFFFF",
          zIndex: 61,
          overflowY: "auto",
          borderLeft: "0.5px solid #E2E8F0",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            height: 60,
            backgroundColor: isAlert ? "#FEF2F2" : "#F0FDF4",
            borderBottom: "0.5px solid #E2E8F0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px",
            position: "sticky",
            top: 0,
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Icon size={20} color={profile.color} />
            <span style={{ fontSize: 16, fontWeight: 600, color: "#0D1B3E" }}>{profile.name}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              className="text-white"
              style={{
                fontSize: 10,
                fontWeight: 600,
                padding: "3px 8px",
                borderRadius: 10,
                backgroundColor: isAlert ? "#DA291C" : "#085040",
              }}
            >
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
          <div style={{ marginBottom: 20 }}>
            <div style={sectionLabel}>Overview</div>
            <p style={{ fontSize: 13, color: "#334155", lineHeight: 1.6, margin: 0 }}>{profile.overview}</p>
          </div>

          {/* Inputs / Outputs - editable */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            <EditableList
              label="Data sources (inputs)"
              addLabel="data source"
              items={editedInputs}
              onChange={setEditedInputs}
              placeholder="e.g. Cell-signal GPS position"
            />
            <EditableList
              label="Produces (outputs)"
              addLabel="output"
              items={editedOutputs}
              onChange={setEditedOutputs}
              placeholder="e.g. Confirmed delay report"
            />
          </div>

          {/* Tools - editable */}
          <div style={{ marginBottom: 20 }}>
            <EditableList
              label="Permitted actions (tools)"
              addLabel="action"
              items={editedTools}
              onChange={setEditedTools}
              placeholder="e.g. routes.getAlternates"
              mono
            />
          </div>

          {/* Configuration - editable */}
          <div style={{ marginBottom: 20 }}>
            <div style={sectionLabel}>Configuration</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {profile.configuration.map(field => (
                <div key={field.label}>
                  <label style={{ fontSize: 11, color: "#64748B", fontWeight: 500, display: "block", marginBottom: 4 }}>
                    {field.label}
                  </label>
                  <input
                    type="text"
                    value={editedConfig[field.label] ?? field.value}
                    onChange={e => handleConfigChange(field.label, e.target.value)}
                    style={{
                      width: "100%", boxSizing: "border-box",
                      padding: "7px 10px",
                      border: "0.5px solid #E2E8F0",
                      borderRadius: 6,
                      fontSize: 12,
                      color: "#334155",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Current task */}
          <div style={{ marginBottom: 20 }}>
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
                <span>→</span>
                <span>{useCase}</span>
              </div>
            ))}
          </div>

        </div>

        {/* Footer */}
        <div
          style={{
            position: "sticky",
            bottom: 0,
            backgroundColor: "#FFFFFF",
            borderTop: "0.5px solid #E2E8F0",
            padding: "12px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 11, fontStyle: "italic", color: "#64748B" }}>
            {saved ? "✓ Changes saved" : "Changes apply immediately"}
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={handleCancel}
              style={{ padding: "7px 14px", backgroundColor: "#fff", border: "0.5px solid #E2E8F0", borderRadius: 6, fontSize: 12, color: "#334155", cursor: "pointer" }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="text-white"
              style={{ padding: "7px 14px", backgroundColor: "#005EB8", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: "pointer" }}
            >
              Save changes
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

const sectionLabel = {
  fontSize: 10,
  fontWeight: 600,
  color: "#64748B",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  marginBottom: 8,
};

// Reusable inline-editable list of strings (add / edit / remove) - no prompt() dialogs.
function EditableList({ label, addLabel, items, onChange, placeholder, mono }: {
  label: string;
  addLabel: string;
  items: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  mono?: boolean;
}) {
  return (
    <div>
      <div style={sectionLabel}>{label}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: "#94A3B8", fontSize: 12, flexShrink: 0 }}>•</span>
            <input
              value={item}
              placeholder={placeholder}
              onChange={e => onChange(items.map((v, idx) => (idx === i ? e.target.value : v)))}
              style={{
                flex: 1, minWidth: 0, boxSizing: "border-box",
                padding: "6px 9px", border: "0.5px solid #E2E8F0", borderRadius: 6,
                fontSize: 12, color: "#334155",
                fontFamily: mono ? "var(--font-geist-mono), monospace" : undefined,
              }}
            />
            <button
              onClick={() => onChange(items.filter((_, idx) => idx !== i))}
              aria-label={`Remove ${addLabel}`}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 15, lineHeight: 1, padding: "0 2px", color: "#94A3B8", flexShrink: 0 }}
            >
              ×
            </button>
          </div>
        ))}
        <button
          onClick={() => onChange([...items, ""])}
          className="text-blue"
          style={{ alignSelf: "flex-start", fontSize: 11, border: "0.5px dashed #005EB8", borderRadius: 6, padding: "4px 10px", background: "#fff", cursor: "pointer", color: "#005EB8", marginTop: 2 }}
        >
          + Add {addLabel}
        </button>
      </div>
    </div>
  );
}
