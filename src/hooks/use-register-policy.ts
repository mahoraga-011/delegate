"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { hashObject } from "@delegate/sdk";
import { registryConfig } from "@/lib/contracts";
import type { Policy } from "@delegate/sdk";

export function useRegisterPolicy() {
  const { writeContractAsync, data: txHash, isPending, isError, error, reset } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const register = async (policy: Policy, metadataURI: string = "") => {
    const policyHash = hashObject(policy);

    const hash = await writeContractAsync({
      ...registryConfig,
      functionName: "registerPolicy",
      args: [policyHash, metadataURI],
    });

    return hash;
  };

  return { register, txHash, isPending, isConfirming, isSuccess, isError, error, reset };
}
