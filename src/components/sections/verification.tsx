"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useVerify } from "@/hooks/use-verify";
import { evaluatePolicy, type Policy, type AgentActionRequest } from "@/lib/delegate";

export function Verification({ policies }: { policies: Policy[] }) {
  const { isConnected } = useAccount();
  const [selectedPolicyId, setSelectedPolicyId] = useState(policies[0].id);
  const [requestJson, setRequestJson] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);
  const [verifyTarget, setVerifyTarget] = useState<{
    policy: Policy;
    request: AgentActionRequest;
    result: ReturnType<typeof evaluatePolicy>;
  } | null>(null);

  const { isVerified, isLoading, refetch } = useVerify(
    verifyTarget?.policy ?? null,
    verifyTarget?.request ?? null,
    verifyTarget?.result ?? null
  );

  const handleVerify = () => {
    setParseError(null);
    setVerifyTarget(null);

    const policy = policies.find((p) => p.id === selectedPolicyId);
    if (!policy) return;

    try {
      const request = JSON.parse(requestJson) as AgentActionRequest;
      if (!request.actionType || !request.tool || request.risk === undefined || !request.target) {
        setParseError("JSON must have actionType, tool, risk, target, justification fields.");
        return;
      }
      const result = evaluatePolicy(policy, request);
      setVerifyTarget({ policy, request, result });
      // refetch will trigger automatically since enabled changes
      setTimeout(() => refetch(), 100);
    } catch {
      setParseError("Invalid JSON. Paste a valid AgentActionRequest object.");
    }
  };

  if (!isConnected) return null;

  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          On-chain verification
        </p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight">Verify a decision</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Re-evaluate a request against a policy, hash it, and check if the decision exists on-chain.
        </p>
      </div>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="space-y-1.5">
          <Label>Policy</Label>
          <Select value={selectedPolicyId} onValueChange={setSelectedPolicyId}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {policies.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Request JSON</Label>
          <Textarea
            value={requestJson}
            onChange={(e) => setRequestJson(e.target.value)}
            placeholder={`{"actionType":"read","tool":"read","risk":2,"target":"staging-docs-bucket","justification":"..."}`}
            rows={3}
            className="font-mono text-xs"
          />
          {parseError && <p className="text-xs text-destructive">{parseError}</p>}
        </div>

        <div className="flex items-center gap-3">
          <Button size="sm" onClick={handleVerify} disabled={isLoading || !requestJson.trim()}>
            {isLoading ? "Checking…" : "Verify on-chain"}
          </Button>

          {verifyTarget && isVerified !== undefined && (
            <div className="flex items-center gap-2">
              <Badge
                variant={isVerified ? "default" : "destructive"}
                className="font-mono text-[10px] uppercase tracking-widest"
              >
                {isVerified ? "verified" : "not found"}
              </Badge>
              {verifyTarget && (
                <Badge
                  variant={verifyTarget.result.outcome === "allow" ? "secondary" : "destructive"}
                  className="font-mono text-[10px] uppercase"
                >
                  {verifyTarget.result.outcome}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
