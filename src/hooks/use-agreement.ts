"use client";

import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { agreementConfig } from "@/lib/contracts";

export function useProposeAgreement() {
  const { writeContractAsync, data: txHash, isPending, isError, error, reset } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const propose = async (policyHash: `0x${string}`, counterparty: `0x${string}`) => {
    const hash = await writeContractAsync({
      ...agreementConfig,
      functionName: "proposeAgreement",
      args: [policyHash, counterparty],
    });
    return hash;
  };

  return { propose, txHash, isPending, isConfirming, isSuccess, isError, error, reset };
}

export function useSignAgreement() {
  const { writeContractAsync, data: txHash, isPending, isError, error, reset } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const sign = async (agreementId: `0x${string}`) => {
    const hash = await writeContractAsync({
      ...agreementConfig,
      functionName: "signAgreement",
      args: [agreementId],
    });
    return hash;
  };

  return { sign, txHash, isPending, isConfirming, isSuccess, isError, error, reset };
}

export function useGetAgreement(agreementId: `0x${string}` | undefined) {
  const { data, isLoading, refetch } = useReadContract({
    ...agreementConfig,
    functionName: "getAgreement",
    args: agreementId ? [agreementId] : undefined,
    query: { enabled: !!agreementId },
  });

  const agreement = data
    ? {
        policyHash: (data as [string, string, string, boolean, boolean, bigint])[0],
        partyA: (data as [string, string, string, boolean, boolean, bigint])[1],
        partyB: (data as [string, string, string, boolean, boolean, bigint])[2],
        signedByA: (data as [string, string, string, boolean, boolean, bigint])[3],
        signedByB: (data as [string, string, string, boolean, boolean, bigint])[4],
        timestamp: (data as [string, string, string, boolean, boolean, bigint])[5],
      }
    : null;

  return { agreement, isLoading, refetch };
}

export function useVerifyCompliance() {
  const { data, isLoading, refetch } = useReadContract({
    ...agreementConfig,
    functionName: "verifyCompliance",
    query: { enabled: false },
  });

  return { isCompliant: data as boolean | undefined, isLoading, refetch };
}
