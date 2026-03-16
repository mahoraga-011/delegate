import type { DelegateConfig, Policy, AgentActionRequest, EvaluationResult, AgentIdentity, Agreement } from "./types.js";
import { evaluatePolicy } from "./engine.js";
import { hashObject } from "./hashing.js";
import {
  createChainClient, attest, verify, registerPolicy,
  registerAgent, commitPolicy, getAgent,
  proposeAgreement, signAgreement, getAgreement,
  recordSpend, getSpentToday, setSpendingLimit,
  type ChainClient,
} from "./chain.js";
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

  /** Register an agent identity on-chain */
  registerAgent: (agentId: `0x${string}`, metadataURI?: string) => Promise<`0x${string}`>;

  /** Commit to a policy as an agent */
  commitPolicy: (policyHash: `0x${string}`) => Promise<`0x${string}`>;

  /** Look up an agent by address */
  getAgent: (address: `0x${string}`) => Promise<AgentIdentity>;

  /** Propose a bilateral agreement */
  proposeAgreement: (policyHash: `0x${string}`, counterparty: `0x${string}`) => Promise<`0x${string}`>;

  /** Sign an agreement as counterparty */
  signAgreement: (agreementId: `0x${string}`) => Promise<`0x${string}`>;

  /** Get agreement details */
  getAgreement: (agreementId: `0x${string}`) => Promise<Agreement>;

  /** Execute a spend through the vault */
  recordSpend: (policyHash: `0x${string}`, recipient: `0x${string}`, amount: bigint) => Promise<`0x${string}`>;

  /** Get amount spent today in vault */
  getSpentToday: (policyHash: `0x${string}`) => Promise<bigint>;

  /** Set spending limits in vault */
  setSpendingLimit: (policyHash: `0x${string}`, agent: `0x${string}`, maxPerTx: bigint, maxPerDay: bigint, allowedRecipients: `0x${string}`[]) => Promise<`0x${string}`>;

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

    registerAgent: (agentId, metadataURI) => {
      if (!chainClient) throw new Error("Chain config required for registerAgent()");
      return registerAgent(chainClient, agentId, metadataURI);
    },

    commitPolicy: (policyHash) => {
      if (!chainClient) throw new Error("Chain config required for commitPolicy()");
      return commitPolicy(chainClient, policyHash);
    },

    getAgent: (address) => {
      if (!chainClient) throw new Error("Chain config required for getAgent()");
      return getAgent(chainClient, address);
    },

    proposeAgreement: (policyHash, counterparty) => {
      if (!chainClient) throw new Error("Chain config required for proposeAgreement()");
      return proposeAgreement(chainClient, policyHash, counterparty);
    },

    signAgreement: (agreementId) => {
      if (!chainClient) throw new Error("Chain config required for signAgreement()");
      return signAgreement(chainClient, agreementId);
    },

    getAgreement: (agreementId) => {
      if (!chainClient) throw new Error("Chain config required for getAgreement()");
      return getAgreement(chainClient, agreementId);
    },

    recordSpend: (policyHash, recipient, amount) => {
      if (!chainClient) throw new Error("Chain config required for recordSpend()");
      return recordSpend(chainClient, policyHash, recipient, amount);
    },

    getSpentToday: (policyHash) => {
      if (!chainClient) throw new Error("Chain config required for getSpentToday()");
      return getSpentToday(chainClient, policyHash);
    },

    setSpendingLimit: (policyHash, agent, maxPerTx, maxPerDay, allowedRecipients) => {
      if (!chainClient) throw new Error("Chain config required for setSpendingLimit()");
      return setSpendingLimit(chainClient, policyHash, agent, maxPerTx, maxPerDay, allowedRecipients);
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
export {
  createChainClient, attest, verify, registerPolicy,
  registerAgent, commitPolicy, getAgent,
  proposeAgreement, signAgreement, getAgreement,
  recordSpend, getSpentToday, setSpendingLimit,
} from "./chain.js";
export { wrap } from "./middleware.js";
export {
  AUDIT_LOG_ABI, REGISTRY_ABI, VERIFIER_ABI,
  AGENT_REGISTRY_ABI, AGREEMENT_ABI, VAULT_ABI,
} from "./chain.js";
export type * from "./types.js";
export type { ChainClient } from "./chain.js";
export type { ToolFunction, WrappedResult } from "./middleware.js";
