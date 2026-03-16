import {
  createPublicClient,
  createWalletClient,
  defineChain,
  http,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import type { ChainConfig, EvaluationResult, AgentActionRequest, Policy, AgentIdentity, Agreement } from "./types.js";
import { hashObject } from "./hashing.js";

// Contract ABIs (minimal — just the functions we call)
export const AUDIT_LOG_ABI = [
  {
    type: "function",
    name: "logDecision",
    inputs: [
      { name: "policyHash", type: "bytes32" },
      { name: "requestHash", type: "bytes32" },
      { name: "resultHash", type: "bytes32" },
      { name: "allowed", type: "bool" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "DecisionLogged",
    inputs: [
      { name: "agent", type: "address", indexed: true },
      { name: "policyHash", type: "bytes32", indexed: true },
      { name: "requestHash", type: "bytes32", indexed: false },
      { name: "resultHash", type: "bytes32", indexed: false },
      { name: "allowed", type: "bool", indexed: false },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
] as const;

export const REGISTRY_ABI = [
  {
    type: "function",
    name: "registerPolicy",
    inputs: [
      { name: "policyHash", type: "bytes32" },
      { name: "metadataURI", type: "string" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getPolicy",
    inputs: [{ name: "policyHash", type: "bytes32" }],
    outputs: [
      { name: "registrant", type: "address" },
      { name: "timestamp", type: "uint256" },
      { name: "metadataURI", type: "string" },
    ],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "PolicyRegistered",
    inputs: [
      { name: "registrant", type: "address", indexed: true },
      { name: "policyHash", type: "bytes32", indexed: true },
      { name: "metadataURI", type: "string", indexed: false },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
] as const;

export const VERIFIER_ABI = [
  {
    type: "function",
    name: "verify",
    inputs: [
      { name: "policyHash", type: "bytes32" },
      { name: "requestHash", type: "bytes32" },
      { name: "resultHash", type: "bytes32" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
] as const;

export const AGENT_REGISTRY_ABI = [
  {
    type: "function",
    name: "registerAgent",
    inputs: [
      { name: "agentId", type: "bytes32" },
      { name: "metadataURI", type: "string" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "commitPolicy",
    inputs: [{ name: "policyHash", type: "bytes32" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getAgent",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [
      { name: "agentId", type: "bytes32" },
      { name: "metadataURI", type: "string" },
      { name: "policyHashes", type: "bytes32[]" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isRegistered",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "AgentRegistered",
    inputs: [
      { name: "owner", type: "address", indexed: true },
      { name: "agentId", type: "bytes32", indexed: true },
      { name: "metadataURI", type: "string", indexed: false },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "PolicyCommitted",
    inputs: [
      { name: "owner", type: "address", indexed: true },
      { name: "policyHash", type: "bytes32", indexed: true },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
] as const;

export const AGREEMENT_ABI = [
  {
    type: "function",
    name: "proposeAgreement",
    inputs: [
      { name: "policyHash", type: "bytes32" },
      { name: "counterparty", type: "address" },
    ],
    outputs: [{ name: "agreementId", type: "bytes32" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "signAgreement",
    inputs: [{ name: "agreementId", type: "bytes32" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "verifyCompliance",
    inputs: [
      { name: "agreementId", type: "bytes32" },
      { name: "requestHash", type: "bytes32" },
      { name: "resultHash", type: "bytes32" },
    ],
    outputs: [{ name: "compliant", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getAgreement",
    inputs: [{ name: "agreementId", type: "bytes32" }],
    outputs: [
      { name: "policyHash", type: "bytes32" },
      { name: "partyA", type: "address" },
      { name: "partyB", type: "address" },
      { name: "signedByA", type: "bool" },
      { name: "signedByB", type: "bool" },
      { name: "timestamp", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "AgreementProposed",
    inputs: [
      { name: "agreementId", type: "bytes32", indexed: true },
      { name: "policyHash", type: "bytes32", indexed: true },
      { name: "partyA", type: "address", indexed: true },
      { name: "partyB", type: "address", indexed: false },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "AgreementFinalized",
    inputs: [
      { name: "agreementId", type: "bytes32", indexed: true },
      { name: "partyA", type: "address", indexed: true },
      { name: "partyB", type: "address", indexed: true },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
] as const;

export const VAULT_ABI = [
  {
    type: "function",
    name: "deposit",
    inputs: [{ name: "policyHash", type: "bytes32" }],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "setSpendingLimit",
    inputs: [
      { name: "policyHash", type: "bytes32" },
      { name: "agent", type: "address" },
      { name: "maxPerTx", type: "uint256" },
      { name: "maxPerDay", type: "uint256" },
      { name: "allowedRecipients", type: "address[]" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "spend",
    inputs: [
      { name: "policyHash", type: "bytes32" },
      { name: "recipient", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "withdraw",
    inputs: [{ name: "policyHash", type: "bytes32" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getBalance",
    inputs: [{ name: "policyHash", type: "bytes32" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getSpentToday",
    inputs: [{ name: "policyHash", type: "bytes32" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getSpendingLimit",
    inputs: [{ name: "policyHash", type: "bytes32" }],
    outputs: [
      { name: "agent", type: "address" },
      { name: "maxPerTx", type: "uint256" },
      { name: "maxPerDay", type: "uint256" },
      { name: "allowedRecipients", type: "address[]" },
    ],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "Deposited",
    inputs: [
      { name: "policyHash", type: "bytes32", indexed: true },
      { name: "depositor", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "SpendingLimitSet",
    inputs: [
      { name: "policyHash", type: "bytes32", indexed: true },
      { name: "agent", type: "address", indexed: true },
      { name: "maxPerTx", type: "uint256", indexed: false },
      { name: "maxPerDay", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "SpendExecuted",
    inputs: [
      { name: "policyHash", type: "bytes32", indexed: true },
      { name: "agent", type: "address", indexed: true },
      { name: "recipient", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "SpendDenied",
    inputs: [
      { name: "policyHash", type: "bytes32", indexed: true },
      { name: "agent", type: "address", indexed: true },
      { name: "recipient", type: "address", indexed: false },
      { name: "amount", type: "uint256", indexed: false },
      { name: "reason", type: "string", indexed: false },
    ],
  },
  {
    type: "event",
    name: "Withdrawn",
    inputs: [
      { name: "policyHash", type: "bytes32", indexed: true },
      { name: "owner", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
] as const;

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ChainClient {
  publicClient: any;
  walletClient: any;
  contracts: ChainConfig["contracts"];
}

export function createChainClient(config: ChainConfig): ChainClient {
  const account = privateKeyToAccount(config.privateKey as `0x${string}`);
  const chain = config.chainId
    ? defineChain({ id: config.chainId, name: "custom", nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 }, rpcUrls: { default: { http: [config.rpc] } } })
    : baseSepolia;

  const publicClient = createPublicClient({
    chain,
    transport: http(config.rpc),
  });

  const walletClient = createWalletClient({
    account,
    chain,
    transport: http(config.rpc),
  });

  return { publicClient, walletClient, contracts: config.contracts };
}

/**
 * Attest a policy decision on-chain via the AuditLog contract.
 * Returns the transaction hash.
 */
export async function attest(
  client: ChainClient,
  policy: Policy,
  request: AgentActionRequest,
  result: EvaluationResult
): Promise<`0x${string}`> {
  const policyHash = hashObject(policy);
  const requestHash = hashObject(request);
  const resultHash = hashObject(result);

  const txHash = await (client.walletClient as any).writeContract({
    address: client.contracts.auditLog,
    abi: AUDIT_LOG_ABI,
    functionName: "logDecision",
    args: [policyHash, requestHash, resultHash, result.outcome === "allow"],
  });

  return txHash;
}

/**
 * Verify a decision exists on-chain via the Verifier contract.
 */
export async function verify(
  client: ChainClient,
  policy: Policy,
  request: AgentActionRequest,
  result: EvaluationResult
): Promise<boolean> {
  const policyHash = hashObject(policy);
  const requestHash = hashObject(request);
  const resultHash = hashObject(result);

  const isValid = await (client.publicClient as any).readContract({
    address: client.contracts.verifier,
    abi: VERIFIER_ABI,
    functionName: "verify",
    args: [policyHash, requestHash, resultHash],
  });

  return isValid as boolean;
}

/**
 * Register a policy hash on-chain via the Registry contract.
 */
export async function registerPolicy(
  client: ChainClient,
  policy: Policy,
  metadataURI: string = ""
): Promise<`0x${string}`> {
  const policyHash = hashObject(policy);

  const txHash = await (client.walletClient as any).writeContract({
    address: client.contracts.registry,
    abi: REGISTRY_ABI,
    functionName: "registerPolicy",
    args: [policyHash, metadataURI],
  });

  return txHash;
}

// ── Agent Registry ──

/**
 * Register an agent identity on-chain.
 */
export async function registerAgent(
  client: ChainClient,
  agentId: `0x${string}`,
  metadataURI: string = ""
): Promise<`0x${string}`> {
  if (!client.contracts.agentRegistry) throw new Error("agentRegistry contract not configured");

  const txHash = await (client.walletClient as any).writeContract({
    address: client.contracts.agentRegistry,
    abi: AGENT_REGISTRY_ABI,
    functionName: "registerAgent",
    args: [agentId, metadataURI],
  });

  return txHash;
}

/**
 * Commit to a policy (agent must be registered, policy must exist in registry).
 */
export async function commitPolicy(
  client: ChainClient,
  policyHash: `0x${string}`
): Promise<`0x${string}`> {
  if (!client.contracts.agentRegistry) throw new Error("agentRegistry contract not configured");

  const txHash = await (client.walletClient as any).writeContract({
    address: client.contracts.agentRegistry,
    abi: AGENT_REGISTRY_ABI,
    functionName: "commitPolicy",
    args: [policyHash],
  });

  return txHash;
}

/**
 * Look up an agent by address.
 */
export async function getAgent(
  client: ChainClient,
  address: `0x${string}`
): Promise<AgentIdentity> {
  if (!client.contracts.agentRegistry) throw new Error("agentRegistry contract not configured");

  const result = await (client.publicClient as any).readContract({
    address: client.contracts.agentRegistry,
    abi: AGENT_REGISTRY_ABI,
    functionName: "getAgent",
    args: [address],
  });

  const [agentId, metadataURI, policyHashes] = result as [`0x${string}`, string, `0x${string}`[]];
  return {
    agentId,
    owner: address,
    metadataURI,
    policyHashes: policyHashes as string[],
  };
}

// ── Agreement ──

/**
 * Propose a bilateral agreement.
 */
export async function proposeAgreement(
  client: ChainClient,
  policyHash: `0x${string}`,
  counterparty: `0x${string}`
): Promise<`0x${string}`> {
  if (!client.contracts.agreement) throw new Error("agreement contract not configured");

  const txHash = await (client.walletClient as any).writeContract({
    address: client.contracts.agreement,
    abi: AGREEMENT_ABI,
    functionName: "proposeAgreement",
    args: [policyHash, counterparty],
  });

  return txHash;
}

/**
 * Sign (finalize) an agreement as the counterparty.
 */
export async function signAgreement(
  client: ChainClient,
  agreementId: `0x${string}`
): Promise<`0x${string}`> {
  if (!client.contracts.agreement) throw new Error("agreement contract not configured");

  const txHash = await (client.walletClient as any).writeContract({
    address: client.contracts.agreement,
    abi: AGREEMENT_ABI,
    functionName: "signAgreement",
    args: [agreementId],
  });

  return txHash;
}

/**
 * Get agreement details.
 */
export async function getAgreement(
  client: ChainClient,
  agreementId: `0x${string}`
): Promise<Agreement> {
  if (!client.contracts.agreement) throw new Error("agreement contract not configured");

  const result = await (client.publicClient as any).readContract({
    address: client.contracts.agreement,
    abi: AGREEMENT_ABI,
    functionName: "getAgreement",
    args: [agreementId],
  });

  const [policyHash, partyA, partyB, signedByA, signedByB] = result as [`0x${string}`, string, string, boolean, boolean];
  return {
    agreementId,
    policyHash,
    partyA,
    partyB,
    signedByA,
    signedByB,
    finalized: signedByA && signedByB,
  };
}

// ── Vault ──

/**
 * Record a spend through the vault (called by authorized agent).
 */
export async function recordSpend(
  client: ChainClient,
  policyHash: `0x${string}`,
  recipient: `0x${string}`,
  amount: bigint
): Promise<`0x${string}`> {
  if (!client.contracts.vault) throw new Error("vault contract not configured");

  const txHash = await (client.walletClient as any).writeContract({
    address: client.contracts.vault,
    abi: VAULT_ABI,
    functionName: "spend",
    args: [policyHash, recipient, amount],
  });

  return txHash;
}

/**
 * Get amount spent in the current 24h window.
 */
export async function getSpentToday(
  client: ChainClient,
  policyHash: `0x${string}`
): Promise<bigint> {
  if (!client.contracts.vault) throw new Error("vault contract not configured");

  const result = await (client.publicClient as any).readContract({
    address: client.contracts.vault,
    abi: VAULT_ABI,
    functionName: "getSpentToday",
    args: [policyHash],
  });

  return result as bigint;
}

/**
 * Set spending limits for an agent under a policy.
 */
export async function setSpendingLimit(
  client: ChainClient,
  policyHash: `0x${string}`,
  agent: `0x${string}`,
  maxPerTx: bigint,
  maxPerDay: bigint,
  allowedRecipients: `0x${string}`[]
): Promise<`0x${string}`> {
  if (!client.contracts.vault) throw new Error("vault contract not configured");

  const txHash = await (client.walletClient as any).writeContract({
    address: client.contracts.vault,
    abi: VAULT_ABI,
    functionName: "setSpendingLimit",
    args: [policyHash, agent, maxPerTx, maxPerDay, allowedRecipients],
  });

  return txHash;
}
