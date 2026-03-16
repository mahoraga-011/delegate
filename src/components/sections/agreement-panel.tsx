"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useProposeAgreement, useSignAgreement, useGetAgreement } from "@/hooks/use-agreement";
import { hashObject } from "@anthropic-hackathon/delegate-sdk";
import type { Policy } from "@/lib/delegate";

export function AgreementPanel({ policies }: { policies: Policy[] }) {
  const { isConnected } = useAccount();

  // Propose state
  const [selectedPolicyId, setSelectedPolicyId] = useState(policies[0]?.id ?? "");
  const [counterparty, setCounterparty] = useState("");
  const { propose, isPending: isProposing, txHash: proposeTx, isSuccess: proposeSuccess } = useProposeAgreement();

  // Sign state
  const [signAgreementId, setSignAgreementId] = useState("");
  const { sign, isPending: isSigning, txHash: signTx, isSuccess: signSuccess } = useSignAgreement();

  // Lookup state
  const [lookupId, setLookupId] = useState("");
  const [lookupTriggered, setLookupTriggered] = useState(false);
  const { agreement, isLoading: isLookingUp, refetch } = useGetAgreement(
    lookupTriggered && lookupId ? (lookupId as `0x${string}`) : undefined
  );

  const handlePropose = async () => {
    const policy = policies.find((p) => p.id === selectedPolicyId);
    if (!policy || !counterparty) return;
    const policyHash = hashObject(policy) as `0x${string}`;
    try {
      await propose(policyHash, counterparty as `0x${string}`);
    } catch {
      // handled by hook
    }
  };

  const handleSign = async () => {
    if (!signAgreementId) return;
    try {
      await sign(signAgreementId as `0x${string}`);
    } catch {
      // handled by hook
    }
  };

  const handleLookup = () => {
    setLookupTriggered(true);
    setTimeout(() => refetch(), 100);
  };

  if (!isConnected) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        Connect wallet to access Cooperate features
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Theme: Cooperate</p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight">Bilateral Agreements</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Propose agreements under shared policies. Both parties locked to the same immutable rules.
        </p>
      </div>

      {/* Propose Agreement */}
      <div className="rounded-lg border p-4 space-y-3">
        <h3 className="text-sm font-semibold">Propose Agreement</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Policy</Label>
            <select
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
              value={selectedPolicyId}
              onChange={(e) => setSelectedPolicyId(e.target.value)}
            >
              {policies.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="counterparty">Counterparty address</Label>
            <Input
              id="counterparty"
              value={counterparty}
              onChange={(e) => setCounterparty(e.target.value)}
              placeholder="0x..."
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" onClick={handlePropose} disabled={isProposing || !counterparty}>
            {isProposing ? "Proposing…" : "Propose + sign"}
          </Button>
          {proposeSuccess && proposeTx && (
            <span className="font-mono text-xs text-muted-foreground truncate max-w-[200px]">
              tx: {proposeTx}
            </span>
          )}
        </div>
      </div>

      {/* Sign Agreement */}
      <div className="rounded-lg border p-4 space-y-3">
        <h3 className="text-sm font-semibold">Sign Agreement</h3>
        <div className="flex gap-2">
          <Input
            value={signAgreementId}
            onChange={(e) => setSignAgreementId(e.target.value)}
            placeholder="0x... agreement ID"
            className="flex-1"
          />
          <Button size="sm" onClick={handleSign} disabled={isSigning || !signAgreementId}>
            {isSigning ? "Signing…" : "Sign"}
          </Button>
        </div>
        {signSuccess && signTx && (
          <span className="font-mono text-xs text-muted-foreground truncate max-w-[200px]">
            tx: {signTx}
          </span>
        )}
      </div>

      {/* Lookup Agreement */}
      <div className="rounded-lg border p-4 space-y-3">
        <h3 className="text-sm font-semibold">Agreement Status</h3>
        <div className="flex gap-2">
          <Input
            value={lookupId}
            onChange={(e) => {
              setLookupId(e.target.value);
              setLookupTriggered(false);
            }}
            placeholder="0x... agreement ID"
            className="flex-1"
          />
          <Button size="sm" onClick={handleLookup} disabled={isLookingUp || !lookupId}>
            {isLookingUp ? "Loading…" : "Lookup"}
          </Button>
        </div>

        {lookupTriggered && agreement && (
          <div className="space-y-2 rounded border p-3 bg-muted/30">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Status:</span>
              {agreement.signedByA && agreement.signedByB ? (
                <Badge variant="default" className="font-mono text-[10px] uppercase">finalized</Badge>
              ) : agreement.signedByA ? (
                <Badge variant="secondary" className="font-mono text-[10px] uppercase">pending countersign</Badge>
              ) : (
                <Badge variant="destructive" className="font-mono text-[10px] uppercase">not found</Badge>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Party A:</span>
                <p className="font-mono truncate">{agreement.partyA}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Party B:</span>
                <p className="font-mono truncate">{agreement.partyB}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">Policy hash:</span>
              <span className="font-mono truncate">{agreement.policyHash}</span>
            </div>
            <div className="flex gap-2">
              <Badge variant={agreement.signedByA ? "default" : "secondary"} className="font-mono text-[10px]">
                A: {agreement.signedByA ? "signed" : "pending"}
              </Badge>
              <Badge variant={agreement.signedByB ? "default" : "secondary"} className="font-mono text-[10px]">
                B: {agreement.signedByB ? "signed" : "pending"}
              </Badge>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
