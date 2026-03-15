"use client";

import { useMemo, useState } from "react";
import { useAccount } from "wagmi";
import {
  evaluatePolicy,
  makeAuditEntry,
  samplePolicies,
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
import { WalletButton } from "@/components/wallet-button";

export default function Home() {
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

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <nav className="mx-auto flex h-14 max-w-5xl items-center px-6">
          <span className="text-xl font-bold tracking-tight">
            Delegate<span className="text-muted-foreground">.</span>
          </span>
          <div className="ml-auto">
            <WalletButton />
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
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
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5 text-xs text-muted-foreground">
          <span>Delegate</span>
        </div>
      </footer>
    </div>
  );
}
