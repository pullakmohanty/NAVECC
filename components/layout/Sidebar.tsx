"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, AlertCircle, PieChart,
  FileText, Bot, Network, LogOut,
} from "lucide-react";

const navLinks = [
  { href: "/",                      label: "Dashboard",     icon: LayoutDashboard },
  { href: "/incidents/INC-00934",    label: "Incidents",     icon: AlertCircle     },
  { href: "/root-cause",            label: "Root Cause",    icon: PieChart        },
  { href: "/audit-log",             label: "Audit Log",     icon: FileText        },
  { href: "/agents",                label: "Agent Monitor", icon: Bot             },
  { href: "/how-it-works",          label: "How It Works",  icon: Network         },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    const base = href.startsWith("/incidents/") ? "/incidents" : href;
    return pathname.startsWith(base);
  }

  function signOut() {
    sessionStorage.removeItem("navedas_auth");
    router.push("/login");
  }

  return (
    <aside
      style={{
        position: "fixed", top: 0, left: 0, bottom: 0,
        width: 56, backgroundColor: "#ffffff", zIndex: 45,
        display: "flex", flexDirection: "column",
        paddingTop: 48, borderRight: "1px solid #F0F4F5",
      }}
    >
      <nav style={{ padding: "12px 0", flex: 1 }}>
        {navLinks.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              title={label}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                height: 40, textDecoration: "none",
                color: active ? "#005EB8" : "#000000",
                backgroundColor: active ? "#F0F4F5" : "transparent",
                borderLeft: active ? "3px solid #005EB8" : "3px solid transparent",
              }}
            >
              <Icon size={17} style={{ flexShrink: 0 }} />
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div style={{ padding: "12px 0", borderTop: "1px solid #F0F4F5" }}>
        <button
          onClick={signOut}
          title="Sign out"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: "100%", height: 40, border: "none",
            backgroundColor: "transparent", cursor: "pointer",
            color: "#000000",
          }}
        >
          <LogOut size={17} />
        </button>
      </div>
    </aside>
  );
}
