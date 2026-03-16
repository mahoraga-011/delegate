"use client";

import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { vaultConfig } from "@/lib/contracts";
import { parseEther } from "viem";

export function useDeposit() {
  const { writeContractAsync, data: txHash, isPending, isError, error, reset } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const deposit = async (policyHash: `0x${string}`, amountEth: string) => {
    const hash = await writeContractAsync({
      ...vaultConfig,
      functionName: "deposit",
      args: [policyHash],
      value: parseEther(amountEth),
    });
    return hash;
  };

  return { deposit, txHash, isPending, isConfirming, isSuccess, isError, error, reset };
}

export function useSetSpendingLimit() {
  const { writeContractAsync, data: txHash, isPending, isError, error, reset } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const setLimit = async (
    policyHash: `0x${string}`,
    agent: `0x${string}`,
    maxPerTxEth: string,
    maxPerDayEth: string,
    allowedRecipients: `0x${string}`[]
  ) => {
    const hash = await writeContractAsync({
      ...vaultConfig,
      functionName: "setSpendingLimit",
      args: [policyHash, agent, parseEther(maxPerTxEth), parseEther(maxPerDayEth), allowedRecipients],
    });
    return hash;
  };

  return { setLimit, txHash, isPending, isConfirming, isSuccess, isError, error, reset };
}

export function useSpend() {
  const { writeContractAsync, data: txHash, isPending, isError, error, reset } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const spend = async (policyHash: `0x${string}`, recipient: `0x${string}`, amountEth: string) => {
    const hash = await writeContractAsync({
      ...vaultConfig,
      functionName: "spend",
      args: [policyHash, recipient, parseEther(amountEth)],
    });
    return hash;
  };

  return { spend, txHash, isPending, isConfirming, isSuccess, isError, error, reset };
}

export function useVaultBalance(policyHash: `0x${string}` | undefined) {
  const { data, isLoading, refetch } = useReadContract({
    ...vaultConfig,
    functionName: "getBalance",
    args: policyHash ? [policyHash] : undefined,
    query: { enabled: !!policyHash },
  });

  return { balance: data as bigint | undefined, isLoading, refetch };
}

export function useSpentToday(policyHash: `0x${string}` | undefined) {
  const { data, isLoading, refetch } = useReadContract({
    ...vaultConfig,
    functionName: "getSpentToday",
    args: policyHash ? [policyHash] : undefined,
    query: { enabled: !!policyHash },
  });

  return { spentToday: data as bigint | undefined, isLoading, refetch };
}

export function useSpendingLimit(policyHash: `0x${string}` | undefined) {
  const { data, isLoading, refetch } = useReadContract({
    ...vaultConfig,
    functionName: "getSpendingLimit",
    args: policyHash ? [policyHash] : undefined,
    query: { enabled: !!policyHash },
  });

  const limit = data
    ? {
        agent: (data as [string, bigint, bigint, string[]])[0],
        maxPerTx: (data as [string, bigint, bigint, string[]])[1],
        maxPerDay: (data as [string, bigint, bigint, string[]])[2],
        allowedRecipients: (data as [string, bigint, bigint, string[]])[3],
      }
    : null;

  return { limit, isLoading, refetch };
}
