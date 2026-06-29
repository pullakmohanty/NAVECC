"use client";

import { useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Brain, Truck, HeartPulse, Shield, Bell } from "lucide-react";
import type { ElementType } from "react";
import { agentProfiles } from "@/data/agentProfiles";

const AGENT_ICONS: Record<string, ElementType> = {
  "delivery-ops":  Truck,
  "clinical-risk": HeartPulse,
  "compliance":    Shield,
  "engagement":    Bell,
  "cpxo":          Brain,
};

export default function AgentDetailPage() {
  const params        = useParams();
  const router        = useRouter();
  const searchParams  = useSearchParams();
  const from          = searchParams.get("from");
  const id            = (params?.id as string) ?? "";
  const profile = agentProfiles[id];

  const [active, setActive] = useState(true);
  const [config, setConfig] = useState<Record<string, string>>(
    Object.fromEntries((profile?.configuration ?? []).map(f => [f.label, f.value]))
  );
  const [saved, setSaved] = useState(false);

  if (!profile) {
    return (
      <div style={{ padding: 24, fontSize: 13, color: "#64748B" }}>
        Agent not found: {id}
      </div>
    );
  }

  const Icon    = AGENT_ICONS[profile.id] ?? Brain;
  const isAlert = profile.status === "ALERT";

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Back button */}
      <button
        onClick={() => {
          if (from === "setup") router.push("/setup?step=2");
          else if (from === "agents") router.push("/agents");
          else router.back();
        }}
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "none", border: "none", cursor: "pointer",
          fontSize: 13, color: "#64748B", padding: 0,
        }}
      >
        <ArrowLeft size={14} color="#64748B" />
        {from === "setup" ? "Back to agent setup" : from === "agents" ? "Back to agent monitor" : "Back"}
      </button>

      {/* Header card */}
      <div style={{
        backgroundColor: isAlert ? "#FFF5F5" : "#FFFFFF",
        border: "0.5px solid #E2E8F0",
        borderRadius: 12,
        padding: "24px 28px",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>

          {/* Icon + name + status */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 10, flexShrink: 0,
              backgroundColor: profile.color + "1A",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Icon size={24} color={profile.color} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0D1B3E", margin: 0 }}>
                  {profile.name}
                </h1>
                <span style={{
                  fontSize: 11, fontWeight: 600,
                  color: isAlert ? "#E05C5C" : "#028090",
                  backgroundColor: isAlert ? "#FEF2F2" : "#F0FDF4",
                  border: `1px solid ${isAlert ? "#FECACA" : "#BBF7D0"}`,
                  padding: "2px 8px", borderRadius: 6,
                }}>
                  {profile.status}
                </span>
              </div>
              <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>{profile.role}</p>
            </div>
          </div>

          {/* Activate / Deactivate */}
          <button
            onClick={() => setActive(a => !a)}
            style={{
              fontSize: 13, fontWeight: 500,
              backgroundColor: active ? "#F1F5F9" : "#005EB8",
              color: active ? "#334155" : "#FFFFFF",
              border: active ? "0.5px solid #E2E8F0" : "none",
              borderRadius: 8, padding: "8px 16px",
              cursor: "pointer", flexShrink: 0,
            }}
          >
            {active ? "Deactivate agent" : "Activate agent"}
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Overview */}
          <div style={{ backgroundColor: "#FFFFFF", border: "0.5px solid #E2E8F0", borderRadius: 10, padding: "20px 24px" }}>
            <span style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", color: "#64748B", display: "block", marginBottom: 12 }}>
              Overview
            </span>
            <p style={{ fontSize: 13, color: "#334155", lineHeight: 1.7, margin: 0 }}>
              {profile.overview}
            </p>
          </div>

          {/* Inputs / Outputs */}
          <div style={{ backgroundColor: "#FFFFFF", border: "0.5px solid #E2E8F0", borderRadius: 10, padding: "20px 24px" }}>
            <span style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", color: "#64748B", display: "block", marginBottom: 12 }}>
              Inputs and Outputs
            </span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ border: "0.5px solid #E2E8F0", borderRadius: 8, padding: "14px 16px" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#0D1B3E", marginBottom: 10 }}>Inputs</div>
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 7 }}>
                  {profile.inputs.map(item => (
                    <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: "#028090", display: "inline-block", flexShrink: 0, marginTop: 5 }} />
                      <span style={{ fontSize: 12, color: "#334155", lineHeight: 1.5 }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div style={{ border: "0.5px solid #E2E8F0", borderRadius: 8, padding: "14px 16px" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#0D1B3E", marginBottom: 10 }}>Outputs</div>
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 7 }}>
                  {profile.outputs.map(item => (
                    <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: profile.color, display: "inline-block", flexShrink: 0, marginTop: 5 }} />
                      <span style={{ fontSize: 12, color: "#334155", lineHeight: 1.5 }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Tools */}
          <div style={{ backgroundColor: "#FFFFFF", border: "0.5px solid #E2E8F0", borderRadius: 10, padding: "20px 24px" }}>
            <span style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", color: "#64748B", display: "block", marginBottom: 12 }}>
              Tools Available
            </span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {profile.tools.map(tool => (
                <span key={tool} style={{
                  fontFamily: "var(--font-geist-mono), monospace",
                  fontSize: 11, color: "#334155",
                  border: "0.5px solid #E2E8F0",
                  borderRadius: 6, padding: "4px 10px",
                  backgroundColor: "#FAFBFC",
                }}>
                  {tool}
                </span>
              ))}
            </div>
          </div>

          {/* Configuration */}
          <div style={{ backgroundColor: "#FFFFFF", border: "0.5px solid #E2E8F0", borderRadius: 10, padding: "20px 24px" }}>
            <span style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", color: "#64748B", display: "block", marginBottom: 16 }}>
              Configuration
            </span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
              {profile.configuration.map(field => (
                <div key={field.label} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  <label style={{ fontSize: 11, color: "#64748B", fontWeight: 500 }}>{field.label}</label>
                  <input
                    type="text"
                    value={config[field.label] ?? field.value}
                    onChange={e => setConfig(prev => ({ ...prev, [field.label]: e.target.value }))}
                    style={{
                      fontSize: 13, color: "#334155",
                      border: "0.5px solid #E2E8F0",
                      borderRadius: 6, padding: "7px 10px",
                      backgroundColor: "#FFFFFF",
                      outline: "none",
                      width: "100%", boxSizing: "border-box",
                    }}
                  />
                </div>
              ))}
            </div>
            <button
              onClick={handleSave}
              style={{
                fontSize: 13, fontWeight: 500,
                backgroundColor: saved ? "#2D9E6A" : "#028090",
                color: "#FFFFFF",
                border: "none", borderRadius: 7, padding: "8px 16px",
                cursor: "pointer", transition: "background-color 0.2s",
              }}
            >
              {saved ? "Saved" : "Save configuration"}
            </button>
          </div>

      </div>
    </div>
  );
}
