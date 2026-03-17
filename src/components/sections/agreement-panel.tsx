"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TxFeedback } from "@/components/tx-feedback";
import { HashDisplay } from "@/components/hash-display";
import { useProposeAgreement, useSignAgreement, useGetAgreement } from "@/hooks/use-agreement";
import { hashObject } from "@delegate/sdk";
import type { Policy } from "@/lib/delegate";

export function AgreementPanel({ policies }: { policies: Policy[] }) {
  // Propose state
  const [selectedPolicyId, setSelectedPolicyId] = useState(policies[0]?.id ?? "");
  const [counterparty, setCounterparty] = useState("");
  const { propose, isPending: isProposing, txHash: proposeTx, isSuccess: proposeSuccess, isError: proposeError, error: proposeErr } = useProposeAgreement();

  // Sign state
  const [signAgreementId, setSignAgreementId] = useState("");
  const { sign, isPending: isSigning, txHash: signTx, isSuccess: signSuccess, isError: signError, error: signErr } = useSignAgreement();

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
    try { await propose(policyHash, counterparty as `0x${string}`); } catch {}
  };

  const handleSign = async () => {
    if (!signAgreementId) return;
    try { await sign(signAgreementId as `0x${string}`); } catch {}
  };

  const handleLookup = () => {
    setLookupTriggered(true);
    setTimeout(() => refetch(), 100);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold">Bilateral Agreements</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Propose agreements under shared policies. Both parties locked to the same immutable rules.
        </p>
      </div>

      {/* Propose Agreement */}
      <div className="rounded-lg border p-4 space-y-3">
        <h4 className="text-sm font-medium">Propose Agreement</h4>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Policy</Label>
            <Select value={selectedPolicyId} onValueChange={(v) => { if (v) setSelectedPolicyId(v); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {policies.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="counterparty">Counterparty address</Label>
            <Input id="counterparty" value={counterparty} onChange={(e) => setCounterparty(e.target.value)} placeholder="0x..." />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" onClick={handlePropose} disabled={isProposing || !counterparty}>
            {isProposing ? "Proposing..." : "Propose + sign"}
          </Button>
          <TxFeedback txHash={proposeTx} isPending={isProposing} isSuccess={proposeSuccess} isError={proposeError} error={proposeErr} />
        </div>
      </div>

      {/* Sign Agreement */}
      <div className="rounded-lg border p-4 space-y-3">
        <h4 className="text-sm font-medium">Sign Agreement</h4>
        <div className="flex gap-2">
          <Input value={signAgreementId} onChange={(e) => setSignAgreementId(e.target.value)} placeholder="0x... agreement ID" className="flex-1" />
          <Button size="sm" onClick={handleSign} disabled={isSigning || !signAgreementId}>
            {isSigning ? "Signing..." : "Sign"}
          </Button>
        </div>
        <TxFeedback txHash={signTx} isPending={isSigning} isSuccess={signSuccess} isError={signError} error={signErr} />
      </div>

      {/* Lookup Agreement */}
      <div className="rounded-lg border p-4 space-y-3">
        <h4 className="text-sm font-medium">Agreement Status</h4>
        <div className="flex gap-2">
          <Input
            value={lookupId}
            onChange={(e) => { setLookupId(e.target.value); setLookupTriggered(false); }}
            placeholder="0x... agreement ID"
            className="flex-1"
          />
          <Button size="sm" onClick={handleLookup} disabled={isLookingUp || !lookupId}>
            {isLookingUp ? "Loading..." : "Lookup"}
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
                <div className="mt-0.5"><HashDisplay hash={agreement.partyA} /></div>
              </div>
              <div>
                <span className="text-muted-foreground">Party B:</span>
                <div className="mt-0.5"><HashDisplay hash={agreement.partyB} /></div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">Policy:</span>
              <HashDisplay hash={agreement.policyHash} />
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
