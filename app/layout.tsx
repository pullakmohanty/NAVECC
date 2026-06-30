import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientShell from "@/components/layout/ClientShell";
import { AgentProfilesProvider } from "@/lib/AgentProfilesContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NavECC — Navedas Intelligence",
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
          <ClientShell>{children}</ClientShell>
        </AgentProfilesProvider>
      </body>
    </html>
  );
}
