import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientShell from "@/components/layout/ClientShell";
import { AgentProfilesProvider } from "@/lib/AgentProfilesContext";
import { GovernanceDecisionsProvider } from "@/lib/GovernanceDecisionsContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NavECC - Navedas Intelligence",
  description:
    "Silent Delivery Delay Detection · Arvion Biosciences · UK Homecare Operations",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <AgentProfilesProvider>
          <GovernanceDecisionsProvider>
            <ClientShell>{children}</ClientShell>
          </GovernanceDecisionsProvider>
        </AgentProfilesProvider>
      </body>
    </html>
  );
}
