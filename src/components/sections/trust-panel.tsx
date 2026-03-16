"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useRegisterAgent, useCommitPolicy, useGetAgent } from "@/hooks/use-register-agent";
import { hashObject } from "@anthropic-hackathon/delegate-sdk";
import type { Policy } from "@/lib/delegate";

export function TrustPanel({ policies }: { policies: Policy[] }) {
  const { isConnected, address } = useAccount();

  // Register agent state
  const [agentId, setAgentId] = useState("");
  const [metadataURI, setMetadataURI] = useState("");
  const { register, isPending: isRegistering, txHash: registerTx, isSuccess: registerSuccess } = useRegisterAgent();

  // Commit policy state
  const [selectedPolicyForCommit, setSelectedPolicyForCommit] = useState(policies[0]?.id ?? "");
  const { commit, isPending: isCommitting, txHash: commitTx, isSuccess: commitSuccess } = useCommitPolicy();

  // Lookup agent state
  const [lookupAddress, setLookupAddress] = useState("");
  const [lookupTriggered, setLookupTriggered] = useState(false);
  const { agent, isLoading: isLookingUp, refetch } = useGetAgent(
    lookupTriggered && lookupAddress ? (lookupAddress as `0x${string}`) : undefined
  );

  const handleRegister = async () => {
    if (!agentId) return;
    try {
      await register(agentId, metadataURI);
    } catch {
      // error state handled by hook
    }
  };

  const handleCommitPolicy = async () => {
    const policy = policies.find((p) => p.id === selectedPolicyForCommit);
    if (!policy) return;
    const policyHash = hashObject(policy) as `0x${string}`;
    try {
      await commit(policyHash);
    } catch {
      // error state handled by hook
    }
  };

  const handleLookup = () => {
    setLookupTriggered(true);
    setTimeout(() => refetch(), 100);
  };

  if (!isConnected) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        Connect wallet to access Trust features
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Theme: Trust</p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight">Agent Identity Registry</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Register agent identity on-chain. Commit to policies. Verify commitments by address.
        </p>
      </div>

      {/* Register Agent */}
      <div className="rounded-lg border p-4 space-y-3">
        <h3 className="text-sm font-semibold">Register Agent</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="agentId">Agent ID</Label>
            <Input
              id="agentId"
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              placeholder="agent-alpha-001"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="metadataURI">Metadata URI</Label>
            <Input
              id="metadataURI"
              value={metadataURI}
              onChange={(e) => setMetadataURI(e.target.value)}
              placeholder="ipfs://..."
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" onClick={handleRegister} disabled={isRegistering || !agentId}>
            {isRegistering ? "Registering…" : "Register on-chain"}
          </Button>
          {registerSuccess && registerTx && (
            <span className="font-mono text-xs text-muted-foreground truncate max-w-[200px]">
              tx: {registerTx}
            </span>
          )}
        </div>
      </div>

      {/* Commit Policy */}
      <div className="rounded-lg border p-4 space-y-3">
        <h3 className="text-sm font-semibold">Commit to Policy</h3>
        <div className="space-y-1.5">
          <Label>Policy</Label>
          <select
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
            value={selectedPolicyForCommit}
            onChange={(e) => setSelectedPolicyForCommit(e.target.value)}
          >
            {policies.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" onClick={handleCommitPolicy} disabled={isCommitting}>
            {isCommitting ? "Committing…" : "Commit policy"}
          </Button>
          {commitSuccess && commitTx && (
            <span className="font-mono text-xs text-muted-foreground truncate max-w-[200px]">
              tx: {commitTx}
            </span>
          )}
        </div>
      </div>

      {/* Lookup Agent */}
      <div className="rounded-lg border p-4 space-y-3">
        <h3 className="text-sm font-semibold">Lookup Agent</h3>
        <div className="flex gap-2">
          <Input
            value={lookupAddress}
            onChange={(e) => {
              setLookupAddress(e.target.value);
              setLookupTriggered(false);
            }}
            placeholder="0x... agent address"
            className="flex-1"
          />
          <Button size="sm" onClick={handleLookup} disabled={isLookingUp || !lookupAddress}>
            {isLookingUp ? "Looking up…" : "Lookup"}
          </Button>
        </div>

        {lookupTriggered && agent && (
          <div className="space-y-2 rounded border p-3 bg-muted/30">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Agent ID:</span>
              <span className="font-mono text-xs truncate">{agent.agentId}</span>
              {agent.agentId !== "0x0000000000000000000000000000000000000000000000000000000000000000" ? (
                <Badge variant="default" className="font-mono text-[10px] uppercase">registered</Badge>
              ) : (
                <Badge variant="destructive" className="font-mono text-[10px] uppercase">not found</Badge>
              )}
            </div>
            {agent.metadataURI && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Metadata:</span>
                <span className="font-mono text-xs truncate">{agent.metadataURI}</span>
              </div>
            )}
            {agent.policyHashes.length > 0 && (
              <div>
                <span className="text-xs text-muted-foreground">Committed policies:</span>
                <div className="mt-1 space-y-1">
                  {agent.policyHashes.map((hash, i) => (
                    <div key={i} className="font-mono text-[11px] text-muted-foreground truncate">
                      {hash}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
