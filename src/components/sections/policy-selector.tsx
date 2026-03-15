"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRegisterPolicy } from "@/hooks/use-register-policy";
import type { Policy, EvaluationResult } from "@/lib/delegate";

export function PolicySelector({
  policies,
  selectedPolicyId,
  onSelect,
  result,
  isConnected,
}: {
  policies: Policy[];
  selectedPolicyId: string;
  onSelect: (id: string) => void;
  result: EvaluationResult;
  isConnected: boolean;
}) {
  const selectedPolicy = policies.find((p) => p.id === selectedPolicyId) ?? policies[0];
  const { register, txHash, isPending, isSuccess } = useRegisterPolicy();

  const handleRegister = async () => {
    try {
      await register(selectedPolicy);
    } catch {
      // registration failed
    }
  };

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

      {/* Register on-chain */}
      {isConnected && (
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleRegister} disabled={isPending}>
            {isPending ? "Registering…" : "Register on-chain"}
          </Button>
          {isSuccess && txHash && (
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
              {txHash.slice(0, 10)}…{txHash.slice(-6)}
            </code>
          )}
        </div>
      )}

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
