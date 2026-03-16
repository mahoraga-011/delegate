import type { Policy, AgentActionRequest } from "./types.js";
import type { ChainClient } from "./chain.js";
import { evaluatePolicy } from "./engine.js";
import { attest, recordSpend, VAULT_ABI } from "./chain.js";
import { hashObject } from "./hashing.js";

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

    // If request has amount and vault is configured, route payment through vault
    if (request.amount && request.recipient && chainClient?.contracts.vault) {
      const policyHash = hashObject(policy) as `0x${string}`;
      const amountWei = BigInt(Math.floor(request.amount * 1e18));
      try {
        await recordSpend(chainClient, policyHash, request.recipient as `0x${string}`, amountWei);
      } catch (err) {
        return {
          allowed: false,
          reason: `Vault spend denied: ${err instanceof Error ? err.message : String(err)}`,
        };
      }
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
