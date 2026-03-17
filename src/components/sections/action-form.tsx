"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import type { AgentActionRequest, EvaluationResult } from "@/lib/delegate";

export function ActionForm({
  request,
  result,
  onUpdate,
  onSubmit,
  isConnected,
  isAttesting,
}: {
  request: AgentActionRequest;
  result: EvaluationResult;
  onUpdate: <K extends keyof AgentActionRequest>(field: K, value: AgentActionRequest[K]) => void;
  onSubmit: () => void;
  isConnected: boolean;
  isAttesting: boolean;
}) {
  const hasInput = request.actionType || request.tool || request.target;

  return (
    <div className="space-y-6">
      {/* Form */}
      <div className="rounded-lg border p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="actionType">Action type</Label>
            <Input
              id="actionType"
              value={request.actionType}
              onChange={(e) => onUpdate("actionType", e.target.value)}
              placeholder="read, execute, summarize..."
            />
            <p className="text-[11px] text-muted-foreground">What the agent wants to do</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tool">Tool</Label>
            <Input
              id="tool"
              value={request.tool}
              onChange={(e) => onUpdate("tool", e.target.value)}
              placeholder="read, exec, transfer..."
            />
            <p className="text-[11px] text-muted-foreground">Which tool the agent uses</p>
          </div>
          <div className="space-y-1.5">
            <Label>Risk score</Label>
            <div className="flex items-center gap-3 pt-1">
              <Slider
                value={[request.risk]}
                onValueChange={(v) => onUpdate("risk", Array.isArray(v) ? v[0] : v)}
                min={0}
                max={10}
                step={1}
                className="flex-1"
              />
              <span className="w-8 text-right font-mono text-sm tabular-nums text-muted-foreground">
                {request.risk}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">0 = no risk, 10 = critical</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="target">Target</Label>
            <Input
              id="target"
              value={request.target}
              onChange={(e) => onUpdate("target", e.target.value)}
              placeholder="staging-docs, prod-db..."
            />
            <p className="text-[11px] text-muted-foreground">System or resource being accessed</p>
          </div>
        </div>

        <div className="mt-4 space-y-1.5">
          <Label htmlFor="justification">
            Justification <span className="font-normal text-muted-foreground">(logged, not evaluated)</span>
          </Label>
          <Textarea
            id="justification"
            value={request.justification}
            onChange={(e) => onUpdate("justification", e.target.value)}
            placeholder="Why the agent believes this action is needed"
            rows={2}
          />
        </div>
      </div>

      {/* Evaluation result */}
      {hasInput && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Evaluation result</h3>

          <div className="rounded-lg border">
            {result.checks.map((check, i) => (
              <div
                key={check.ruleId}
                className={`flex items-center justify-between gap-4 px-4 py-3 ${
                  i !== result.checks.length - 1 ? "border-b" : ""
                }`}
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">{check.label}</p>
                  <p className="font-mono text-[11px] text-muted-foreground">{check.summary}</p>
                </div>
                <Badge
                  variant={check.passed ? "secondary" : "destructive"}
                  className="shrink-0 font-mono text-[10px] uppercase"
                >
                  {check.passed ? "pass" : "fail"}
                </Badge>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <Badge
              variant={result.outcome === "allow" ? "default" : "destructive"}
              className="font-mono text-xs uppercase tracking-widest"
            >
              {result.outcome}
            </Badge>
            <Button onClick={onSubmit} size="sm" disabled={isAttesting}>
              {isAttesting
                ? "Attesting..."
                : isConnected
                  ? "Attest + log"
                  : "Add to audit log"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
