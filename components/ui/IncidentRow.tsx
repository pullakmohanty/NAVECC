"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Incident, Severity } from "@/data/mockData";
import { UrgencyDot } from "@/components/ui/UrgencyDot";

const severityDotHex: Record<Severity, string> = {
  CRITICAL: "#005EB8",
  HIGH:     "#085040",
  MEDIUM:   "#005EB8",
  LOW:      "#085040",
};

export default function IncidentRow({ incident }: { incident: Incident }) {
  const [hovered, setHovered] = useState(false);
  const router   = useRouter();
  const dotColor = severityDotHex[incident.severity];

  return (
    <tr
      onClick={() => router.push(`/incidents/${incident.id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ backgroundColor: hovered ? "#F8FFFE" : "#FFFFFF", cursor: "pointer", transition: "background-color 0.12s", borderBottom: "1px solid #F0F4F5" }}
    >
      {/* Severity dot + unread dot */}
      <td style={{ width: 36, paddingLeft: 16, paddingTop: 10, paddingBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: dotColor, display: "inline-block", flexShrink: 0 }} />
          {incident.isUnread && (
            <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#005EB8", display: "inline-block", flexShrink: 0 }} />
          )}
        </div>
      </td>

      {/* ID */}
      <td style={{ fontSize: 12, fontFamily: "var(--font-geist-mono), monospace", color: "#425563", fontWeight: 500, paddingRight: 16, whiteSpace: "nowrap" }}>
        {incident.id}
      </td>

      {/* Drug + location */}
      <td style={{ paddingRight: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: "#005EB8" }}>{incident.drug}</span>
          <span style={{ fontSize: 12, color: "#212B32" }}>{incident.location}</span>
        </div>
      </td>

      {/* Delay */}
      <td style={{ paddingRight: 16, whiteSpace: "nowrap" }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: dotColor }}>{incident.delayHours}h</span>
      </td>

      {/* Source pills */}
      <td style={{ paddingRight: 16 }}>
        <div style={{ display: "flex", gap: 4 }}>
          {incident.dataSources.map((src) => (
            <span key={src} style={{ fontSize: 11, fontWeight: 500, color: "#212B32" }}>
              {src}
            </span>
          ))}
        </div>
      </td>

      {/* Evidence */}
      <td style={{ paddingRight: 16 }}>
        <span style={{ fontSize: 12, color: "#212B32" }}>{incident.evidenceLevel}</span>
      </td>

      {/* Date */}
      <td style={{ paddingRight: 16, whiteSpace: "nowrap" }}>
        <span style={{ fontSize: 12, color: "#212B32" }}>{incident.date}</span>
      </td>

      {/* Severity */}
      <td style={{ paddingRight: 8, whiteSpace: "nowrap" }}>
        <UrgencyDot urgency={incident.severity} />
      </td>

      {/* Status */}
      <td style={{ paddingRight: 16, whiteSpace: "nowrap" }}>
        <span style={{ fontSize: 11, fontWeight: 500, color: "#212B32" }}>
          {incident.status}
        </span>
      </td>
    </tr>
  );
}
