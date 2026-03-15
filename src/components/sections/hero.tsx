import { Badge } from "@/components/ui/badge";
import type { EvaluationResult, Policy } from "@/lib/delegate";
import { CheckCircle2, ShieldCheck, FileText } from "lucide-react";

export function Hero({
  policy,
  result,
}: {
  policy: Policy;
  result: EvaluationResult;
}) {
  const isAllow = result.outcome === "allow";

  return (
    <section className="space-y-10">
      <div className="space-y-4">
        <h1 className="max-w-xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Policy checks before agents act.
        </h1>
        <p className="max-w-md text-[15px] leading-relaxed text-muted-foreground">
          Define rules. Evaluate deterministically. Keep an audit trail humans can read.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { icon: ShieldCheck, title: "Policy-first", desc: "Explicit, readable rules — not buried in prompts." },
          { icon: CheckCircle2, title: "Deterministic", desc: "Same input, same decision, every time." },
          { icon: FileText, title: "Auditable", desc: "Every decision leaves a forensic breadcrumb." },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50">
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-md border bg-background">
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">{title}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{desc}</p>
          </div>
        ))}
      </div>

      {/* Live decision bar */}
      <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3">
        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">Active policy</span>
          <span className="font-medium">{policy.name}</span>
          <span className="hidden text-muted-foreground sm:inline">·</span>
          <div className="hidden items-center gap-3 sm:flex">
            <span className="font-mono text-xs tabular-nums text-muted-foreground">
              {result.scorecard.passed} passed
            </span>
            <span className="font-mono text-xs tabular-nums text-muted-foreground">
              {result.scorecard.failed} failed
            </span>
          </div>
        </div>
        <Badge
          variant={isAllow ? "default" : "destructive"}
          className="font-mono text-[10px] uppercase tracking-widest"
        >
          {result.outcome}
        </Badge>
      </div>
    </section>
  );
}
