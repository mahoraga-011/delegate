"use client";

import { useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { evaluatePolicy, makeAuditEntry, type AgentActionRequest } from "@/lib/delegate";
import { useStore, useAllPolicies, useSelectedPolicy } from "@/lib/store";
import { useAttest } from "@/hooks/use-attest";
import { Hero } from "@/components/sections/hero";
import { PolicyList } from "@/components/sections/policy-list";
import { PolicyBuilderDialog } from "@/components/sections/policy-builder";
import { ActionForm } from "@/components/sections/action-form";
import { AuditLog } from "@/components/sections/audit-log";
import { Verification } from "@/components/sections/verification";
import { TrustPanel } from "@/components/sections/trust-panel";
import { AgreementPanel } from "@/components/sections/agreement-panel";
import { SpendingPanel } from "@/components/sections/spending-panel";
import { SectionHeader } from "@/components/section-header";
import { WalletGate } from "@/components/wallet-gate";
import { WalletButton } from "@/components/wallet-button";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Policy } from "@/lib/delegate";

type OnChainTab = "trust" | "cooperate" | "pay";

export default function Home() {
  const [builderOpen, setBuilderOpen] = useState(false);
  const [onChainTab, setOnChainTab] = useState<OnChainTab>("trust");

  // Store
  const draftRequest = useStore((s) => s.draftRequest);
  const updateDraftField = useStore((s) => s.updateDraftField);
  const auditLog = useStore((s) => s.auditLog);
  const addAuditEntry = useStore((s) => s.addAuditEntry);
  const clearAuditLog = useStore((s) => s.clearAuditLog);
  const addPolicy = useStore((s) => s.addPolicy);

  const allPolicies = useAllPolicies();
  const selectedPolicy = useSelectedPolicy();

  const { isConnected } = useAccount();
  const { attest, isPending: isAttesting } = useAttest();

  const result = useMemo(
    () => evaluatePolicy(selectedPolicy, draftRequest),
    [selectedPolicy, draftRequest]
  );

  const handleSubmit = async () => {
    const entry = makeAuditEntry(selectedPolicy, draftRequest, auditLog.length);

    if (isConnected) {
      try {
        const txHash = await attest(selectedPolicy, draftRequest, result);
        entry.txHash = txHash;
      } catch {
        // On-chain attestation failed, still add to local log
      }
    }

    addAuditEntry(entry);
  };

  const handleSavePolicy = (policy: Policy) => {
    addPolicy(policy);
  };

  const navLinks = [
    { href: "#policies", label: "Policies" },
    { href: "#evaluate", label: "Evaluate" },
    { href: "#log", label: "Log" },
    { href: "#onchain", label: "On-Chain" },
  ];

  const onChainTabs: { id: OnChainTab; label: string }[] = [
    { id: "trust", label: "Trust" },
    { id: "cooperate", label: "Cooperate" },
    { id: "pay", label: "Pay" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <nav className="mx-auto flex h-14 max-w-5xl items-center px-6">
          <span className="text-xl font-bold tracking-tight">
            Delegate<span className="text-muted-foreground">.</span>
          </span>
          <div className="ml-8 hidden items-center gap-1 sm:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector(link.href)?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <WalletButton />
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10 space-y-16">
        {/* Hero */}
        <Hero />

        {/* Policies */}
        <section>
          <PolicyList result={result} onCreateNew={() => setBuilderOpen(true)} />
        </section>

        {/* Evaluate */}
        <section>
          <SectionHeader
            id="evaluate"
            title="Evaluate"
            description="Test an agent action request against the selected policy."
          />
          <div className="mt-5">
            <ActionForm
              request={draftRequest}
              result={result}
              policy={selectedPolicy}
              onUpdate={updateDraftField}
              onSubmit={handleSubmit}
              isConnected={isConnected}
              isAttesting={isAttesting}
            />
          </div>
        </section>

        {/* Audit Log */}
        <section>
          <AuditLog entries={auditLog} onClear={clearAuditLog} />
        </section>

        {/* Verification */}
        <section>
          <Verification policies={allPolicies} />
        </section>

        {/* On-Chain */}
        <section>
          <SectionHeader
            id="onchain"
            title="On-Chain Tools"
            description="Register agent identity, form bilateral agreements, and manage spending vaults."
          />

          <div className="mt-5">
            <WalletGate description="Register agent identity, create bilateral agreements, and manage spending vaults with an Ethereum wallet.">
              {/* Sub-tabs */}
              <div className="border-b mb-6">
                <div className="flex gap-0">
                  {onChainTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setOnChainTab(tab.id)}
                      className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                        onChainTab === tab.id
                          ? "border-foreground text-foreground"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {onChainTab === "trust" && <TrustPanel policies={allPolicies} />}
              {onChainTab === "cooperate" && <AgreementPanel policies={allPolicies} />}
              {onChainTab === "pay" && <SpendingPanel policies={allPolicies} />}
            </WalletGate>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5 text-xs text-muted-foreground">
          <span>Delegate</span>
        </div>
      </footer>

      {/* Policy Builder Dialog */}
      <PolicyBuilderDialog
        open={builderOpen}
        onOpenChange={setBuilderOpen}
        onSave={handleSavePolicy}
      />
    </div>
  );
}
