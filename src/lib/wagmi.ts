import { http, createConfig } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { defineChain } from "viem";

const anvil = defineChain({
  id: 31337,
  name: "Anvil",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["http://127.0.0.1:8545"] },
  },
});

const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID || "31337");

export const config = createConfig({
  chains: chainId === 31337 ? [anvil] : [baseSepolia],
  connectors: [injected()],
  transports: chainId === 31337
    ? { [anvil.id]: http("http://127.0.0.1:8545") }
    : { [baseSepolia.id]: http() },
});
