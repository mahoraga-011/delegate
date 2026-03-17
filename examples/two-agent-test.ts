#!/usr/bin/env npx tsx
/**
 * Two-Agent Integration Test
 *
 * Simulates two independent agents discovering Delegate via skill.md,
 * creating policies, registering identities, forming agreements,
 * and operating under shared rules.
 *
 * Prerequisites:
 *   - Anvil running: anvil --port 8545
 *   - Contracts deployed
 */

import {
  createDelegate,
  hashObject,
  evaluatePolicy,
  type Policy,
  type AgentActionRequest,
} from "../packages/sdk/src/index.js";

const CHAIN_CONFIG = {
  rpc: "http://127.0.0.1:8545",
  chainId: 31337,
  contracts: {
    registry: "0x5FbDB2315678afecb367f032d93F642f64180aa3" as const,
    auditLog: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512" as const,
    verifier: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0" as const,
    agentRegistry: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9" as const,
    agreement: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9" as const,
    vault: "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707" as const,
  },
};

// Agent A: Anvil account #3
const AGENT_A_KEY = "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6";
const AGENT_A_ADDR = "0x90F79bf6EB2c4f870365E785982E1f101E93b906";

// Agent B: Anvil account #4
const AGENT_B_KEY = "0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a";
const AGENT_B_ADDR = "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65";

// Owner (deploys vault): Anvil account #0
const OWNER_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`  ✓ ${msg}`);
    passed++;
  } else {
    console.log(`  ✗ FAIL: ${msg}`);
    failed++;
  }
}

function hr(title: string) {
  console.log(`\n--- ${title} ---\n`);
}

