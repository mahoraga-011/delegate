"use client";

import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import { explorerTxUrl } from "@/lib/contracts";
import type { AuditEntry } from "@/lib/delegate";

export function AuditLog({ entries }: { entries: AuditEntry[] }) {
  return (
    <section className="space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Step 4</p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight">Audit log</h2>
        </div>
        <p className="text-xs tabular-nums text-muted-foreground">
          {entries.length} {entries.length === 1 ? "entry" : "entries"}
        </p>
      </div>

      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-14 text-center">
          <p className="text-sm text-muted-foreground">No audit entries yet.</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Submit an action request to create the first entry.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border">
          {entries.map((entry, i) => (
            <div
              key={entry.id}
              className={`space-y-3 px-4 py-4 ${i !== entries.length - 1 ? "border-b" : ""}`}
            >
              {/* Header row */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{entry.id}</code>
                  <Badge
                    variant={entry.result.outcome === "allow" ? "default" : "destructive"}
                    className="font-mono text-[10px] uppercase tracking-widest"
                  >
                    {entry.result.outcome}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{entry.policyName}</span>
                  {entry.txHash && <TxHashBadge txHash={entry.txHash} />}
                </div>
                <time className="shrink-0 text-xs tabular-nums text-muted-foreground">
                  {new Date(entry.timestamp).toLocaleString("en-US", {
                    timeZone: "UTC",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  UTC
                </time>
              </div>

              {/* Meta grid */}
              <div className="grid grid-cols-4 gap-px overflow-hidden rounded-md border bg-border text-xs">
                <MetaCell label="Action" value={entry.request.actionType} />
                <MetaCell label="Tool" value={entry.request.tool} />
                <MetaCell label="Risk" value={`${entry.request.risk}/10`} />
                <MetaCell label="Target" value={entry.request.target} />
              </div>

              {/* Justification */}
              <p className="text-xs leading-relaxed text-muted-foreground">{entry.request.justification}</p>

              {/* Rule check pills */}
              <div className="flex flex-wrap gap-1.5">
                {entry.result.checks.map((check) => (
                  <Badge
                    key={check.ruleId}
                    variant={check.passed ? "outline" : "destructive"}
                    className="font-normal text-[10px]"
                  >
                    {check.label}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function TxHashBadge({ txHash }: { txHash: string }) {
  const url = explorerTxUrl(txHash);
  const truncated = `${txHash.slice(0, 8)}…${txHash.slice(-6)}`;

  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground transition-colors hover:text-foreground"
      >
        {truncated}
        <ExternalLink className="h-2.5 w-2.5" />
      </a>
    );
  }

  return (
    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
      tx:{truncated}
    </code>
  );
}

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-0.5 truncate font-medium">{value}</p>
    </div>
  );
}
