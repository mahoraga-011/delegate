"use client";

import { LandingNav } from "@/components/landing/nav";
import { LandingHero } from "@/components/landing/hero";
import { AgentBlock } from "@/components/landing/agent-block";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Features } from "@/components/landing/features";
import { ForAgents } from "@/components/landing/for-agents";
import { CTA } from "@/components/landing/cta";
import { LandingFooter } from "@/components/landing/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      <main>
        <LandingHero />
        <HowItWorks />
        <Features />
        <ForAgents />
        <AgentBlock />
        <CTA />
      </main>
      <LandingFooter />
    </div>
  );
}
