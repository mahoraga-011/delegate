# Delegate Skill

You are interacting with Delegate, a deterministic policy engine for AI agents with on-chain verification on Base Sepolia.

Delegate lets you: define rules for what agents can do, evaluate requests against those rules, log decisions on-chain, register agent identity, form bilateral agreements with other agents, and manage spending through an on-chain vault.

## HTTP API (no SDK needed)

If you can make HTTP requests, you do not need to install anything. The API handles evaluation, hashing, and read operations. For on-chain writes, interact with the contracts directly using your own wallet.

Base URL: `https://your-domain.vercel.app` (or `http://localhost:3000` for local dev)

### POST /api/evaluate
Evaluate a request against a policy. Returns outcome, checks, and hashes.
```
Body: { "policy": Policy, "request": AgentActionRequest }
Response: { "outcome", "checks", "scorecard", "policyHash", "requestHash", "resultHash" }
```

### POST /api/hash
Hash any object using canonical JSON and keccak256.
```
Body: { "data": any }
Response: { "hash": "0x..." }
```

### POST /api/verify
Check if a decision exists on-chain.
```
Body: { "policy": Policy, "request": AgentActionRequest }
Response: { "verified": boolean, "outcome", "policyHash", "requestHash", "resultHash" }
```

### GET /api/agent/:address
Look up an agent by address.
```
Response: { "agentId", "metadataURI", "policyHashes", "registered": boolean }
```

### GET /api/agreement/:id
Look up an agreement by ID.
```
Response: { "agreementId", "policyHash", "partyA", "partyB", "signedByA", "signedByB", "finalized" }
```

---

## SDK (for agents with a Node.js runtime)

### Install

```bash
npm install delegate-sdk
```

### Setup

```typescript
import { createDelegate, type Policy } from "delegate-sdk";

const delegate = createDelegate({
  policies: [yourPolicy],
  chain: {
    rpc: "https://base-sepolia.g.alchemy.com/v2/YOUR_KEY",
    privateKey: "0xYOUR_PRIVATE_KEY",
    chainId: 84532,
    contracts: {
      registry: "0x3a45bC84fa4a460FD65a4CfE1B96edA45bD88E15",
      auditLog: "0x23b75deDDcB048BBe3db741eD05E309F901fb688",
      verifier: "0xa20Db185523EF7061EA4B002664d3695f9804c6A",
      agentRegistry: "0xf78B0b7E32d2C693F6015eDfD55171b1D7732985",
      agreement: "0x2a8Bfa499F68000b3502aab4268C6e765b838601",
      vault: "0x5242d8517b60c56F91AdF6FB8a015dFB6Ed8f307",
    },
  },
});
```

## Core Concepts

### Policy
A set of deterministic rules. Each rule checks a field against a value using an operator. All rules must pass for ALLOW. Any failure results in DENY.

```typescript
const policy: Policy = {
  id: "my-policy",
  name: "Safe operations",
  description: "Low-risk read-only access",
  defaultEffect: "deny",
  rules: [
    {
      id: "risk-cap",
      label: "Risk must be at or below 4",
      field: "risk",        // any string: actionType, tool, risk, target, amount, department, dataType, etc.
      operator: "lte",      // equals | notEquals | includes | notIncludes | lte | gte
      value: 4,
      rationale: "Keep actions low risk",
    },
    {
      id: "read-only",
      label: "Action must be read",
      field: "actionType",
      operator: "equals",
      value: "read",
      rationale: "Only read operations allowed",
    },
  ],
};
```

### AgentActionRequest
What an agent submits for evaluation.

```typescript
const request = {
  actionType: "read",       // what the agent wants to do
  tool: "read",             // which tool it uses
  risk: 2,                  // 0-10 risk score
  target: "staging-db",     // system being accessed
  justification: "Fetch latest metrics",
  // optional built-in fields:
  amount: 0.05,             // for payment actions (ETH)
  recipient: "0x...",       // payment target
  currency: "ETH",          // payment currency
  // custom fields (any key-value pairs matching your policy rules):
  department: "engineering",
  dataType: "public",
  environment: "staging",
};
```

## Actions

### 1. Evaluate a request

Check if a request passes all policy rules. Pure function, no chain interaction.

```typescript
const result = delegate.evaluate(policy, request);
// result.outcome = "allow" | "deny"
// result.checks = [{ ruleId, label, passed, summary, rationale }]
// result.scorecard = { passed: 2, failed: 0 }
```

### 2. Register a policy on-chain

Store the policy hash on-chain so others can verify it exists.

```typescript
const txHash = await delegate.registerPolicy(policy, "ipfs://policy-metadata");
```

### 3. Attest a decision on-chain

Log a policy decision on-chain. Creates a permanent, verifiable receipt.

```typescript
const result = delegate.evaluate(policy, request);
const txHash = await delegate.attest(policy, request, result);
```

### 4. Verify a decision on-chain

Check if a specific decision was previously attested. Re-evaluates locally and compares hashes.

```typescript
const isValid = await delegate.verify(policy, request, result);
// true = this exact decision exists on-chain
// false = no match (request was altered, or never attested)
```

### 5. Register agent identity

Register your agent on-chain with an ID and metadata.

```typescript
const agentId = delegate.hash("my-agent-name");
const txHash = await delegate.registerAgent(agentId, "ipfs://agent-metadata");
```

### 6. Commit to a policy

Declare on-chain that your agent operates under a specific policy. Policy must be registered first.

```typescript
const policyHash = delegate.hash(policy);
const txHash = await delegate.commitPolicy(policyHash);
```

### 7. Look up an agent

Check another agent's identity and committed policies.

