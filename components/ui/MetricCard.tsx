interface MetricCardProps {
  label: string;
  value: string;
  delta: string;
  deltaPositive?: boolean;
  barColor: string;
  barWidth?: number;
}

export default function MetricCard({
  label,
  value,
  delta,
  deltaPositive = true,
  barColor,
  barWidth = 100,
}: MetricCardProps) {
  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        border: "0.5px solid #F0F4F5",
        borderRadius: 10,
        padding: "14px 16px 0 16px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        flex: 1,
        minWidth: 0,
        overflow: "hidden",
      }}
    >
      <span style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", color: "#212B32" }}>
        {label}
      </span>
      <span style={{ fontSize: 24, fontWeight: 500, color: "#005EB8", lineHeight: 1.1 }}>
        {value}
      </span>
      <span style={{ fontSize: 11, color: deltaPositive ? "#085040" : "#005EB8", display: "flex", alignItems: "center", gap: 3, marginBottom: 12 }}>
        <span>{deltaPositive ? "▲" : "▼"}</span>
        {delta}
      </span>
      <div style={{ height: 3, backgroundColor: `${barColor}22`, marginLeft: -16, marginRight: -16, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${barWidth}%`, backgroundColor: barColor }} />
      </div>
    </div>
  );
}
