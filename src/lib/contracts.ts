import {
  AUDIT_LOG_ABI, REGISTRY_ABI, VERIFIER_ABI,
  AGENT_REGISTRY_ABI, AGREEMENT_ABI, VAULT_ABI,
} from "delegate-sdk";

// Anvil deploy defaults. Override with NEXT_PUBLIC_* env vars for Base Sepolia
export const AUDIT_LOG_ADDRESS = (process.env.NEXT_PUBLIC_AUDIT_LOG_ADDRESS ||
  "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512") as `0x${string}`;

export const REGISTRY_ADDRESS = (process.env.NEXT_PUBLIC_REGISTRY_ADDRESS ||
  "0x5FbDB2315678afecb367f032d93F642f64180aa3") as `0x${string}`;

export const VERIFIER_ADDRESS = (process.env.NEXT_PUBLIC_VERIFIER_ADDRESS ||
  "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0") as `0x${string}`;

export const AGENT_REGISTRY_ADDRESS = (process.env.NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS ||
  "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9") as `0x${string}`;

export const AGREEMENT_ADDRESS = (process.env.NEXT_PUBLIC_AGREEMENT_ADDRESS ||
  "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9") as `0x${string}`;

export const VAULT_ADDRESS = (process.env.NEXT_PUBLIC_VAULT_ADDRESS ||
  "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707") as `0x${string}`;

export const auditLogConfig = {
  address: AUDIT_LOG_ADDRESS,
  abi: AUDIT_LOG_ABI,
} as const;

export const registryConfig = {
  address: REGISTRY_ADDRESS,
  abi: REGISTRY_ABI,
} as const;

export const verifierConfig = {
  address: VERIFIER_ADDRESS,
  abi: VERIFIER_ABI,
} as const;

export const agentRegistryConfig = {
  address: AGENT_REGISTRY_ADDRESS,
  abi: AGENT_REGISTRY_ABI,
} as const;

export const agreementConfig = {
  address: AGREEMENT_ADDRESS,
  abi: AGREEMENT_ABI,
} as const;

export const vaultConfig = {
  address: VAULT_ADDRESS,
  abi: VAULT_ABI,
} as const;

export function explorerTxUrl(txHash: string): string | null {
  const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID || "31337");
  if (chainId === 84532) {
    return `https://sepolia.basescan.org/tx/${txHash}`;
  }
  return null; // No explorer for local Anvil
}
