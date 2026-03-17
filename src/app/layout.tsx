import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Providers } from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Delegate | Policy enforcement for autonomous agents",
  description:
    "Deterministic policy engine with on-chain verification. Trust agent commitments, form bilateral agreements, and enforce spending limits, all verifiable on-chain.",
  keywords: [
    "AI agents",
    "policy engine",
    "on-chain verification",
    "smart contracts",
    "agent trust",
    "spending limits",
    "bilateral agreements",
    "Ethereum",
    "Base",
  ],
  authors: [{ name: "Delegate" }],
  creator: "Delegate",
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    title: "Delegate | Policy enforcement for autonomous agents",
    description:
      "Deterministic policy engine with on-chain verification. Trust, cooperate, and pay. All verifiable on-chain.",
    siteName: "Delegate",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Delegate | Policy enforcement for autonomous agents",
    description:
      "Deterministic policy engine with on-chain verification. Trust, cooperate, and pay. All verifiable on-chain.",
    creator: "@anthropic",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <TooltipProvider>{children}</TooltipProvider>
        </Providers>
      </body>
    </html>
  );
}
