"use client";

import { motion } from "motion/react";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { Spotlight } from "@/components/ui/spotlight";
import type { EvaluationResult, Policy } from "@/lib/delegate";

const pillars = [
  {
    title: "Policy-first",
    desc: "Rules are explicit and readable, not buried in prompts.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ),
  },
  {
    title: "Deterministic",
    desc: "Same input, same allow/deny decision every time.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
      </svg>
    ),
  },
  {
    title: "Auditable",
    desc: "Every decision leaves a compact forensic breadcrumb trail.",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
    ),
  },
];

export function Hero({
  policy,
  result,
}: {
  policy: Policy;
  result: EvaluationResult;
}) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-transparent p-1">
      <div className="relative overflow-hidden rounded-[22px] bg-gradient-to-b from-[#0a1628] to-[#060e1a] px-6 py-12 md:px-12 md:py-16 lg:px-16">
        <Spotlight className="-top-40 left-0 md:-top-20 md:left-60" fill="#22d3ee" />

        {/* Subtle grid pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }}
        />

        <div className="relative z-10 grid gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:gap-16">
          {/* Left */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/[0.06] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
              </span>
              Safe execution layer
            </motion.div>

            <TextGenerateEffect
              words="Deterministic policy checks before an agent ever touches the real world."
              className="text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl"
              duration={0.4}
            />

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="max-w-xl text-base leading-7 text-slate-400 md:text-lg md:leading-8"
            >
              Define a policy. Submit an agent action. Evaluate it deterministically.
              Keep an audit trail humans can read.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="grid gap-3 sm:grid-cols-3"
            >
              {pillars.map((p, i) => (
                <motion.div
                  key={p.title}
                  whileHover={{ y: -2, backgroundColor: "rgba(255,255,255,0.04)" }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 transition-colors"
                >
                  <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 transition-colors group-hover:bg-cyan-500/20">
                    {p.icon}
                  </div>
                  <p className="text-sm font-semibold text-white">{p.title}</p>
                  <p className="mt-1.5 text-xs leading-5 text-slate-500">{p.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right — live decision card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-col"
          >
            <LiveDecisionCard policy={policy} result={result} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function LiveDecisionCard({
  policy,
  result,
}: {
  policy: Policy;
  result: EvaluationResult;
}) {
  const isAllow = result.outcome === "allow";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#080f1e]/80 p-6 backdrop-blur">
      {/* Glow effect at top */}
      <div
        className={`pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full blur-3xl transition-colors duration-700 ${
          isAllow ? "bg-emerald-500/20" : "bg-rose-500/20"
        }`}
      />

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-slate-500">Live decision</p>
            <h2 className="mt-1 text-xl font-semibold text-white">{policy.name}</h2>
          </div>
          <motion.div
            key={result.outcome}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] ${
              isAllow
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                : "border-rose-500/30 bg-rose-500/10 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.15)]"
            }`}
          >
            {result.outcome}
          </motion.div>
        </div>

        <p className="mt-3 text-sm leading-6 text-slate-500">{policy.description}</p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <StatBlock label="Passed" value={result.scorecard.passed} accent="emerald" />
          <StatBlock label="Failed" value={result.scorecard.failed} accent="rose" />
          <StatBlock label="Default" value={policy.defaultEffect} />
          <StatBlock label="Total rules" value={policy.rules.length} />
        </div>

        <motion.div
          key={result.reason}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5"
        >
          <p className="text-xs leading-5 text-slate-400">{result.reason}</p>
        </motion.div>
      </div>
    </div>
  );
}

function StatBlock({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: "emerald" | "rose";
}) {
  const accentClass =
    accent === "emerald"
      ? "text-emerald-400"
      : accent === "rose"
        ? "text-rose-400"
        : "text-white";

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-3">
      <p className="text-[10px] font-medium uppercase tracking-widest text-slate-600">{label}</p>
      <p className={`mt-1 text-xl font-semibold ${accentClass}`}>{String(value)}</p>
    </div>
  );
}
