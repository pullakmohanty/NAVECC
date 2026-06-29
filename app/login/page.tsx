"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState(false);

  function handleLogin() {
    if (password === "Nav@2026") {
      sessionStorage.setItem("navedas_auth", "true");
      router.push("/setup");
    } else {
      setError(true);
    }
  }

  return (
    <div style={{
      minHeight: "100vh", backgroundColor: "#0D1B3E",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px",
    }}>
      <div style={{
        backgroundColor: "#FFFFFF", border: "1px solid #F0F4F5",
        borderRadius: 12, padding: 32, width: "100%", maxWidth: 400,
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
<div style={{ fontSize: 24, fontWeight: 500, color: "#000000", marginBottom: 4 }}>
            NavECC
          </div>
          <div style={{ fontSize: 13, color: "#000000" }}>
            Navedas Intelligence Platform
          </div>
        </div>

        {/* Password label */}
        <div style={{ fontSize: 12, color: "#000000", marginBottom: 4 }}>
          Password
        </div>

        {/* Password input */}
        <input
          type="password"
          value={password}
          onChange={e => { setPassword(e.target.value); setError(false); }}
          onKeyDown={e => e.key === "Enter" && handleLogin()}
          placeholder="Enter password"
          style={{
            width: "100%", padding: "8px 12px", fontSize: 13,
            border: `1px solid ${error ? "#005EB8" : "#F0F4F5"}`,
            borderRadius: 6, outline: "none", boxSizing: "border-box",
            marginBottom: 8,
          }}
        />

        {/* Error */}
        {error && (
          <div style={{ fontSize: 12, color: "#005EB8", marginBottom: 8 }}>
            Incorrect password. Try again.
          </div>
        )}

        {/* Login button */}
        <button
          onClick={handleLogin}
          style={{
            width: "100%", padding: 10, fontSize: 13, fontWeight: 500,
            backgroundColor: "#005EB8", color: "#ffffff",
            border: "none", borderRadius: 6, cursor: "pointer",
          }}
        >
          Sign in →
        </button>

        {/* Footer */}
        <div style={{ fontSize: 11, color: "#000000", textAlign: "center", marginTop: 20 }}>
          Arvion Biosciences UK
        </div>
      </div>
    </div>
  );
}