```typescript
const info = await delegate.getAgent("0xAgentAddress");
// info.agentId = bytes32
// info.metadataURI = "ipfs://..."
// info.policyHashes = ["0x...", "0x..."]
```

### 8. Propose an agreement

Propose a bilateral agreement with another agent under a shared policy. You auto-sign as proposer.

```typescript
const policyHash = delegate.hash(policy);
const txHash = await delegate.proposeAgreement(policyHash, "0xCounterpartyAddress");
```

### 9. Sign an agreement

Accept an agreement proposed by another agent.

```typescript
const txHash = await delegate.signAgreement("0xAgreementId");
```

### 10. Check agreement status

```typescript
const agreement = await delegate.getAgreement("0xAgreementId");
// agreement.finalized = true (both signed) | false
// agreement.partyA, agreement.partyB
// agreement.policyHash
```

### 11. Deposit ETH into vault

Fund a vault for a specific policy. Anyone can deposit.

```typescript
// Use the chain client directly for deposit (requires sending ETH)
await delegate.chainClient.walletClient.writeContract({
  address: "0x5242d8517b60c56F91AdF6FB8a015dFB6Ed8f307",
  abi: [{ type: "function", name: "deposit", inputs: [{ name: "policyHash", type: "bytes32" }], outputs: [], stateMutability: "payable" }],
  functionName: "deposit",
  args: [delegate.hash(policy)],
  value: BigInt("100000000000000000"), // 0.1 ETH in wei
});
```

### 12. Set spending limits

Only the vault owner can set limits. Defines who can spend, how much, and to whom.

```typescript
await delegate.setSpendingLimit(
  delegate.hash(policy),                    // policy hash
  "0xAgentAddress",                         // authorized agent
  BigInt("100000000000000000"),             // 0.1 ETH max per tx
  BigInt("500000000000000000"),             // 0.5 ETH max per day
  ["0xRecipient1", "0xRecipient2"],         // allowed recipients
);
```

### 13. Spend from vault

Only callable by the authorized agent. Vault enforces all limits on-chain.

```typescript
const txHash = await delegate.recordSpend(
  delegate.hash(policy),
  "0xRecipientAddress",
  BigInt("50000000000000000"),  // 0.05 ETH
);
```

### 14. Check vault status

```typescript
const spent = await delegate.getSpentToday(delegate.hash(policy));
// Returns BigInt of wei spent in current 24h window
```

### 15. Wrap a tool with policy enforcement

Automatically evaluate policy before executing a function. Denied calls never execute.

```typescript
const safeTool = delegate.wrap(
  policy,
  originalToolFunction,
  (...args) => ({
    actionType: "transfer",
    tool: "transfer",
    risk: args[0] > 1 ? 8 : 2,
    target: args[1],
    justification: "auto",
  })
);

const result = await safeTool(0.05, "0xRecipient");
// result.allowed = true | false
// result.result = tool return value (if allowed)
// result.txHash = attestation hash (if chain configured)
```

## Multi-Agent Workflow Example

```typescript
// Agent A: register identity and create policy
const agentA = createDelegate({ policies: [policy], chain: chainConfig });
await agentA.registerPolicy(policy);
await agentA.registerAgent(agentA.hash("agent-alpha"), "ipfs://alpha");
await agentA.commitPolicy(agentA.hash(policy));

// Agent B: verify Agent A's commitments
const agentB = createDelegate({ policies: [policy], chain: chainConfig });
const info = await agentB.getAgent("0xAgentAAddress");
// Check info.policyHashes contains the expected policy hash

// Form agreement
const policyHash = agentA.hash(policy);
await agentA.proposeAgreement(policyHash, "0xAgentBAddress");
// Agent B signs
await agentB.signAgreement("0xAgreementId");

// Both operate under shared policy, every decision attested on-chain
const result = agentA.evaluate(policy, request);
await agentA.attest(policy, request, result);

// Either agent can verify any decision
const valid = await agentB.verify(policy, request, result);
```

## Contract Addresses (Base Sepolia)

| Contract | Address |
|----------|---------|
| PolicyRegistry | 0x3a45bC84fa4a460FD65a4CfE1B96edA45bD88E15 |
| AuditLog | 0x23b75deDDcB048BBe3db741eD05E309F901fb688 |
| Verifier | 0xa20Db185523EF7061EA4B002664d3695f9804c6A |
| AgentRegistry | 0xf78B0b7E32d2C693F6015eDfD55171b1D7732985 |
| Agreement | 0x2a8Bfa499F68000b3502aab4268C6e765b838601 |
| Vault | 0x5242d8517b60c56F91AdF6FB8a015dFB6Ed8f307 |

Chain: Base Sepolia (chain ID 84532)

## Local Development (Anvil)

For local testing, deploy contracts to Anvil (chain ID 31337, RPC http://127.0.0.1:8545):

| Contract | Address |
|----------|---------|
| PolicyRegistry | 0x5FbDB2315678afecb367f032d93F642f64180aa3 |
| AuditLog | 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512 |
| Verifier | 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0 |
| AgentRegistry | 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9 |
| Agreement | 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9 |
| Vault | 0x5FC8d32690cc91D4c39d9d3abcBD16989F875707 |

```bash
# Start Anvil and deploy
anvil --port 8545
cd packages/contracts && PRIVATE_KEY=0xac09...ff80 forge script script/Deploy.s.sol --rpc-url http://127.0.0.1:8545 --broadcast
```

## Dashboard

Visit the Delegate dashboard to visually create policies, test evaluations, and monitor on-chain activity. Both humans and agents can use the SDK programmatically.
