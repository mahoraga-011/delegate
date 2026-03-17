"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/section-header";
import { useStore, useAllPolicies } from "@/lib/store";
import { samplePolicies } from "@/lib/delegate";
import type { Policy, EvaluationResult } from "@/lib/delegate";
import { Trash2, Copy } from "lucide-react";

export function PolicyList({
  result,
  onCreateNew,
}: {
  result: EvaluationResult;
  onCreateNew: () => void;
}) {
  const allPolicies = useAllPolicies();
  const selectedPolicyId = useStore((s) => s.selectedPolicyId);
  const selectPolicy = useStore((s) => s.selectPolicy);
  const removePolicy = useStore((s) => s.removePolicy);
  const addPolicy = useStore((s) => s.addPolicy);

  const selectedPolicy = allPolicies.find((p) => p.id === selectedPolicyId) ?? allPolicies[0];
  const presetIds = new Set(samplePolicies.map((p) => p.id));

  const handleDuplicate = (policy: Policy) => {
    const copy: Policy = {
      ...policy,
      id: `custom-${Date.now()}`,
      name: `${policy.name} (copy)`,
      rules: policy.rules.map((r) => ({ ...r, id: `${r.id}-copy-${Date.now()}` })),
    };
    addPolicy(copy);
  };

  return (
    <div className="space-y-5">
      <SectionHeader
        id="policies"
        title="Policies"
        description="Select a policy to evaluate against, or create your own."
        action={
          <Button size="sm" onClick={onCreateNew}>
            + Create policy
          </Button>
        }
      />

      {/* Policy cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {allPolicies.map((policy) => {
          const isSelected = policy.id === selectedPolicyId;
          const isPreset = presetIds.has(policy.id);

          return (
            <button
              key={policy.id}
              onClick={() => selectPolicy(policy.id)}
              className={`group rounded-lg border p-4 text-left transition-colors ${
                isSelected
                  ? "border-foreground bg-muted/50"
                  : "border-border hover:border-foreground/30"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{policy.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                    {policy.description}
                  </p>
                </div>
                {isSelected && (
                  <Badge variant="default" className="shrink-0 font-mono text-[10px]">
                    active
                  </Badge>
                )}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {policy.rules.length} rule{policy.rules.length !== 1 ? "s" : ""}
                </span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span
                    role="button"
                    title="Duplicate"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDuplicate(policy);
                    }}
                    className="rounded p-1 hover:bg-muted"
                  >
                    <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                  </span>
                  {!isPreset && (
                    <span
                      role="button"
                      title="Delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        removePolicy(policy.id);
                      }}
                      className="rounded p-1 hover:bg-muted"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected policy rules */}
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Rules for {selectedPolicy.name}
        </p>
        <div className="rounded-lg border">
          {selectedPolicy.rules.map((rule, i) => {
            const check = result.checks.find((c) => c.ruleId === rule.id);
            const passed = check?.passed;

            return (
              <div
                key={rule.id}
                className={`flex items-start justify-between gap-4 px-4 py-3 ${
                  i !== selectedPolicy.rules.length - 1 ? "border-b" : ""
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{rule.label}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{rule.rationale}</p>
                </div>
                {passed !== undefined && (
                  <Badge
                    variant={passed ? "secondary" : "destructive"}
                    className="mt-0.5 shrink-0 font-mono text-[10px] uppercase"
                  >
                    {passed ? "pass" : "fail"}
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
