export function UrgencyDot({
  urgency,
}: {
  urgency: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
}) {
  const styles = {
    CRITICAL: { bg: "#FDECEA", border: "#E05C5C", dot: "#E05C5C" },
    HIGH:     { bg: "#FFF3E0", border: "#E8A838", dot: "#E8A838" },
    MEDIUM:   { bg: "#E8F2FC", border: "#005EB8", dot: "#005EB8" },
    LOW:      { bg: "#F4F7FA", border: "#94A3B8", dot: "#94A3B8" },
  };
  const s = styles[urgency] ?? styles.LOW;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "2px 8px",
        borderRadius: 4,
        background: s.bg,
        border: `1px solid ${s.border}`,
        fontSize: 10,
        fontWeight: 500,
        color: "#000000",
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: s.dot,
          flexShrink: 0,
          display: "inline-block",
        }}
      />
      {urgency}
    </span>
  );
}
