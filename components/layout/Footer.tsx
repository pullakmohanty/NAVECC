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
      <span style={{ fontSize: 11, color: "#000000" }}>
        Arvion Biosciences UK · Data as of 25 Jun 2026 · 09:14
      </span>
    </footer>
  );
}
