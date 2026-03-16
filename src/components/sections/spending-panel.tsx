"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { hashObject } from "@anthropic-hackathon/delegate-sdk";
import {
  useDeposit,
  useSetSpendingLimit,
  useSpend,
  useVaultBalance,
  useSpentToday,
  useSpendingLimit,
} from "@/hooks/use-spending";
import type { Policy } from "@/lib/delegate";
import { formatEther } from "viem";

export function SpendingPanel({ policies }: { policies: Policy[] }) {
  const { isConnected } = useAccount();

  const [selectedPolicyId, setSelectedPolicyId] = useState(policies[0]?.id ?? "");
  const selectedPolicy = policies.find((p) => p.id === selectedPolicyId) ?? policies[0];
  const policyHash = selectedPolicy ? (hashObject(selectedPolicy) as `0x${string}`) : undefined;

  // Deposit
  const [depositAmount, setDepositAmount] = useState("1");
  const { deposit, isPending: isDepositing, txHash: depositTx, isSuccess: depositSuccess } = useDeposit();

  // Spending limits
  const [limitAgent, setLimitAgent] = useState("");
  const [maxPerTx, setMaxPerTx] = useState("0.1");
  const [maxPerDay, setMaxPerDay] = useState("0.5");
  const [allowedRecipients, setAllowedRecipients] = useState("");
  const { setLimit, isPending: isSettingLimit, txHash: limitTx, isSuccess: limitSuccess } = useSetSpendingLimit();

  // Spend
  const [spendRecipient, setSpendRecipient] = useState("");
  const [spendAmount, setSpendAmount] = useState("0.05");
  const { spend, isPending: isSpending, txHash: spendTx, isSuccess: spendSuccess, isError: spendError, error: spendErrorMsg } = useSpend();

  // Vault info
  const { balance, refetch: refetchBalance } = useVaultBalance(policyHash);
  const { spentToday, refetch: refetchSpent } = useSpentToday(policyHash);
  const { limit } = useSpendingLimit(policyHash);

  const refreshAll = () => {
    refetchBalance();
    refetchSpent();
  };

  const handleDeposit = async () => {
    if (!policyHash || !depositAmount) return;
    try {
      await deposit(policyHash, depositAmount);
      setTimeout(refreshAll, 2000);
    } catch {
      // handled by hook
    }
  };

  const handleSetLimit = async () => {
    if (!policyHash || !limitAgent) return;
    const recipients = allowedRecipients
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean) as `0x${string}`[];
    try {
      await setLimit(policyHash, limitAgent as `0x${string}`, maxPerTx, maxPerDay, recipients);
    } catch {
      // handled by hook
    }
  };

  const handleSpend = async () => {
    if (!policyHash || !spendRecipient || !spendAmount) return;
    try {
      await spend(policyHash, spendRecipient as `0x${string}`, spendAmount);
      setTimeout(refreshAll, 2000);
    } catch {
      // handled by hook
    }
  };

  if (!isConnected) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        Connect wallet to access Pay features
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Theme: Pay</p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight">Vault & Spending</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Deposit ETH, set agent spending limits, execute payments through the vault.
        </p>
      </div>

      {/* Policy selector */}
      <div className="space-y-1.5">
        <Label>Policy</Label>
        <select
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
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

      {/* Vault info */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border p-3 text-center">
          <p className="text-xs text-muted-foreground">Vault balance</p>
          <p className="text-lg font-bold font-mono">
            {balance !== undefined ? formatEther(balance) : "—"} <span className="text-xs font-normal">ETH</span>
          </p>
        </div>
        <div className="rounded-lg border p-3 text-center">
          <p className="text-xs text-muted-foreground">Spent today</p>
          <p className="text-lg font-bold font-mono">
            {spentToday !== undefined ? formatEther(spentToday) : "—"} <span className="text-xs font-normal">ETH</span>
          </p>
        </div>
        <div className="rounded-lg border p-3 text-center">
          <p className="text-xs text-muted-foreground">Daily limit</p>
          <p className="text-lg font-bold font-mono">
            {limit ? formatEther(limit.maxPerDay) : "—"} <span className="text-xs font-normal">ETH</span>
          </p>
        </div>
      </div>

      {/* Deposit */}
      <div className="rounded-lg border p-4 space-y-3">
        <h3 className="text-sm font-semibold">Deposit ETH</h3>
        <div className="flex gap-2">
          <Input
            type="number"
            step="0.01"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            placeholder="1.0"
            className="w-32"
          />
          <Button size="sm" onClick={handleDeposit} disabled={isDepositing}>
            {isDepositing ? "Depositing…" : "Deposit"}
          </Button>
          {depositSuccess && depositTx && (
            <span className="font-mono text-xs text-muted-foreground truncate max-w-[200px] self-center">
              tx: {depositTx}
            </span>
          )}
        </div>
      </div>

      {/* Set Spending Limit */}
      <div className="rounded-lg border p-4 space-y-3">
        <h3 className="text-sm font-semibold">Set Spending Limits</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Agent address</Label>
            <Input
              value={limitAgent}
              onChange={(e) => setLimitAgent(e.target.value)}
              placeholder="0x..."
            />
          </div>
          <div className="space-y-1.5">
            <Label>Max per tx (ETH)</Label>
            <Input
              type="number"
              step="0.01"
              value={maxPerTx}
              onChange={(e) => setMaxPerTx(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Max per day (ETH)</Label>
            <Input
              type="number"
              step="0.01"
              value={maxPerDay}
              onChange={(e) => setMaxPerDay(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Allowed recipients (comma-separated)</Label>
            <Input
              value={allowedRecipients}
              onChange={(e) => setAllowedRecipients(e.target.value)}
              placeholder="0x..., 0x..."
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" onClick={handleSetLimit} disabled={isSettingLimit || !limitAgent}>
            {isSettingLimit ? "Setting…" : "Set limits"}
          </Button>
          {limitSuccess && limitTx && (
            <span className="font-mono text-xs text-muted-foreground truncate max-w-[200px]">
              tx: {limitTx}
            </span>
          )}
        </div>
      </div>

      {/* Execute Spend */}
      <div className="rounded-lg border p-4 space-y-3">
        <h3 className="text-sm font-semibold">Execute Payment</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Recipient</Label>
            <Input
              value={spendRecipient}
              onChange={(e) => setSpendRecipient(e.target.value)}
              placeholder="0x..."
            />
          </div>
          <div className="space-y-1.5">
            <Label>Amount (ETH)</Label>
            <Input
              type="number"
              step="0.01"
              value={spendAmount}
              onChange={(e) => setSpendAmount(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" onClick={handleSpend} disabled={isSpending || !spendRecipient}>
            {isSpending ? "Executing…" : "Spend through vault"}
          </Button>
          {spendSuccess && spendTx && (
            <Badge variant="default" className="font-mono text-[10px] uppercase">allowed</Badge>
          )}
          {spendError && (
            <Badge variant="destructive" className="font-mono text-[10px] uppercase">denied</Badge>
          )}
        </div>
        {spendSuccess && spendTx && (
          <span className="font-mono text-xs text-muted-foreground truncate block">
            tx: {spendTx}
          </span>
        )}
        {spendError && spendErrorMsg && (
          <p className="text-xs text-destructive truncate">
            {spendErrorMsg.message?.includes("ExceedsMaxPerTx")
              ? "Denied: exceeds per-transaction limit"
              : spendErrorMsg.message?.includes("ExceedsMaxPerDay")
                ? "Denied: exceeds daily spending limit"
                : spendErrorMsg.message?.includes("RecipientNotAllowed")
                  ? "Denied: recipient not in allowlist"
                  : spendErrorMsg.message?.includes("NotAuthorizedAgent")
                    ? "Denied: not authorized agent"
                    : spendErrorMsg.message?.includes("InsufficientBalance")
                      ? "Denied: insufficient vault balance"
                      : "Transaction denied by vault"}
          </p>
        )}
      </div>
    </div>
  );
}
