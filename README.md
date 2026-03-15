# Delegate

**On-chain verification for AI agent decisions.**

Delegate is a deterministic policy engine that gates agent actions through human-readable rules before they touch the real world. Every decision is hashed and stored on-chain — anyone can re-run the engine and verify the result matches its on-chain receipt.

## How It Works

```
Agent (has private key)
  → delegate.evaluate(policy, request)       // deterministic rule checks
  → delegate.attest(policy, request, result) // hash + write to chain
  → tx hash returned, linked to audit entry

Human (dashboard + MetaMask)
  → views audit log with on-chain tx links
  → can verify: re-hash + check on-chain
  → can register policies on-chain
```

The policy engine is deterministic: same input → same output. We hash the policy + request + result using canonical JSON → keccak256, then store the hash on-chain. Anyone can re-run the engine to verify a decision matches its on-chain hash. Ethereum becomes the trust anchor — no central authority needed.

## Architecture

- **`packages/sdk`** — TypeScript SDK. Policy evaluation, deterministic hashing, on-chain attestation/verification via viem, middleware wrapper for tool functions.
- **`packages/contracts`** — Solidity smart contracts (Foundry). Three contracts on Base Sepolia:
  - `DelegatePolicyRegistry` — tamper-proof policy hash registration
  - `DelegateAuditLog` — append-only decision log
  - `DelegateVerifier` — read-only decision verification
- **`src/`** — Next.js dashboard. Connect MetaMask, evaluate policies live, attest decisions, verify on-chain.
- **`examples/`** — Standalone demo scripts.

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 9+
- [Foundry](https://book.getfoundry.sh/getting-started/installation) (for contracts)

### Install

```bash
pnpm install
pnpm build:sdk
```

### Local Development (Anvil)

```bash
# Terminal 1: Start local chain
anvil --port 8545

# Terminal 2: Deploy contracts
cd packages/contracts
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  forge script script/Deploy.s.sol --rpc-url http://127.0.0.1:8545 --broadcast

# Terminal 3: Run dashboard
pnpm dev
```

Open http://localhost:3000. Connect MetaMask to `localhost:8545` (chain ID 31337).

### Run the Agent Demo

```bash
# With Anvil running and contracts deployed:
npx tsx examples/agent-demo.ts
```

### Run Contract Tests

```bash
cd packages/contracts
forge test -vvv
```

## SDK API

```ts
import { createDelegate } from 'delegate-sdk'

const delegate = createDelegate({
  policies: [myPolicy],
  chain: {
    rpc: 'https://sepolia.base.org',
    privateKey: process.env.AGENT_PRIVATE_KEY,
    contracts: { registry, auditLog, verifier }
  }
})

// Evaluate (pure, deterministic — no chain needed)
const result = delegate.evaluate(myPolicy, request)

// Attest on-chain
const txHash = await delegate.attest(myPolicy, request, result)

// Verify on-chain
const verified = await delegate.verify(myPolicy, request, result)

// Register policy hash on-chain
const regTx = await delegate.registerPolicy(myPolicy, 'ipfs://...')

// Middleware: wrap a tool function with policy enforcement
const safeTool = delegate.wrap(myPolicy, toolFn, extractRequest)
const result = await safeTool(...args) // evaluates → attests → executes
```

### Types

```ts
type Policy = {
  id: string
  name: string
  description: string
  defaultEffect: 'allow' | 'deny'
  rules: PolicyRule[]
}

type PolicyRule = {
  id: string
  label: string
  field: 'actionType' | 'tool' | 'risk' | 'target'
  operator: 'equals' | 'notEquals' | 'includes' | 'notIncludes' | 'lte' | 'gte'
  value: string | number
  rationale: string
}

type AgentActionRequest = {
  actionType: string
  tool: string
  risk: number
  target: string
  justification: string
}
```

## Smart Contracts

| Contract | Purpose | Key Function |
|----------|---------|-------------|
| `DelegatePolicyRegistry` | Register policy hashes | `registerPolicy(bytes32, string)` |
| `DelegateAuditLog` | Log decisions on-chain | `logDecision(bytes32, bytes32, bytes32, bool)` |
| `DelegateVerifier` | Verify logged decisions | `verify(bytes32, bytes32, bytes32) → bool` |

All contracts use `keccak256(abi.encode(...))` composite keys. The audit log is append-only with no update or delete functions. The verifier holds an immutable reference to the audit log.

## Environment Variables

```bash
# Contract addresses (defaults to Anvil deploy addresses)
NEXT_PUBLIC_AUDIT_LOG_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
NEXT_PUBLIC_REGISTRY_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_VERIFIER_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
NEXT_PUBLIC_CHAIN_ID=31337
```

## License

MIT
