interface DataSourceCardProps {
  type: "COURIER" | "APPT" | "NURSE";
  org: string;
  finding: string;
  detail: string;
  timestamp: string;
}

export default function DataSourceCard({ type, org, finding, detail, timestamp }: DataSourceCardProps) {

  return (
    <div
      style={{
        flex: 1,
        backgroundColor: "#FFFFFF",
        border: "1px solid #F0F4F5",
        borderRadius: 8,
        padding: "14px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        minWidth: 0,
      }}
    >
      {/* Type pill + org */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 500, color: "#212B32" }}>
          {type}
        </span>
        <span style={{ fontSize: 10, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "#212B32" }}>
          {org}
        </span>
      </div>

      {/* Finding */}
      <span style={{ fontSize: 13, fontWeight: 600, color: "#005EB8" }}>{finding}</span>

      {/* Detail */}
      <span style={{ fontSize: 12, color: "#212B32", lineHeight: 1.5 }}>{detail}</span>

      {/* Timestamp */}
      <span style={{ fontSize: 11, color: "#212B32", marginTop: "auto", paddingTop: 6 }}>{timestamp}</span>
    </div>
  );
}
