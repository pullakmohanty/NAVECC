export default function Navbar() {
  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 48,
        backgroundColor: "#ffffff",
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingLeft: 24,
        paddingRight: 24,
        borderBottom: "1px solid #F0F4F5",
      }}
    >
      {/* Left — brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* Company logo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.svg"
          alt="NavECC"
          style={{ width: 28, height: 28, borderRadius: 5, display: "block" }}
        />
        <span
          style={{
            color: "#000000",
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: "-0.01em",
          }}
        >
          NavECC
        </span>
        <span style={{ color: "#F0F4F5", fontSize: 14 }}>|</span>
        <span
          style={{
            color: "#000000",
            fontSize: 12,
            fontWeight: 400,
          }}
        >
          Arvion Biosciences UK
        </span>
      </div>

      {/* Right — actions + user */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {/* User name */}
        <span style={{ color: "#000000", fontSize: 12 }}>
          Sarah Mitchell
        </span>

        {/* Avatar */}
        <div
          style={{
            width: 28,
            height: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ color: "#000000", fontSize: 11, fontWeight: 600 }}>
            SM
          </span>
        </div>
      </div>
    </header>
  );
}
