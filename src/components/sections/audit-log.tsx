"use client";

import { motion, AnimatePresence } from "motion/react";
import type { AuditEntry } from "@/lib/delegate";
import { cn } from "@/lib/utils";

export function AuditLog({ entries }: { entries: AuditEntry[] }) {
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-transparent p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-cyan-500/10 text-cyan-400">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
            </div>
            <p className="text-xs font-medium uppercase tracking-widest text-slate-500">Step 4</p>
          </div>
          <h2 className="mt-2 text-xl font-semibold text-white">Audit log</h2>
        </div>
        <p className="text-xs leading-5 text-slate-600">
          Append-only record of every policy evaluation.
        </p>
      </div>

      <div className="mt-6">
        {entries.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {entries.map((entry, i) => (
                <motion.article
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, y: -20, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                  }}
                  className="group overflow-hidden rounded-xl border border-white/[0.06] bg-[#070d1a]/60 transition-colors hover:bg-[#0a1220]/80"
                >
                  <div className="p-4 md:p-5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <code className="font-mono text-sm font-semibold text-slate-300">{entry.id}</code>
                          <motion.span
                            key={entry.result.outcome}
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className={cn(
                              "rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em]",
                              entry.result.outcome === "allow"
                                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                                : "border-rose-500/20 bg-rose-500/10 text-rose-400"
                            )}
                          >
                            {entry.result.outcome}
                          </motion.span>
                          <span className="text-[10px] font-medium uppercase tracking-widest text-slate-600">
                            {entry.policyName}
                          </span>
                        </div>
                        <p className="mt-1.5 text-xs text-slate-600">
                          {new Date(entry.timestamp).toLocaleString("en-US", {
                            timeZone: "UTC",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}{" "}
                          UTC
                        </p>
                      </div>
                      <p className="max-w-sm text-xs leading-5 text-slate-500 md:text-right">
                        {entry.request.justification}
                      </p>
                    </div>

                    {/* Meta pills */}
                    <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
                      <MetaPill label="Action" value={entry.request.actionType} />
                      <MetaPill label="Tool" value={entry.request.tool} />
                      <MetaPill
                        label="Risk"
                        value={`${entry.request.risk}/10`}
                        accent={
                          entry.request.risk <= 3
                            ? "emerald"
                            : entry.request.risk <= 6
                              ? "amber"
                              : "rose"
                        }
                      />
                      <MetaPill label="Target" value={entry.request.target} />
                    </div>

                    {/* Rule checks */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {entry.result.checks.map((check) => (
                        <span
                          key={check.ruleId}
                          className={cn(
                            "rounded-md px-2 py-0.5 text-[10px] font-medium",
                            check.passed
                              ? "bg-emerald-500/8 text-emerald-500/70"
                              : "bg-rose-500/8 text-rose-500/70"
                          )}
                        >
                          {check.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
}

function MetaPill({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "emerald" | "amber" | "rose";
}) {
  const valueColor =
    accent === "emerald"
      ? "text-emerald-400"
      : accent === "amber"
        ? "text-amber-400"
        : accent === "rose"
          ? "text-rose-400"
          : "text-slate-300";

  return (
    <div className="rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2">
      <p className="text-[9px] font-medium uppercase tracking-widest text-slate-600">{label}</p>
      <p className={cn("mt-0.5 truncate text-xs font-medium", valueColor)}>{value}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.06] py-16 text-center"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.03]">
        <svg className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </svg>
      </div>
      <p className="mt-4 text-sm font-medium text-slate-500">No audit entries yet</p>
      <p className="mt-1 text-xs text-slate-600">Submit an action request to create the first entry.</p>
    </motion.div>
  );
}
