export default function UseCaseBar() {
  return (
    <div
      style={{
        position: "fixed",
        top: 48,
        left: 56,
        right: 0,
        height: 40,
        backgroundColor: "#FFFFFF",
        borderBottom: "1px solid #F0F4F5",
        zIndex: 40,
        display: "flex",
        alignItems: "center",
        paddingLeft: 24,
        paddingRight: 24,
        gap: 10,
      }}
    >
      {/* UC1 — LIVE (active) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          border: "1.5px solid #028090",
          borderRadius: 6,
          padding: "3px 10px",
          backgroundColor: "rgba(2, 128, 144, 0.04)",
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 500, color: "#028090" }}>
          Silent delivery delay detection
        </span>
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: "#FFFFFF",
            backgroundColor: "#028090",
            borderRadius: 4,
            padding: "1px 6px",
            letterSpacing: "0.03em",
          }}
        >
          LIVE
        </span>
      </div>

      {/* UC2 — Coming soon */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          border: "1.5px dashed #F0F4F5",
          borderRadius: 6,
          padding: "3px 10px",
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 400, color: "#000000" }}>
          NHS Workaround Quantification
        </span>
        <span
          style={{
            fontSize: 10,
            fontWeight: 500,
            color: "#000000",
            backgroundColor: "#F4F7FA",
            borderRadius: 4,
            padding: "1px 6px",
          }}
        >
          Coming soon
        </span>
      </div>

      {/* UC3 — Coming soon */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          border: "1.5px dashed #F0F4F5",
          borderRadius: 6,
          padding: "3px 10px",
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 400, color: "#000000" }}>
          Proactive Intervention
        </span>
        <span
          style={{
            fontSize: 10,
            fontWeight: 500,
            color: "#000000",
            backgroundColor: "#F4F7FA",
            borderRadius: 4,
            padding: "1px 6px",
          }}
        >
          Coming soon
        </span>
      </div>

      {/* UC4 — Coming soon */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          border: "1.5px dashed #F0F4F5",
          borderRadius: 6,
          padding: "3px 10px",
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 400, color: "#000000" }}>
          Attribution Model
        </span>
        <span
          style={{
            fontSize: 10,
            fontWeight: 500,
            color: "#000000",
            backgroundColor: "#F4F7FA",
            borderRadius: 4,
            padding: "1px 6px",
          }}
        >
          Coming soon
        </span>
      </div>
    </div>
  );
}
