import { createPublicClient, defineChain, http } from "viem";
import { baseSepolia } from "viem/chains";
import {
  AGENT_REGISTRY_ABI,
  AGREEMENT_ABI,
  VERIFIER_ABI,
} from "@delegate/sdk";

const CONTRACTS = {
  registry: (process.env.NEXT_PUBLIC_REGISTRY_ADDRESS || "0x3a45bC84fa4a460FD65a4CfE1B96edA45bD88E15") as `0x${string}`,
  auditLog: (process.env.NEXT_PUBLIC_AUDIT_LOG_ADDRESS || "0x23b75deDDcB048BBe3db741eD05E309F901fb688") as `0x${string}`,
  verifier: (process.env.NEXT_PUBLIC_VERIFIER_ADDRESS || "0xa20Db185523EF7061EA4B002664d3695f9804c6A") as `0x${string}`,
  agentRegistry: (process.env.NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS || "0xf78B0b7E32d2C693F6015eDfD55171b1D7732985") as `0x${string}`,
  agreement: (process.env.NEXT_PUBLIC_AGREEMENT_ADDRESS || "0x2a8Bfa499F68000b3502aab4268C6e765b838601") as `0x${string}`,
  vault: (process.env.NEXT_PUBLIC_VAULT_ADDRESS || "0x5242d8517b60c56F91AdF6FB8a015dFB6Ed8f307") as `0x${string}`,
};

const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID || "84532");

const chain = chainId === 31337
  ? defineChain({
      id: 31337,
      name: "Anvil",
      nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
      rpcUrls: { default: { http: ["http://127.0.0.1:8545"] } },
    })
  : baseSepolia;

const rpcUrl = chainId === 31337 ? "http://127.0.0.1:8545" : undefined;

export const publicClient = createPublicClient({
  chain,
  transport: http(rpcUrl),
});

export { CONTRACTS, AGENT_REGISTRY_ABI, AGREEMENT_ABI, VERIFIER_ABI };
