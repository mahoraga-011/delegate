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

const outcomeStyles = {
  allow: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
  deny: "border-rose-500/40 bg-rose-500/10 text-rose-200",
};

export default function Home() {
  const [selectedPolicyId, setSelectedPolicyId] = useState(samplePolicies[0].id);
  const [request, setRequest] = useState<AgentActionRequest>(seedRequest);
  const [auditLog, setAuditLog] = useState(seedAuditLog);

  const selectedPolicy = useMemo(
    () => samplePolicies.find((policy) => policy.id === selectedPolicyId) ?? samplePolicies[0],
    [selectedPolicyId],
  );

  const result = useMemo(() => evaluatePolicy(selectedPolicy, request), [selectedPolicy, request]);

  const updateField = <K extends keyof AgentActionRequest>(field: K, value: AgentActionRequest[K]) => {
    setRequest((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = () => {
    setAuditLog((current) => [makeAuditEntry(selectedPolicy, request, current.length), ...current]);
  };

  return (
    <main className="min-h-screen bg-[#07111f] text-slate-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 lg:px-10">
        <section className="grid gap-6 rounded-[32px] border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-black/20 backdrop-blur lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="inline-flex items-center rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-200">
              Delegate · safe execution layer for autonomous agents
            </div>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white md:text-6xl">
                Deterministic policy checks before an agent ever touches the real world.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-300">
                Delegate is a hackathon MVP for wrapping autonomous agents in a visibly safe execution layer. Define a
                policy, submit an action request, evaluate it deterministically, and keep an audit trail humans can read.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ["Policy-first", "Rules are explicit and readable, not buried in prompts."],
                ["Deterministic", "Same input, same allow/deny decision every time."],
                ["Auditable", "Every decision leaves a compact forensic breadcrumb trail."],
              ].map(([title, body]) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-[#0b1628] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Live decision</p>
                <h2 className="text-2xl font-semibold text-white">{selectedPolicy.name}</h2>
              </div>
              <div
                className={`rounded-full border px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] ${outcomeStyles[result.outcome]}`}
              >
                {result.outcome}
              </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-400">{selectedPolicy.description}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Stat label="Passed checks" value={String(result.scorecard.passed)} />
              <Stat label="Failed checks" value={String(result.scorecard.failed)} />
              <Stat label="Default effect" value={selectedPolicy.defaultEffect} />
              <Stat label="Risk score" value={`${request.risk}/10`} />
            </div>
            <p className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-300">
              {result.reason}
            </p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-6 rounded-[28px] border border-white/10 bg-white/[0.04] p-6">
            <div>
              <p className="text-sm text-slate-400">Step 1</p>
              <h2 className="text-2xl font-semibold text-white">Define a policy</h2>
            </div>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-300">Policy profile</span>
              <select
                value={selectedPolicyId}
                onChange={(event) => setSelectedPolicyId(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-[#09111e] px-4 py-3 text-slate-100 outline-none ring-0"
              >
                {samplePolicies.map((policy) => (
                  <option key={policy.id} value={policy.id}>
                    {policy.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="space-y-3 rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm font-semibold text-white">Rules</p>
              {selectedPolicy.rules.map((rule) => {
                const check = result.checks.find((item) => item.ruleId === rule.id);
                return (
                  <div key={rule.id} className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-slate-100">{rule.label}</p>
                        <p className="mt-1 text-xs leading-5 text-slate-400">{rule.rationale}</p>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          check?.passed ? "bg-emerald-500/15 text-emerald-200" : "bg-rose-500/15 text-rose-200"
                        }`}
                      >
                        {check?.passed ? "pass" : "fail"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-6 rounded-[28px] border border-white/10 bg-white/[0.04] p-6">
            <div>
              <p className="text-sm text-slate-400">Step 2</p>
              <h2 className="text-2xl font-semibold text-white">Submit an agent action request</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Action type">
                <input
                  value={request.actionType}
                  onChange={(event) => updateField("actionType", event.target.value)}
                  className="input"
                  placeholder="read / summarize / execute"
                />
              </Field>
              <Field label="Tool">
                <input
                  value={request.tool}
                  onChange={(event) => updateField("tool", event.target.value)}
                  className="input"
                  placeholder="read / exec / network"
                />
              </Field>
              <Field label="Risk score (0-10)">
                <input
                  type="range"
                  min={0}
                  max={10}
                  step={1}
                  value={request.risk}
                  onChange={(event) => updateField("risk", Number(event.target.value))}
                  className="mt-3 w-full accent-cyan-300"
                />
                <div className="mt-2 text-sm text-slate-400">Current: {request.risk}</div>
              </Field>
              <Field label="Target">
                <input
                  value={request.target}
                  onChange={(event) => updateField("target", event.target.value)}
                  className="input"
                  placeholder="staging-docs-bucket"
                />
              </Field>
            </div>

            <Field label="Justification">
              <textarea
                value={request.justification}
                onChange={(event) => updateField("justification", event.target.value)}
                className="input min-h-28 resize-y"
                placeholder="Why the agent believes this action is needed"
              />
            </Field>

            <div className="rounded-2xl border border-white/10 bg-[#08101d] p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-400">Step 3</p>
                  <h3 className="text-lg font-semibold text-white">Deterministic evaluation</h3>
                </div>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
                >
                  Add to audit log
                </button>
              </div>
              <div className="mt-4 grid gap-3">
                {result.checks.map((check) => (
                  <div key={check.ruleId} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-white">{check.label}</p>
                        <p className="mt-1 text-xs text-slate-400">{check.summary}</p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                          check.passed ? "bg-emerald-500/15 text-emerald-200" : "bg-rose-500/15 text-rose-200"
                        }`}
                      >
                        {check.passed ? "pass" : "fail"}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{check.rationale}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm text-slate-400">Step 4</p>
              <h2 className="text-2xl font-semibold text-white">Audit log</h2>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-slate-400">
              Every submitted request becomes an append-only audit entry with the policy, inputs, and deterministic result.
            </p>
          </div>
          <div className="mt-6 grid gap-4">
            {auditLog.map((entry) => (
              <article key={entry.id} className="rounded-2xl border border-white/10 bg-[#08101d] p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-semibold text-white">{entry.id}</h3>
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${outcomeStyles[entry.result.outcome]}`}
                      >
                        {entry.result.outcome}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-400">
                      {entry.policyName} · {new Date(entry.timestamp).toLocaleString("en-US", { timeZone: "UTC" })} UTC
                    </p>
                  </div>
                  <p className="max-w-xl text-sm leading-6 text-slate-300">{entry.request.justification}</p>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-4">
                  <AuditPill label="Action" value={entry.request.actionType} />
                  <AuditPill label="Tool" value={entry.request.tool} />
                  <AuditPill label="Risk" value={`${entry.request.risk}/10`} />
                  <AuditPill label="Target" value={entry.request.target} />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {entry.result.checks.map((check) => (
                    <span
                      key={check.ruleId}
                      className={`rounded-full px-3 py-1 text-xs ${
                        check.passed ? "bg-emerald-500/15 text-emerald-200" : "bg-rose-500/15 text-rose-200"
                      }`}
                    >
                      {check.label}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-300">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function AuditPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-100">{value}</p>
    </div>
  );
}
