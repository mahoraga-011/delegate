/**
 * Integration test: evaluate → attest → verify round-trip against local Anvil.
 *
 * Prerequisites:
 *   - Anvil running on localhost:8545
 *   - Contracts deployed via `forge script script/Deploy.s.sol`
 *
 * Run: npx tsx test/integration.ts
 */

import { createDelegate, type Policy, type AgentActionRequest } from "../src/index.js";

// Anvil account 0
const PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

// Deployed contract addresses (from Anvil deploy)
const REGISTRY = "0x5FbDB2315678afecb367f032d93F642f64180aa3" as const;
const AUDIT_LOG = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512" as const;
const VERIFIER = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0" as const;

const policy: Policy = {
  id: "test-policy",
  name: "Test policy",
  description: "Integration test policy",
  defaultEffect: "deny",
  rules: [
    {
      id: "risk-cap",
      label: "Risk must be <= 5",
      field: "risk",
      operator: "lte",
      value: 5,
      rationale: "Keep risk low",
    },
  ],
};

const allowedRequest: AgentActionRequest = {
  actionType: "read",
  tool: "read",
  risk: 3,
  target: "staging-bucket",
  justification: "Test allowed request",
};

const deniedRequest: AgentActionRequest = {
  actionType: "execute",
  tool: "exec",
  risk: 8,
  target: "prod-db",
  justification: "Test denied request",
};

async function main() {
  const delegate = createDelegate({
    policies: [policy],
    chain: {
      rpc: "http://127.0.0.1:8545",
      privateKey: PRIVATE_KEY,
      chainId: 31337,
      contracts: {
        registry: REGISTRY,
        auditLog: AUDIT_LOG,
        verifier: VERIFIER,
      },
    },
  });

  console.log("=== Integration Test: SDK → Anvil ===\n");

  // 1. Evaluate (pure, no chain)
  const allowResult = delegate.evaluate(policy, allowedRequest);
  console.log(`1. Evaluate allowed request: ${allowResult.outcome}`);
  assert(allowResult.outcome === "allow", "Expected allow");

  const denyResult = delegate.evaluate(policy, deniedRequest);
  console.log(`   Evaluate denied request:  ${denyResult.outcome}`);
  assert(denyResult.outcome === "deny", "Expected deny");

  // 2. Hash determinism
  const hash1 = delegate.hash(policy);
  const hash2 = delegate.hash(policy);
  console.log(`\n2. Hash determinism: ${hash1 === hash2 ? "PASS" : "FAIL"}`);
  assert(hash1 === hash2, "Hashes should be identical");
  console.log(`   Policy hash: ${hash1}`);

  // 3. Register policy on-chain
  const regTx = await delegate.registerPolicy(policy, "test://metadata");
  console.log(`\n3. Register policy tx: ${regTx}`);
  assert(regTx.startsWith("0x"), "Expected tx hash");

  // 4. Attest allowed decision on-chain
  const attestTx = await delegate.attest(policy, allowedRequest, allowResult);
  console.log(`\n4. Attest allowed decision tx: ${attestTx}`);
  assert(attestTx.startsWith("0x"), "Expected tx hash");

  // 5. Verify the attested decision
  const verified = await delegate.verify(policy, allowedRequest, allowResult);
  console.log(`\n5. Verify attested decision: ${verified ? "PASS" : "FAIL"}`);
  assert(verified === true, "Decision should be verified");

  // 6. Verify unattested decision returns false
  const notVerified = await delegate.verify(policy, deniedRequest, denyResult);
  console.log(`   Verify unattested decision: ${!notVerified ? "PASS" : "FAIL"}`);
  assert(notVerified === false, "Unattested decision should not verify");

  // 7. Attest denied decision, then verify
  const denyTx = await delegate.attest(policy, deniedRequest, denyResult);
  console.log(`\n6. Attest denied decision tx: ${denyTx}`);
  const denyVerified = await delegate.verify(policy, deniedRequest, denyResult);
  console.log(`   Verify denied decision: ${denyVerified ? "PASS" : "FAIL"}`);
  assert(denyVerified === true, "Denied decision should also verify after attestation");

  // 7. Middleware wrap test
  console.log(`\n7. Middleware wrap test:`);
  let toolCalled = false;
  const mockTool = async (msg: string) => {
    toolCalled = true;
    return `executed: ${msg}`;
  };

  const safeTool = delegate.wrap(
    policy,
    mockTool,
    (msg: string) => ({
      actionType: "read",
      tool: "read",
      risk: 2,
      target: "staging",
      justification: msg,
    })
  );

  const wrapResult = await safeTool("hello");
  console.log(`   Allowed: ${wrapResult.allowed}, Tool called: ${toolCalled}`);
  console.log(`   Result: ${wrapResult.result}`);
  console.log(`   Tx hash: ${wrapResult.txHash}`);
  assert(wrapResult.allowed === true, "Should be allowed");
  assert(toolCalled === true, "Tool should have been called");
  assert(wrapResult.txHash?.startsWith("0x"), "Should have tx hash");

  console.log("\n=== All tests passed! ===");
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

main().catch((err) => {
  console.error("\nTest failed:", err);
  process.exit(1);
});
