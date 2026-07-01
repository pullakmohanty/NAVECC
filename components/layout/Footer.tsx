export default function Footer() {
  return (
    <footer
      style={{
        position: "fixed",
        bottom: 0,
        left: 220,
        right: 0,
        height: 32,
        backgroundColor: "#FFFFFF",
        borderTop: "1px solid #F0F4F5",
        zIndex: 40,
        display: "flex",
        alignItems: "center",
        paddingLeft: 24,
        paddingRight: 24,
      }}
    >
      <span
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: 11,
          color: "#64748B",
        }}
      >
        © 2026 Navedas Intelligence. All rights reserved.
      </span>
      <span style={{ marginLeft: "auto", display: "flex", gap: 16 }}>
        <a
          href="/terms"
          style={{ fontSize: 11, color: "#64748B", textDecoration: "none" }}
        >
          Terms
        </a>
        <a
          href="/privacy"
          style={{ fontSize: 11, color: "#64748B", textDecoration: "none" }}
        >
          Privacy Policy
        </a>
      </span>
    </footer>
  );
}
