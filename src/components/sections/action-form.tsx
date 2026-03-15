"use client";

import { motion } from "motion/react";
import type { AgentActionRequest, EvaluationResult } from "@/lib/delegate";
import { cn } from "@/lib/utils";
import { Button as MovingBorderButton } from "@/components/ui/moving-border";

export function ActionForm({
  request,
  result,
  onUpdate,
  onSubmit,
}: {
  request: AgentActionRequest;
  result: EvaluationResult;
  onUpdate: <K extends keyof AgentActionRequest>(field: K, value: AgentActionRequest[K]) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-transparent p-6">
      <div>
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-cyan-500/10 text-cyan-400">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
            </svg>
          </div>
          <p className="text-xs font-medium uppercase tracking-widest text-slate-500">Step 2</p>
        </div>
        <h2 className="mt-2 text-xl font-semibold text-white">Agent action request</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <InputField
          label="Action type"
          value={request.actionType}
          onChange={(v) => onUpdate("actionType", v)}
          placeholder="read / summarize / execute"
        />
        <InputField
          label="Tool"
          value={request.tool}
          onChange={(v) => onUpdate("tool", v)}
          placeholder="read / exec / network"
        />

        <div>
          <label className="block text-xs font-medium uppercase tracking-widest text-slate-500">
            Risk score
          </label>
          <div className="mt-2.5 rounded-xl border border-white/[0.06] bg-[#070d1a] px-4 py-3">
            <input
              type="range"
              min={0}
              max={10}
              step={1}
              value={request.risk}
              onChange={(e) => onUpdate("risk", Number(e.target.value))}
              className="w-full accent-cyan-400"
            />
            <div className="mt-1.5 flex items-center justify-between text-xs">
              <span className="text-slate-600">0</span>
              <span className={cn(
                "font-semibold tabular-nums",
                request.risk <= 3 ? "text-emerald-400" : request.risk <= 6 ? "text-amber-400" : "text-rose-400"
              )}>
                {request.risk}/10
              </span>
              <span className="text-slate-600">10</span>
            </div>
          </div>
        </div>

        <InputField
          label="Target"
          value={request.target}
          onChange={(v) => onUpdate("target", v)}
          placeholder="staging-docs-bucket"
        />
      </div>

      <div>
        <label className="block text-xs font-medium uppercase tracking-widest text-slate-500">
          Justification
          <span className="ml-2 normal-case tracking-normal text-slate-600">(audit trail only — not evaluated by policy)</span>
        </label>
        <textarea
          value={request.justification}
          onChange={(e) => onUpdate("justification", e.target.value)}
          className="input mt-2.5 min-h-20 resize-y"
          placeholder="Why the agent believes this action is needed"
        />
      </div>

      {/* Evaluation section */}
      <div className="rounded-xl border border-white/[0.06] bg-[#060c18] p-5">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-cyan-500/10 text-cyan-400">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>
          <p className="text-xs font-medium uppercase tracking-widest text-slate-500">Step 3</p>
        </div>
        <h3 className="mt-2 text-lg font-semibold text-white">Evaluation results</h3>

        <div className="mt-4 space-y-2">
          {result.checks.map((check, i) => (
            <motion.div
              key={check.ruleId}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3.5"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-200">{check.label}</p>
                  <p className="mt-0.5 font-mono text-[11px] text-slate-600">{check.summary}</p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest",
                    check.passed
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-rose-500/10 text-rose-400"
                  )}
                >
                  {check.passed ? "pass" : "fail"}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between gap-4">
          <motion.div
            key={result.outcome}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn(
              "rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em]",
              result.outcome === "allow"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : "border-rose-500/30 bg-rose-500/10 text-rose-300"
            )}
          >
            {result.outcome}
          </motion.div>

          <MovingBorderButton
            borderRadius="0.75rem"
            containerClassName="h-11 w-auto"
            className="px-5 text-sm font-semibold"
            onClick={onSubmit}
          >
            Add to audit log
          </MovingBorderButton>
        </div>
      </div>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium uppercase tracking-widest text-slate-500">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input mt-2.5"
        placeholder={placeholder}
      />
    </div>
  );
}
