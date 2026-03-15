"use client";

import { useReadContract } from "wagmi";
import { hashObject } from "@anthropic-hackathon/delegate-sdk";
import { verifierConfig } from "@/lib/contracts";
import type { Policy, AgentActionRequest, EvaluationResult } from "@anthropic-hackathon/delegate-sdk";

export function useVerify(
  policy: Policy | null,
  request: AgentActionRequest | null,
  result: EvaluationResult | null
) {
  const enabled = policy !== null && request !== null && result !== null;

  const policyHash = enabled ? hashObject(policy) : ("0x" as `0x${string}`);
  const requestHash = enabled ? hashObject(request) : ("0x" as `0x${string}`);
  const resultHash = enabled ? hashObject(result) : ("0x" as `0x${string}`);

  const { data: isVerified, isLoading, refetch } = useReadContract({
    ...verifierConfig,
    functionName: "verify",
    args: [policyHash, requestHash, resultHash],
    query: { enabled },
  });

  return { isVerified: isVerified as boolean | undefined, isLoading, refetch };
}
