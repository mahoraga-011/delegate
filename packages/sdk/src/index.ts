import type { DelegateConfig, Policy, AgentActionRequest, EvaluationResult } from "./types.js";
import { evaluatePolicy } from "./engine.js";
import { hashObject } from "./hashing.js";
import { createChainClient, attest, verify, registerPolicy, type ChainClient } from "./chain.js";
import { wrap, type ToolFunction, type WrappedResult } from "./middleware.js";

export interface DelegateInstance {
  /** Evaluate a policy against a request (pure, deterministic) */
  evaluate: (policy: Policy, request: AgentActionRequest) => EvaluationResult;

  /** Hash any object using canonical JSON → keccak256 */
  hash: (obj: unknown) => `0x${string}`;

  /** Attest a decision on-chain (requires chain config) */
  attest: (policy: Policy, request: AgentActionRequest, result: EvaluationResult) => Promise<`0x${string}`>;

  /** Verify a decision exists on-chain (requires chain config) */
  verify: (policy: Policy, request: AgentActionRequest, result: EvaluationResult) => Promise<boolean>;

  /** Register a policy hash on-chain (requires chain config) */
  registerPolicy: (policy: Policy, metadataURI?: string) => Promise<`0x${string}`>;

  /** Wrap a tool function with policy enforcement + optional attestation */
  wrap: <TArgs extends unknown[], TReturn>(
    policy: Policy,
    toolFn: ToolFunction<TArgs, TReturn>,
    extractRequest: (...args: TArgs) => AgentActionRequest
  ) => (...args: TArgs) => Promise<WrappedResult<TReturn>>;

  /** The configured policies */
  policies: Policy[];

  /** The chain client, if configured */
  chainClient?: ChainClient;
}

/**
 * Create a Delegate instance.
 *
 * Usage:
 * ```ts
 * const delegate = createDelegate({
 *   policies: [myPolicy],
 *   chain: { rpc, privateKey, contracts }
 * })
 *
 * const result = delegate.evaluate(myPolicy, request)
 * const txHash = await delegate.attest(myPolicy, request, result)
 * const valid = await delegate.verify(myPolicy, request, result)
 * ```
 */
export function createDelegate(config: DelegateConfig): DelegateInstance {
  const chainClient = config.chain ? createChainClient(config.chain) : undefined;

  return {
    evaluate: evaluatePolicy,
    hash: hashObject,

    attest: (policy, request, result) => {
      if (!chainClient) throw new Error("Chain config required for attest()");
      return attest(chainClient, policy, request, result);
    },

    verify: (policy, request, result) => {
      if (!chainClient) throw new Error("Chain config required for verify()");
      return verify(chainClient, policy, request, result);
    },

    registerPolicy: (policy, metadataURI) => {
      if (!chainClient) throw new Error("Chain config required for registerPolicy()");
      return registerPolicy(chainClient, policy, metadataURI);
    },

    wrap: (policy, toolFn, extractRequest) => {
      return wrap(policy, toolFn, extractRequest, chainClient);
    },

    policies: config.policies,
    chainClient,
  };
}

// Re-export everything for direct imports
export { evaluatePolicy, evaluateRule } from "./engine.js";
export { hashObject, canonicalize } from "./hashing.js";
export { createChainClient, attest, verify, registerPolicy } from "./chain.js";
export { wrap } from "./middleware.js";
export { AUDIT_LOG_ABI, REGISTRY_ABI, VERIFIER_ABI } from "./chain.js";
export type * from "./types.js";
export type { ChainClient } from "./chain.js";
export type { ToolFunction, WrappedResult } from "./middleware.js";
