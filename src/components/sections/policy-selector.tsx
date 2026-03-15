"use client";

import { motion, AnimatePresence } from "motion/react";
import type { Policy, EvaluationResult } from "@/lib/delegate";
import { cn } from "@/lib/utils";

export function PolicySelector({
  policies,
  selectedPolicyId,
  onSelect,
  result,
}: {
  policies: Policy[];
  selectedPolicyId: string;
  onSelect: (id: string) => void;
  result: EvaluationResult;
}) {
  const selectedPolicy = policies.find((p) => p.id === selectedPolicyId) ?? policies[0];

  return (
    <div className="space-y-5 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-transparent p-6">
      <div>
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-cyan-500/10 text-cyan-400">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
            </svg>
          </div>
          <p className="text-xs font-medium uppercase tracking-widest text-slate-500">Step 1</p>
        </div>
        <h2 className="mt-2 text-xl font-semibold text-white">Select a policy</h2>
      </div>

      {/* Policy tabs */}
      <div className="flex gap-2">
        {policies.map((policy) => (
          <button
            key={policy.id}
            type="button"
            onClick={() => onSelect(policy.id)}
            className={cn(
              "relative rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
              policy.id === selectedPolicyId
                ? "text-white"
                : "text-slate-500 hover:text-slate-300"
            )}
          >
            {policy.id === selectedPolicyId && (
              <motion.div
                layoutId="policy-tab"
                className="absolute inset-0 rounded-xl border border-cyan-500/20 bg-cyan-500/[0.08]"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{policy.name}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.p
          key={selectedPolicy.id}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className="text-sm leading-6 text-slate-500"
        >
          {selectedPolicy.description}
        </motion.p>
      </AnimatePresence>

      {/* Rules */}
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-widest text-slate-600">Policy rules</p>
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedPolicy.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            {selectedPolicy.rules.map((rule, i) => {
              const check = result.checks.find((c) => c.ruleId === rule.id);
              const passed = check?.passed ?? false;

              return (
                <motion.div
                  key={rule.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5 transition-colors hover:bg-white/[0.04]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-200">{rule.label}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-600">{rule.rationale}</p>
                    </div>
                    <motion.span
                      key={`${rule.id}-${passed}`}
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className={cn(
                        "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest",
                        passed
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-rose-500/10 text-rose-400"
                      )}
                    >
                      {passed ? "pass" : "fail"}
                    </motion.span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
