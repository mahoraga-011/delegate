#!/usr/bin/env npx tsx
/**
 * Delegate SDK — Agent Demo
 *
 * Demonstrates a complete agent workflow:
 *   1. Define a policy
 *   2. Evaluate requests against it
 *   3. Register the policy on-chain
 *   4. Attest decisions on-chain
 *   5. Verify decisions on-chain
 *   6. Use middleware to wrap tool functions
 *
 * Prerequisites:
 *   - Anvil running: anvil --port 8545
 *   - Contracts deployed: cd packages/contracts && forge script script/Deploy.s.sol --rpc-url http://127.0.0.1:8545 --broadcast
 *
 * Run:
 *   npx tsx examples/agent-demo.ts
 */

import {
  createDelegate,
  type Policy,
  type AgentActionRequest,
} from "../packages/sdk/src/index.js";

// ── Config ──────────────────────────────────────────────────────────

const ANVIL_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

const delegate = createDelegate({
  policies: [],
  chain: {
    rpc: "http://127.0.0.1:8545",
    privateKey: ANVIL_KEY,
    chainId: 31337,
    contracts: {
      registry: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
      auditLog: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
      verifier: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
    },
  },
});

// ── Policy ──────────────────────────────────────────────────────────

const policy: Policy = {
  id: "agent-safety-v1",
  name: "Agent safety policy",
  description: "Allow read operations on staging with risk <= 5. Deny everything else.",
  defaultEffect: "deny",
  rules: [
    {
      id: "risk-cap",
      label: "Risk score must be 5 or below",
      field: "risk",
      operator: "lte",
      value: 5,
      rationale: "High-risk actions require human approval.",
    },
    {
      id: "staging-only",
      label: "Target must include staging",
      field: "target",
      operator: "includes",
      value: "staging",
      rationale: "Agents should only operate in staging environments.",
    },
    {
      id: "read-only",
      label: "Action must be read or summarize",
      field: "actionType",
      operator: "includes",
      value: "read|summarize",
      rationale: "Write operations require explicit approval.",
    },
  ],
};

// ── Requests ────────────────────────────────────────────────────────

const safeRequest: AgentActionRequest = {
  actionType: "read",
  tool: "file-reader",
  risk: 2,
  target: "staging-docs",
  justification: "Reading incident notes for daily summary.",
};

const dangerousRequest: AgentActionRequest = {
  actionType: "execute",
  tool: "shell",
  risk: 9,
  target: "prod-database",
  justification: "Drop and recreate the users table.",
};

// ── Demo ────────────────────────────────────────────────────────────

async function main() {
  console.log("╔══════════════════════════════════════════╗");
  console.log("║       Delegate SDK — Agent Demo          ║");
  console.log("╚══════════════════════════════════════════╝\n");

  // 1. Evaluate
  console.log("── Step 1: Evaluate requests ──\n");

  const safeResult = delegate.evaluate(policy, safeRequest);
  console.log(`  Safe request:      ${safeResult.outcome.toUpperCase()}`);
  console.log(`    Passed: ${safeResult.scorecard.passed}  Failed: ${safeResult.scorecard.failed}`);

  const dangerousResult = delegate.evaluate(policy, dangerousRequest);
  console.log(`  Dangerous request: ${dangerousResult.outcome.toUpperCase()}`);
  console.log(`    Passed: ${dangerousResult.scorecard.passed}  Failed: ${dangerousResult.scorecard.failed}`);
  for (const check of dangerousResult.checks.filter((c) => !c.passed)) {
    console.log(`    ✗ ${check.label}`);
  }

  // 2. Hash
  console.log("\n── Step 2: Deterministic hashing ──\n");

  const policyHash = delegate.hash(policy);
  console.log(`  Policy hash: ${policyHash}`);
  console.log(`  Deterministic: ${delegate.hash(policy) === policyHash}`);

  // 3. Register policy on-chain
  console.log("\n── Step 3: Register policy on-chain ──\n");

  const regTx = await delegate.registerPolicy(policy);
  console.log(`  Tx: ${regTx}`);

  // 4. Attest decisions on-chain
  console.log("\n── Step 4: Attest decisions on-chain ──\n");

  const safeTx = await delegate.attest(policy, safeRequest, safeResult);
  console.log(`  Safe decision tx:      ${safeTx}`);

  const dangerousTx = await delegate.attest(policy, dangerousRequest, dangerousResult);
  console.log(`  Dangerous decision tx: ${dangerousTx}`);

  // 5. Verify on-chain
  console.log("\n── Step 5: Verify decisions on-chain ──\n");

  const safeVerified = await delegate.verify(policy, safeRequest, safeResult);
  console.log(`  Safe decision verified:      ${safeVerified}`);

  const dangerousVerified = await delegate.verify(policy, dangerousRequest, dangerousResult);
  console.log(`  Dangerous decision verified: ${dangerousVerified}`);

  // Verify a tampered request fails
  const tamperedRequest = { ...safeRequest, risk: 1 };
  const tamperedVerified = await delegate.verify(policy, tamperedRequest, safeResult);
  console.log(`  Tampered request verified:   ${tamperedVerified} (expected: false)`);

  // 6. Middleware
  console.log("\n── Step 6: Middleware — wrap a tool function ──\n");

  const readFile = async (path: string) => `Contents of ${path}`;

  const safeReadFile = delegate.wrap(policy, readFile, (path: string) => ({
    actionType: "read",
    tool: "file-reader",
    risk: 2,
    target: `staging-${path}`,
    justification: `Agent reading ${path}`,
  }));

  const allowed = await safeReadFile("docs/runbook.md");
  console.log(`  Allowed call:  allowed=${allowed.allowed} result="${allowed.result}"`);

  const blocked = delegate.wrap(policy, readFile, (_path: string) => ({
    actionType: "execute",
    tool: "shell",
    risk: 9,
    target: "prod-db",
    justification: "Dangerous operation",
  }));

  const denied = await blocked("drop-tables.sql");
  console.log(`  Blocked call:  allowed=${denied.allowed} result=${denied.result ?? "undefined"}`);

  console.log("\n══════════════════════════════════════════");
  console.log("  Demo complete. All operations verified.");
  console.log("══════════════════════════════════════════\n");
}

main().catch(console.error);
