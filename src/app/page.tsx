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
    <main className="min-h-screen bg-[#040a14]">
      {/* Background effects */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(34,211,238,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(99,102,241,0.05),transparent_50%)]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
        {/* Header bar */}
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 text-xs font-black text-white">
              D
            </div>
            <span className="text-sm font-semibold tracking-tight text-white">Delegate</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            <span className="text-[11px] font-medium text-slate-400">Policy engine active</span>
          </div>
        </nav>

        {/* Hero */}
        <Hero policy={selectedPolicy} result={result} />

        {/* Policy + Action Form */}
        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
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
        </section>

        {/* Audit Log */}
        <AuditLog entries={auditLog} />

        {/* Footer */}
        <footer className="flex items-center justify-between border-t border-white/[0.04] pt-6 pb-4">
          <p className="text-[11px] text-slate-600">
            Delegate — safe execution for autonomous agents
          </p>
          <p className="text-[11px] text-slate-700">
            Hackathon MVP · 2026
          </p>
        </footer>
      </div>
    </main>
  );
}
