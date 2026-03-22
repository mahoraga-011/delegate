# Delegate

**Policy checks before agents act. Verified on-chain.**

Delegate is a deterministic policy engine for AI agents with on-chain verification on Base Sepolia. Define rules, evaluate requests, and prove every decision with tamper-evident on-chain receipts.

**Live:** [delegate.allensaji.dev](https://delegate.allensaji.dev)
**SDK:** [delegate-sdk on npm](https://www.npmjs.com/package/delegate-sdk)
**Agent docs:** [skill.md](https://delegate.allensaji.dev/skill.md)

## How It Works

```
Define policy (deterministic rules)
  → Agent evaluates request against policy
  → All pass = ALLOW, any fail = DENY
  → Decision hashed (keccak256) and stored on-chain
  → Anyone re-runs engine, compares hashes → verified
```

Same input → same output. No AI in the evaluation loop. Ethereum is the trust anchor.

## Architecture

```
┌─────────────────────────────────────────────────┐
│  AGENTS           Agent A · Agent B · Dashboard │
├─────────────────────────────────────────────────┤
│  DELEGATE         API · Policy Engine · SDK     │
├─────────────────────────────────────────────────┤
│  ON-CHAIN         Registry · AuditLog · Verifier│
│                   AgentReg · Agreement · Vault  │
└─────────────────────────────────────────────────┘
```

- **`packages/sdk`** — TypeScript SDK (`delegate-sdk` on npm). Policy evaluation, hashing, on-chain attestation, agent identity, agreements, vault spending, middleware wrapper.
- **`packages/contracts`** — 6 Solidity contracts (Foundry) on Base Sepolia.
- **`src/`** — Next.js dashboard. Create policies, evaluate live, attest, verify, manage agents/agreements/vault.
- **`examples/`** — Demo scripts and agent tests.
- **`remotion/`** — Programmatic demo video (Remotion).

## Smart Contracts (Base Sepolia)

| Contract | Address | Purpose |
|----------|---------|---------|
| PolicyRegistry | `0x3a45...E15` | Immutable policy hash storage |
| AuditLog | `0x23b7...688` | Append-only decision log |
| Verifier | `0xa20D...c6A` | Read-only decision verification |
| AgentRegistry | `0xf78B...985` | Agent identity & policy commitments |
| Agreement | `0x2a8B...601` | Bilateral agreements under shared policies |
| Vault | `0x5242...307` | Escrow with per-tx and daily spending limits |

## Quick Start

### Prerequisites

- Node.js 20+, pnpm 9+
- [Foundry](https://book.getfoundry.sh/getting-started/installation) (for contracts)

### Install & Run

```bash
pnpm install
pnpm build:sdk
pnpm dev
```

Open http://localhost:3000.

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

### Run Demos

```bash
# Full two-agent demo (14 steps)
npx tsx examples/demo-recording.ts

# Zero-context agent test (reads skill.md, interacts autonomously)
npx tsx examples/zero-context-agent-test.ts

# Other demos
npx tsx examples/agent-demo.ts
npx tsx examples/multi-agent-demo.ts
```

### Contract Tests

```bash
cd packages/contracts && forge test -vvv
```

## SDK

```bash
npm install delegate-sdk
```

```ts
import { createDelegate } from 'delegate-sdk'

const delegate = createDelegate({
  policies: [myPolicy],
  chain: {
    rpc: 'https://base-sepolia.g.alchemy.com/v2/YOUR_KEY',
    privateKey: '0x...',
    chainId: 84532,
    contracts: {
      registry: '0x3a45bC84fa4a460FD65a4CfE1B96edA45bD88E15',
      auditLog: '0x23b75deDDcB048BBe3db741eD05E309F901fb688',
      verifier: '0xa20Db185523EF7061EA4B002664d3695f9804c6A',
      agentRegistry: '0xf78B0b7E32d2C693F6015eDfD55171b1D7732985',
      agreement: '0x2a8Bfa499F68000b3502aab4268C6e765b838601',
      vault: '0x5242d8517b60c56F91AdF6FB8a015dFB6Ed8f307',
    },
  },
})

// Evaluate (deterministic, no chain)
const result = delegate.evaluate(policy, request)

// Attest decision on-chain
await delegate.attest(policy, request, result)

// Verify decision on-chain
const valid = await delegate.verify(policy, request, result)

// Register agent identity
await delegate.registerAgent(agentId, 'ipfs://metadata')

// Form bilateral agreement
await delegate.proposeAgreement(policyHash, '0xCounterparty')

// Vault spending
await delegate.recordSpend(policyHash, '0xRecipient', amount)

// Middleware: wrap tool with policy enforcement
const safeTool = delegate.wrap(policy, toolFn, extractRequest)
```

## HTTP API

No SDK needed. Base URL: `https://delegate.allensaji.dev`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/evaluate` | POST | Evaluate request against policy |
| `/api/hash` | POST | Hash any object (canonical JSON → keccak256) |
| `/api/verify` | POST | Check if decision exists on-chain |
| `/api/agent/:address` | GET | Look up agent identity & commitments |
| `/api/agreement/:id` | GET | Look up agreement status |

## For Agents

Agents read [`skill.md`](https://delegate.allensaji.dev/skill.md) to learn the full API, contract addresses, and SDK usage. The file is self-contained — everything an agent needs to operate autonomously.

```bash
curl -s https://delegate.allensaji.dev/skill.md
```

## Demo Video

Generate a programmatic demo video with Remotion:

```bash
pnpm remotion:dev      # Preview in Remotion Studio
pnpm remotion:render   # Render to out/delegate-demo.mp4
```

## License

MIT
