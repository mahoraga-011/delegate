"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { hashObject } from "@anthropic-hackathon/delegate-sdk";
import { auditLogConfig } from "@/lib/contracts";
import type { Policy, AgentActionRequest, EvaluationResult } from "@anthropic-hackathon/delegate-sdk";

export function useAttest() {
  const { writeContractAsync, data: txHash, isPending, isError, error, reset } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const attest = async (
    policy: Policy,
    request: AgentActionRequest,
    result: EvaluationResult
  ): Promise<`0x${string}`> => {
    const policyHash = hashObject(policy);
    const requestHash = hashObject(request);
    const resultHash = hashObject(result);

    const hash = await writeContractAsync({
      ...auditLogConfig,
      functionName: "logDecision",
      args: [policyHash, requestHash, resultHash, result.outcome === "allow"],
    });

    return hash;
  };

  return { attest, txHash, isPending, isConfirming, isSuccess, isError, error, reset };
}
