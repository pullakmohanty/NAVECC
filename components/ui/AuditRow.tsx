import { AuditEntry, AuditCategory } from "@/data/mockData";
import { dataSourceStyles } from "@/lib/design-system";

const categoryLabel: Record<AuditCategory, string> = {
  EVENT_CREATED:   "EVENT",
  ROOT_CAUSE:      "ROOT CAUSE",
  PV_FLAG:         "PV FLAG",
  REVIEW_ASSIGNED: "REVIEW",
  ACTION_TAKEN:    "ACTION",
  RESOLVED:        "RESOLVED",
};

function formatTime(iso: string) {
  return new Date(iso).toISOString().slice(11, 19);
}

export default function AuditRow({ entry }: { entry: AuditEntry }) {
  const catLabel = categoryLabel[entry.category];

  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        padding: "12px 16px",
        backgroundColor: "#FFFFFF",
        borderBottom: "0.5px solid #F0F4F5",
      }}
    >
      {/* Timestamp */}
      <span style={{ fontSize: 11, fontFamily: "var(--font-geist-mono), monospace", color: "#212B32", whiteSpace: "nowrap", flexShrink: 0, paddingTop: 2, minWidth: 64 }}>
        {formatTime(entry.timestamp)}
      </span>

      {/* Actor */}
      <span style={{ fontSize: 11, fontWeight: 500, color: "#212B32", whiteSpace: "nowrap", flexShrink: 0 }}>
        {entry.actor}
      </span>

      {/* Category */}
      <span style={{ fontSize: 11, fontWeight: 500, color: "#212B32", whiteSpace: "nowrap", flexShrink: 0 }}>
        {catLabel}
      </span>

      {/* Body */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: "#005EB8", margin: "0 0 4px 0" }}>
          {entry.title}
        </p>
        <p style={{ fontSize: 12, color: "#212B32", margin: 0, lineHeight: 1.55 }}>
          {entry.description}
        </p>

        {/* Signal source tags */}
        {entry.signalSources && entry.signalSources.length > 0 && (
          <div style={{ display: "flex", gap: 5, marginTop: 7, flexWrap: "wrap" }}>
            {entry.signalSources.map((src) => (
              <span key={src} style={{ fontSize: 10, color: dataSourceStyles.COURIER.text, backgroundColor: dataSourceStyles.COURIER.bg, padding: "1px 6px", borderRadius: 4 }}>
                {src}
              </span>
            ))}
          </div>
        )}

        {/* Incident link tag */}
        {entry.incidentId && (
          <span style={{ display: "inline-block", marginTop: 6, fontSize: 10, fontFamily: "var(--font-geist-mono), monospace", color: "#085040", backgroundColor: "#E1F3F5", padding: "1px 6px", borderRadius: 4 }}>
            {entry.incidentId}
          </span>
        )}
      </div>
    </div>
  );
}
