"use client";

import { useMemo, useState } from "react";
import { useAccount } from "wagmi";
import {
  evaluatePolicy,
  makeAuditEntry,
  samplePolicies,
  allPolicies,
  seedAuditLog,
  seedRequest,
  type AgentActionRequest,
  type AuditEntry,
} from "@/lib/delegate";
import { useAttest } from "@/hooks/use-attest";
import { Hero } from "@/components/sections/hero";
import { PolicySelector } from "@/components/sections/policy-selector";
import { ActionForm } from "@/components/sections/action-form";
import { AuditLog } from "@/components/sections/audit-log";
import { Verification } from "@/components/sections/verification";
import { TrustPanel } from "@/components/sections/trust-panel";
import { AgreementPanel } from "@/components/sections/agreement-panel";
import { SpendingPanel } from "@/components/sections/spending-panel";
import { WalletButton } from "@/components/wallet-button";
import { ThemeToggle } from "@/components/theme-toggle";

type Tab = "evaluate" | "trust" | "cooperate" | "pay";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("evaluate");
  const [selectedPolicyId, setSelectedPolicyId] = useState(samplePolicies[0].id);
  const [request, setRequest] = useState<AgentActionRequest>(seedRequest);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>(seedAuditLog);

  const { isConnected } = useAccount();
  const { attest, isPending: isAttesting } = useAttest();

  const selectedPolicy = useMemo(
    () => samplePolicies.find((p) => p.id === selectedPolicyId) ?? samplePolicies[0],
    [selectedPolicyId]
  );

  const result = useMemo(() => evaluatePolicy(selectedPolicy, request), [selectedPolicy, request]);

  const updateField = <K extends keyof AgentActionRequest>(field: K, value: AgentActionRequest[K]) => {
    setRequest((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async () => {
    const entry = makeAuditEntry(selectedPolicy, request, auditLog.length);

    if (isConnected) {
      try {
        const txHash = await attest(selectedPolicy, request, result);
        entry.txHash = txHash;
      } catch {
        // On-chain attestation failed — still add to local log
      }
    }

    setAuditLog((current) => [entry, ...current]);
  };

  const tabs: { id: Tab; label: string; theme?: string }[] = [
    { id: "evaluate", label: "Evaluate" },
    { id: "trust", label: "Trust", theme: "Agent identity" },
    { id: "cooperate", label: "Cooperate", theme: "Agreements" },
    { id: "pay", label: "Pay", theme: "Vault & spending" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <nav className="mx-auto flex h-14 max-w-5xl items-center px-6">
          <span className="text-xl font-bold tracking-tight">
            Delegate<span className="text-muted-foreground">.</span>
          </span>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <WalletButton />
          </div>
        </nav>
      </header>

      {/* Tabs */}
      <div className="border-b">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex gap-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-6 py-10">
        {activeTab === "evaluate" && (
          <>
            <Hero policy={selectedPolicy} result={result} />

            <div className="mt-12 grid gap-8 lg:grid-cols-2">
              <PolicySelector
                policies={samplePolicies}
                selectedPolicyId={selectedPolicyId}
                onSelect={setSelectedPolicyId}
                result={result}
                isConnected={isConnected}
              />
              <ActionForm
                request={request}
                result={result}
                onUpdate={updateField}
                onSubmit={handleSubmit}
                isConnected={isConnected}
                isAttesting={isAttesting}
              />
            </div>

            <div className="mt-12">
              <AuditLog entries={auditLog} />
            </div>

            <div className="mt-12">
              <Verification policies={samplePolicies} />
            </div>
          </>
        )}

        {activeTab === "trust" && <TrustPanel policies={allPolicies} />}
        {activeTab === "cooperate" && <AgreementPanel policies={allPolicies} />}
        {activeTab === "pay" && <SpendingPanel policies={allPolicies} />}
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5 text-xs text-muted-foreground">
          <span>Delegate</span>
        </div>
      </footer>
    </div>
  );
}
