"use client";

import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { agentRegistryConfig } from "@/lib/contracts";
import { keccak256, toHex } from "viem";

export function useRegisterAgent() {
  const { writeContractAsync, data: txHash, isPending, isError, error, reset } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const register = async (agentId: string, metadataURI: string = "") => {
    const agentIdHash = keccak256(toHex(agentId));

    const hash = await writeContractAsync({
      ...agentRegistryConfig,
      functionName: "registerAgent",
      args: [agentIdHash, metadataURI],
    });

    return hash;
  };

  return { register, txHash, isPending, isConfirming, isSuccess, isError, error, reset };
}

export function useCommitPolicy() {
  const { writeContractAsync, data: txHash, isPending, isError, error, reset } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const commit = async (policyHash: `0x${string}`) => {
    const hash = await writeContractAsync({
      ...agentRegistryConfig,
      functionName: "commitPolicy",
      args: [policyHash],
    });
    return hash;
  };

  return { commit, txHash, isPending, isConfirming, isSuccess, isError, error, reset };
}

export function useGetAgent(address: `0x${string}` | undefined) {
  const { data, isLoading, refetch } = useReadContract({
    ...agentRegistryConfig,
    functionName: "getAgent",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const agent = data
    ? {
        agentId: (data as [string, string, string[]])[0],
        metadataURI: (data as [string, string, string[]])[1],
        policyHashes: (data as [string, string, string[]])[2],
      }
    : null;

  return { agent, isLoading, refetch };
}
