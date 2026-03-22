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
import { useRegisterAgent, useCommitPolicy, useGetAgent } from "@/hooks/use-register-agent";
import { hashObject } from "delegate-sdk";
import type { Policy } from "@/lib/delegate";

export function TrustPanel({ policies }: { policies: Policy[] }) {
  // Register agent state
  const [agentId, setAgentId] = useState("");
  const [metadataURI, setMetadataURI] = useState("");
  const { register, isPending: isRegistering, txHash: registerTx, isSuccess: registerSuccess, isError: registerError, error: registerErr } = useRegisterAgent();

  // Commit policy state
  const [selectedPolicyForCommit, setSelectedPolicyForCommit] = useState(policies[0]?.id ?? "");
  const { commit, isPending: isCommitting, txHash: commitTx, isSuccess: commitSuccess, isError: commitError, error: commitErr } = useCommitPolicy();

  // Lookup agent state
  const [lookupAddress, setLookupAddress] = useState("");
  const [lookupTriggered, setLookupTriggered] = useState(false);
  const { agent, isLoading: isLookingUp, refetch } = useGetAgent(
    lookupTriggered && lookupAddress ? (lookupAddress as `0x${string}`) : undefined
  );

  const handleRegister = async () => {
    if (!agentId) return;
    try { await register(agentId, metadataURI); } catch {}
  };

  const handleCommitPolicy = async () => {
    const policy = policies.find((p) => p.id === selectedPolicyForCommit);
    if (!policy) return;
    const policyHash = hashObject(policy) as `0x${string}`;
    try { await commit(policyHash); } catch {}
  };

  const handleLookup = () => {
    setLookupTriggered(true);
    setTimeout(() => refetch(), 100);
  };

  const zeroHash = "0x0000000000000000000000000000000000000000000000000000000000000000";

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold">Agent Identity Registry</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Register agent identity on-chain, commit to policies, and look up other agents.
        </p>
      </div>

      {/* Register Agent */}
      <div className="rounded-lg border p-4 space-y-3">
        <h4 className="text-sm font-medium">Register Agent</h4>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="agentId">Agent ID</Label>
            <Input id="agentId" value={agentId} onChange={(e) => setAgentId(e.target.value)} placeholder="agent-alpha-001" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="metadataURI">Metadata URI</Label>
            <Input id="metadataURI" value={metadataURI} onChange={(e) => setMetadataURI(e.target.value)} placeholder="ipfs://..." />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" onClick={handleRegister} disabled={isRegistering || !agentId}>
            {isRegistering ? "Registering..." : "Register on-chain"}
          </Button>
          <TxFeedback txHash={registerTx} isPending={isRegistering} isSuccess={registerSuccess} isError={registerError} error={registerErr} />
        </div>
      </div>

      {/* Commit Policy */}
      <div className="rounded-lg border p-4 space-y-3">
        <h4 className="text-sm font-medium">Commit to Policy</h4>
        <div className="space-y-1.5">
          <Label>Policy</Label>
          <Select value={selectedPolicyForCommit} onValueChange={(v) => { if (v) setSelectedPolicyForCommit(v); }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {policies.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" onClick={handleCommitPolicy} disabled={isCommitting}>
            {isCommitting ? "Committing..." : "Commit policy"}
          </Button>
          <TxFeedback txHash={commitTx} isPending={isCommitting} isSuccess={commitSuccess} isError={commitError} error={commitErr} />
        </div>
      </div>

      {/* Lookup Agent */}
      <div className="rounded-lg border p-4 space-y-3">
        <h4 className="text-sm font-medium">Lookup Agent</h4>
        <div className="flex gap-2">
          <Input
            value={lookupAddress}
            onChange={(e) => { setLookupAddress(e.target.value); setLookupTriggered(false); }}
            placeholder="0x... agent address"
            className="flex-1"
          />
          <Button size="sm" onClick={handleLookup} disabled={isLookingUp || !lookupAddress}>
            {isLookingUp ? "Looking up..." : "Lookup"}
          </Button>
        </div>

        {lookupTriggered && agent && (
          <div className="space-y-2 rounded border p-3 bg-muted/30">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Status:</span>
              {agent.agentId !== zeroHash ? (
                <Badge variant="default" className="font-mono text-[10px] uppercase">registered</Badge>
              ) : (
                <Badge variant="destructive" className="font-mono text-[10px] uppercase">not registered</Badge>
              )}
            </div>
            {agent.agentId !== zeroHash && (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Agent ID:</span>
                  <HashDisplay hash={agent.agentId} />
                </div>
                {agent.metadataURI && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Metadata:</span>
                    <span className="font-mono text-xs text-muted-foreground truncate">{agent.metadataURI}</span>
                  </div>
                )}
                {agent.policyHashes.length > 0 && (
                  <div>
                    <span className="text-xs text-muted-foreground">Committed policies ({agent.policyHashes.length}):</span>
                    <div className="mt-1 space-y-1">
                      {agent.policyHashes.map((hash, i) => (
                        <div key={i}><HashDisplay hash={hash} /></div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
