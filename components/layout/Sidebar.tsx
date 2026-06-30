"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, AlertCircle, PieChart,
  FileText, Bot, Network,
} from "lucide-react";
import UserProfile from "@/components/ui/UserProfile";

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

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    const base = href.startsWith("/incidents/") ? "/incidents" : href;
    return pathname.startsWith(base);
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

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "12px 0",
          borderTop: "1px solid #F0F4F5",
        }}
      >
        <UserProfile compact />
      </div>
    </aside>
  );
}
