import { AUDIT_LOG_ABI, REGISTRY_ABI, VERIFIER_ABI } from "@anthropic-hackathon/delegate-sdk";

// Anvil deploy defaults — override with NEXT_PUBLIC_* env vars for Base Sepolia
export const AUDIT_LOG_ADDRESS = (process.env.NEXT_PUBLIC_AUDIT_LOG_ADDRESS ||
  "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512") as `0x${string}`;

export const REGISTRY_ADDRESS = (process.env.NEXT_PUBLIC_REGISTRY_ADDRESS ||
  "0x5FbDB2315678afecb367f032d93F642f64180aa3") as `0x${string}`;

export const VERIFIER_ADDRESS = (process.env.NEXT_PUBLIC_VERIFIER_ADDRESS ||
  "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0") as `0x${string}`;

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

export function explorerTxUrl(txHash: string): string | null {
  const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID || "31337");
  if (chainId === 84532) {
    return `https://sepolia.basescan.org/tx/${txHash}`;
  }
  return null; // No explorer for local Anvil
}
