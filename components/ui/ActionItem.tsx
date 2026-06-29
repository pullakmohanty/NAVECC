"use client";

import { useRouter } from "next/navigation";
import { Severity } from "@/data/mockData";
import { UrgencyDot } from "@/components/ui/UrgencyDot";

interface ActionItemProps {
  id: string;
  severity: Severity;
  category: string;
  title: string;
  detail: string;
  timeRemaining: string;
  incidentId?: string;
}

const barColor: Record<Severity, string> = {
  CRITICAL: "#005EB8",
  HIGH:     "#028090",
  MEDIUM:   "#005EB8",
  LOW:      "#028090",
};

export default function ActionItem({
  severity,
  category,
  title,
  detail,
  timeRemaining,
  incidentId,
}: ActionItemProps) {
  const router = useRouter();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "stretch",
        backgroundColor: "#FFFFFF",
        border: "1px solid #ebebeb",
        borderRadius: 8,
        overflow: "hidden",
        gap: 0,
      }}
    >
      {/* Left severity bar */}
      <div
        style={{
          width: 4,
          backgroundColor: barColor[severity],
          flexShrink: 0,
        }}
      />

      {/* Content */}
      <div
        style={{
          flex: 1,
          padding: "12px 14px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
          minWidth: 0,
        }}
      >
        {/* Category + severity */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "#000000",
            }}
          >
            {category}
          </span>
          <UrgencyDot urgency={severity} />
        </div>

        {/* Title */}
        <span
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "#005EB8",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {title}
        </span>

        {/* Detail */}
        <span
          style={{
            fontSize: 12,
            color: "#000000",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {detail}
        </span>

        {/* Bottom row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 4,
          }}
        >
          <span
            style={{
              fontSize: 11,
              color: "#000000",
              backgroundColor: "#F8FAFC",
              border: "1px solid #ebebeb",
              borderRadius: 4,
              padding: "2px 8px",
            }}
          >
            ⏱ {timeRemaining} remaining
          </span>
          <button
            onClick={() => incidentId && router.push(`/incidents/${incidentId}`)}
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: "#028090",
              border: "1px solid #028090",
              borderRadius: 5,
              padding: "3px 12px",
              backgroundColor: "transparent",
              cursor: incidentId ? "pointer" : "default",
            }}
          >
            Review
          </button>
        </div>
      </div>
    </div>
  );
}