async function main() {
  console.log("Two-Agent Integration Test\n");

  // ── STEP 1: Agents create their own policies ──

  hr("1. Agents create policies independently");

  const agentAPolicy: Policy = {
    id: "agent-a-api-access",
    name: "API Access Policy",
    description: "Allow read/query actions with low risk",
    defaultEffect: "deny",
    rules: [
      { id: "action-type", label: "Must be read or query", field: "actionType", operator: "includes", value: "read|query", rationale: "Read-only access" },
      { id: "risk-limit", label: "Risk at most 3", field: "risk", operator: "lte", value: 3, rationale: "Low risk only" },
    ],
  };

  const agentBPolicy: Policy = {
    id: "agent-b-payment",
    name: "Payment Policy",
    description: "Allow transfers under 0.1 ETH",
    defaultEffect: "deny",
    rules: [
      { id: "tool-check", label: "Must use transfer tool", field: "tool", operator: "equals", value: "transfer", rationale: "Only transfers" },
      { id: "amount-cap", label: "Amount at most 0.1", field: "amount", operator: "lte", value: 0.1, rationale: "Spending cap" },
    ],
  };

  const agentA = createDelegate({ policies: [agentAPolicy], chain: { ...CHAIN_CONFIG, privateKey: AGENT_A_KEY } });
  const agentB = createDelegate({ policies: [agentBPolicy], chain: { ...CHAIN_CONFIG, privateKey: AGENT_B_KEY } });
  const owner = createDelegate({ policies: [], chain: { ...CHAIN_CONFIG, privateKey: OWNER_KEY } });

  console.log("Agent A created policy: " + agentAPolicy.name);
  console.log("Agent B created policy: " + agentBPolicy.name);

  // ── STEP 2: Test policies locally ──

  hr("2. Agents test their own policies");

  const goodRequest: AgentActionRequest = { actionType: "read", tool: "read", risk: 2, target: "staging", justification: "test" };
  const badRequest: AgentActionRequest = { actionType: "execute", tool: "exec", risk: 8, target: "prod", justification: "test" };

  const resultGood = agentA.evaluate(agentAPolicy, goodRequest);
  const resultBad = agentA.evaluate(agentAPolicy, badRequest);
  assert(resultGood.outcome === "allow", "Agent A policy allows read/risk-2");
  assert(resultBad.outcome === "deny", "Agent A policy denies execute/risk-8");

  const paymentGood: AgentActionRequest = { actionType: "transfer", tool: "transfer", risk: 1, target: "wallet", justification: "pay", amount: 0.05 };
  const paymentBad: AgentActionRequest = { actionType: "transfer", tool: "transfer", risk: 1, target: "wallet", justification: "pay", amount: 5.0 };

  const payGood = agentB.evaluate(agentBPolicy, paymentGood);
  const payBad = agentB.evaluate(agentBPolicy, paymentBad);
  assert(payGood.outcome === "allow", "Agent B policy allows 0.05 ETH transfer");
  assert(payBad.outcome === "deny", "Agent B policy denies 5.0 ETH transfer");

  // ── STEP 3: Register policies on-chain ──

  hr("3. Register policies on-chain");

  await agentA.registerPolicy(agentAPolicy, "ipfs://agent-a-api-access");
  console.log("Agent A registered policy on-chain");

  await agentB.registerPolicy(agentBPolicy, "ipfs://agent-b-payment");
  console.log("Agent B registered policy on-chain");
  assert(true, "Both policies registered");

  // ── STEP 4: Register agent identities ──

  hr("4. Register agent identities");

  const agentAId = hashObject("agent-alice") as `0x${string}`;
  const agentBId = hashObject("agent-bob") as `0x${string}`;

  await agentA.registerAgent(agentAId, "ipfs://alice-metadata");
  await agentB.registerAgent(agentBId, "ipfs://bob-metadata");
  console.log("Agent A (Alice) registered identity");
  console.log("Agent B (Bob) registered identity");

  // ── STEP 5: Agents commit to their policies ──

  hr("5. Agents commit to policies");

  const policyAHash = hashObject(agentAPolicy) as `0x${string}`;
  const policyBHash = hashObject(agentBPolicy) as `0x${string}`;

  await agentA.commitPolicy(policyAHash);
  await agentB.commitPolicy(policyBHash);
  console.log("Agent A committed to API Access Policy");
  console.log("Agent B committed to Payment Policy");

  // ── STEP 6: Agents look up each other ──

  hr("6. Agents verify each other's commitments");

  const aliceInfo = await agentB.getAgent(AGENT_A_ADDR as `0x${string}`);
  assert(aliceInfo.policyHashes.length > 0, "Agent B can see Alice's committed policies");
  assert(aliceInfo.policyHashes[0] === policyAHash, "Alice's policy hash matches expected");
  console.log(`  Alice's metadata: ${aliceInfo.metadataURI}`);

  const bobInfo = await agentA.getAgent(AGENT_B_ADDR as `0x${string}`);
  assert(bobInfo.policyHashes.length > 0, "Agent A can see Bob's committed policies");
  assert(bobInfo.policyHashes[0] === policyBHash, "Bob's policy hash matches expected");
  console.log(`  Bob's metadata: ${bobInfo.metadataURI}`);

  // ── STEP 7: Form a bilateral agreement ──

  hr("7. Form bilateral agreement under shared policy");

  // They agree to use Agent A's policy for data sharing
  await agentA.proposeAgreement(policyAHash, AGENT_B_ADDR as `0x${string}`);
  console.log("Agent A proposed agreement under API Access Policy");

  // Compute agreement ID
  const { encodeAbiParameters, keccak256 } = await import("viem");
  const agreementId = keccak256(
    encodeAbiParameters(
      [{ type: "bytes32" }, { type: "address" }, { type: "address" }],
      [policyAHash, AGENT_A_ADDR as `0x${string}`, AGENT_B_ADDR as `0x${string}`]
    )
  ) as `0x${string}`;

  await agentB.signAgreement(agreementId);
  console.log("Agent B signed the agreement");

  const agreement = await agentA.getAgreement(agreementId);
  assert(agreement.finalized === true, "Agreement is finalized");
  assert(agreement.partyA === AGENT_A_ADDR, "Party A is Agent A");
  assert(agreement.partyB === AGENT_B_ADDR, "Party B is Agent B");

  // ── STEP 8: Operate under the agreement ──

  hr("8. Agents operate under the shared agreement");

  // Agent A makes a request under the agreed policy
  const dataRequest: AgentActionRequest = {
    actionType: "query",
    tool: "read",
    risk: 1,
    target: "shared-dataset",
    justification: "Fetch data under bilateral agreement",
    agreementId,
  };

  const evalResult = agentA.evaluate(agentAPolicy, dataRequest);
  assert(evalResult.outcome === "allow", "Query under agreement is allowed");

  // Attest the decision
  const attestTx = await agentA.attest(agentAPolicy, dataRequest, evalResult);
  console.log(`  Attested on-chain: ${attestTx.slice(0, 16)}...`);

  // Agent B verifies the decision
  const verified = await agentB.verify(agentAPolicy, dataRequest, evalResult);
  assert(verified === true, "Agent B verified the decision on-chain");

  // Tamper check
  const tamperedRequest = { ...dataRequest, risk: 9 };
  const tamperedResult = agentA.evaluate(agentAPolicy, tamperedRequest);
  const tamperedVerified = await agentB.verify(agentAPolicy, tamperedRequest, tamperedResult);
  assert(tamperedVerified === false, "Tampered request fails verification");

  // ── STEP 9: Vault spending ──

  hr("9. Vault spending with limits");

  // Owner sets up vault for Agent B's payment policy (already registered by Agent B)
  await owner.chainClient!.walletClient.writeContract({
    address: CHAIN_CONFIG.contracts.vault,
    abi: [{ type: "function", name: "deposit", inputs: [{ name: "policyHash", type: "bytes32" }], outputs: [], stateMutability: "payable" }],
    functionName: "deposit",
    args: [policyBHash],
    value: BigInt("500000000000000000"), // 0.5 ETH
  });
  console.log("Owner deposited 0.5 ETH into vault");

  // Set spending limits for Agent B
  const recipient = "0x976EA74026E726554dB657fA54763abd0C3a0aa9"; // Anvil account #6
  await owner.setSpendingLimit(
    policyBHash,
    AGENT_B_ADDR as `0x${string}`,
    BigInt("100000000000000000"),  // 0.1 ETH max per tx
    BigInt("300000000000000000"),  // 0.3 ETH max per day
    [recipient as `0x${string}`],
  );
  console.log("Owner set limits: 0.1 ETH/tx, 0.3 ETH/day");

  // Agent B spends 0.05 ETH - should succeed
  try {
    await agentB.recordSpend(policyBHash, recipient as `0x${string}`, BigInt("50000000000000000"));
    assert(true, "Agent B spent 0.05 ETH - ALLOWED");
  } catch (e) {
    assert(false, `Agent B spend 0.05 ETH should succeed: ${e}`);
  }

  // Agent B tries 0.5 ETH - should fail
  try {
    await agentB.recordSpend(policyBHash, recipient as `0x${string}`, BigInt("500000000000000000"));
    assert(false, "Agent B spend 0.5 ETH should have been denied");
  } catch {
    assert(true, "Agent B spend 0.5 ETH - DENIED (exceeds per-tx limit)");
  }

  // Agent B tries unapproved recipient - should fail
  try {
    await agentB.recordSpend(policyBHash, AGENT_A_ADDR as `0x${string}`, BigInt("10000000000000000"));
    assert(false, "Unapproved recipient should have been denied");
  } catch {
    assert(true, "Unapproved recipient - DENIED");
  }

  // Check vault state
  const spent = await agentB.getSpentToday(policyBHash);
  assert(Number(spent) === 50000000000000000, `Vault shows 0.05 ETH spent today`);

  // ── Summary ──

  hr("RESULTS");
  console.log(`${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); });
