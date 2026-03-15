import type { Policy, AgentActionRequest } from "./types.js";
import type { ChainClient } from "./chain.js";
import { evaluatePolicy } from "./engine.js";
import { attest } from "./chain.js";

export type ToolFunction<TArgs extends unknown[] = unknown[], TReturn = unknown> = (
  ...args: TArgs
) => TReturn | Promise<TReturn>;

export type WrappedResult<TReturn> = {
  allowed: boolean;
  result?: TReturn;
  txHash?: `0x${string}`;
  reason: string;
};

/**
 * Wrap a tool function with policy evaluation and optional on-chain attestation.
 *
 * The `extractRequest` function converts tool arguments into an AgentActionRequest
 * for policy evaluation.
 */
export function wrap<TArgs extends unknown[], TReturn>(
  policy: Policy,
  toolFn: ToolFunction<TArgs, TReturn>,
  extractRequest: (...args: TArgs) => AgentActionRequest,
  chainClient?: ChainClient
): (...args: TArgs) => Promise<WrappedResult<TReturn>> {
  return async (...args: TArgs): Promise<WrappedResult<TReturn>> => {
    const request = extractRequest(...args);
    const evaluation = evaluatePolicy(policy, request);

    if (evaluation.outcome !== "allow") {
      let txHash: `0x${string}` | undefined;
      if (chainClient) {
        txHash = await attest(chainClient, policy, request, evaluation);
      }
      return {
        allowed: false,
        reason: evaluation.reason,
        txHash,
      };
    }

    // Policy allows — execute the tool
    const result = await toolFn(...args);

    let txHash: `0x${string}` | undefined;
    if (chainClient) {
      txHash = await attest(chainClient, policy, request, evaluation);
    }

    return {
      allowed: true,
      result,
      reason: evaluation.reason,
      txHash,
    };
  };
}
