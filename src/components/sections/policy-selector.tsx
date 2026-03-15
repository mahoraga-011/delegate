"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import type { Policy, EvaluationResult } from "@/lib/delegate";

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
    <div className="space-y-5">
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Step 1</p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight">Select a policy</h2>
      </div>

      <Tabs value={selectedPolicyId} onValueChange={onSelect}>
        <TabsList>
          {policies.map((policy) => (
            <TabsTrigger key={policy.id} value={policy.id}>
              {policy.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {policies.map((policy) => (
          <TabsContent key={policy.id} value={policy.id}>
            <p className="text-sm leading-relaxed text-muted-foreground">{policy.description}</p>
          </TabsContent>
        ))}
      </Tabs>

      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Rules</p>
        <div className="rounded-lg border">
          {selectedPolicy.rules.map((rule, i) => {
            const check = result.checks.find((c) => c.ruleId === rule.id);
            const passed = check?.passed ?? false;

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
                <Badge
                  variant={passed ? "secondary" : "destructive"}
                  className="mt-0.5 shrink-0 font-mono text-[10px] uppercase"
                >
                  {passed ? "pass" : "fail"}
                </Badge>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
