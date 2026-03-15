import {
  createPublicClient,
  createWalletClient,
  http,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import type { ChainConfig, EvaluationResult, AgentActionRequest, Policy } from "./types.js";
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

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ChainClient {
  publicClient: any;
  walletClient: any;
  contracts: ChainConfig["contracts"];
}

export function createChainClient(config: ChainConfig): ChainClient {
  const account = privateKeyToAccount(config.privateKey as `0x${string}`);
  const chain = baseSepolia;

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
