export function UrgencyDot({
  urgency,
}: {
  urgency: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
}) {
  const styles = {
    CRITICAL: { bg: "#FDECEA", border: "#DA291C", dot: "#DA291C" },
    HIGH:     { bg: "#FFF3E0", border: "#E8A838", dot: "#E8A838" },
    MEDIUM:   { bg: "#E8F2FC", border: "#005EB8", dot: "#005EB8" },
    LOW:      { bg: "#F4F7FA", border: "#768692", dot: "#768692" },
  };
  const s = styles[urgency] ?? styles.LOW;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        padding: "2px 8px",
        minWidth: 68,
        boxSizing: "border-box",
        borderRadius: 4,
        background: s.bg,
        border: `1px solid ${s.border}`,
        fontSize: 10,
        fontWeight: 500,
        color: "#212B32",
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
