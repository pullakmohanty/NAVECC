"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, Settings } from "lucide-react";

export default function UserProfile({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function signOut() {
    sessionStorage.removeItem("navedas_auth");
    router.push("/login");
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(o => !o)}
        title={compact ? "Sarah Mitchell — Supply Chain Lead" : undefined}
        style={{
          display: "flex",
          alignItems: "center",
          gap: compact ? 0 : 8,
          padding: compact ? 0 : "4px 8px",
          borderRadius: compact ? "50%" : 8,
          border: "none",
          backgroundColor: open ? "#F4F7FA" : "transparent",
          cursor: "pointer",
        }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#F4F7FA")}
        onMouseLeave={e => {
          if (!open) e.currentTarget.style.backgroundColor = "transparent";
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            backgroundColor: "#005EB8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <span className="text-white" style={{ fontSize: 13, fontWeight: 700 }}>
            SM
          </span>
        </div>

        {!compact && (
          <>
            {/* Text stack */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: "#000000", lineHeight: 1.3 }}>
                Sarah Mitchell
              </span>
              <span style={{ fontSize: 10, color: "#64748B", lineHeight: 1.3 }}>
                Supply Chain Lead
              </span>
            </div>

            <ChevronDown
              size={14}
              color="#64748B"
              style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}
            />
          </>
        )}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            ...(compact
              ? { bottom: "calc(100% + 4px)", left: 0 }
              : { top: "calc(100% + 4px)", right: 0 }),
            minWidth: 160,
            backgroundColor: "#FFFFFF",
            border: "1px solid #F0F4F5",
            borderRadius: 8,
            overflow: "hidden",
            zIndex: 100,
          }}
        >
          <button
            onClick={() => setOpen(false)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              width: "100%",
              padding: "9px 12px",
              border: "none",
              backgroundColor: "transparent",
              cursor: "pointer",
              textAlign: "left",
              fontSize: 12,
              color: "#000000",
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#F4F7FA")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <Settings size={14} />
            Settings
          </button>
          <button
            onClick={signOut}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              width: "100%",
              padding: "9px 12px",
              border: "none",
              borderTop: "1px solid #F0F4F5",
              backgroundColor: "transparent",
              cursor: "pointer",
              textAlign: "left",
              fontSize: 12,
              color: "#000000",
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#F4F7FA")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
