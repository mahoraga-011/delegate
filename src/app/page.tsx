"use client";

import { useMemo, useState } from "react";
import {
  evaluatePolicy,
  makeAuditEntry,
  samplePolicies,
  seedAuditLog,
  seedRequest,
  type AgentActionRequest,
} from "@/lib/delegate";
import { Hero } from "@/components/sections/hero";
import { PolicySelector } from "@/components/sections/policy-selector";
import { ActionForm } from "@/components/sections/action-form";
import { AuditLog } from "@/components/sections/audit-log";

export default function Home() {
  const [selectedPolicyId, setSelectedPolicyId] = useState(samplePolicies[0].id);
  const [request, setRequest] = useState<AgentActionRequest>(seedRequest);
  const [auditLog, setAuditLog] = useState(seedAuditLog);

  const selectedPolicy = useMemo(
    () => samplePolicies.find((p) => p.id === selectedPolicyId) ?? samplePolicies[0],
    [selectedPolicyId]
  );

  const result = useMemo(() => evaluatePolicy(selectedPolicy, request), [selectedPolicy, request]);

  const updateField = <K extends keyof AgentActionRequest>(field: K, value: AgentActionRequest[K]) => {
    setRequest((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = () => {
    setAuditLog((current) => [makeAuditEntry(selectedPolicy, request, current.length), ...current]);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <nav className="mx-auto flex h-14 max-w-5xl items-center px-6">
          <span className="text-xl font-bold tracking-tight">
            Delegate<span className="text-muted-foreground">.</span>
          </span>
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
          />
          <ActionForm
            request={request}
            result={result}
            onUpdate={updateField}
            onSubmit={handleSubmit}
          />
        </div>

        <div className="mt-12">
          <AuditLog entries={auditLog} />
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
