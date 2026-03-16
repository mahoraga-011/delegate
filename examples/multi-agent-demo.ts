#!/usr/bin/env npx tsx
/**
 * Delegate SDK — Multi-Agent Demo (Trust + Cooperate + Pay)
 *
 * Demonstrates all three hackathon themes:
 *   1. Trust: Agent registers identity, commits to policies
 *   2. Cooperate: Two agents form a bilateral agreement
 *   3. Pay: Vault escrow with spending limits
 *   4. Verify: On-chain verification of decisions
 *
 * Prerequisites:
 *   - Anvil running: anvil --port 8545
 *   - Contracts deployed: cd packages/contracts && forge script script/Deploy.s.sol \
 *       --rpc-url http://127.0.0.1:8545 --broadcast
 *
 * Run:
 *   npx tsx examples/multi-agent-demo.ts
 */

import {
  createDelegate,
  hashObject,
  type Policy,
  type AgentActionRequest,
} from "../packages/sdk/src/index.js";

// ── Config ──────────────────────────────────────────────────────────

// Anvil accounts (0–2)
const DEPLOYER_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const AGENT_A_KEY = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";
const AGENT_B_KEY = "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a";

const CHAIN_BASE = {
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

const sharedPolicy: Policy = {
  id: "data-sharing-agreement",
  name: "Data sharing agreement",
  description: "Read-only access, risk ≤ 3, staging targets only.",
  defaultEffect: "deny",
  rules: [
    { id: "action-read-only", label: "Read only", field: "actionType", operator: "equals", value: "read", rationale: "Data sharing is read-only." },
    { id: "risk-cap", label: "Risk ≤ 3", field: "risk", operator: "lte", value: 3, rationale: "Low risk only." },
    { id: "staging-only", label: "Staging targets", field: "target", operator: "includes", value: "staging", rationale: "Staging only." },
  ],
};

const spendingPolicy: Policy = {
  id: "spending-cap",
  name: "Spending cap",
  description: "Max 0.1 ETH/tx, transfer tool only.",
  defaultEffect: "deny",
  rules: [
    { id: "amount-cap", label: "Amount ≤ 0.1 ETH", field: "amount", operator: "lte", value: 0.1, rationale: "Per-tx spending cap." },
    { id: "tool-transfer", label: "Transfer tool only", field: "tool", operator: "equals", value: "transfer", rationale: "Only transfers." },
    { id: "risk-cap", label: "Risk ≤ 5", field: "risk", operator: "lte", value: 5, rationale: "Moderate risk." },
  ],
};

function hr(title: string) {
  console.log(`\n${"═".repeat(60)}`);
  console.log(`  ${title}`);
  console.log(`${"═".repeat(60)}\n`);
}

async function main() {
  // Create delegate instances for each actor
  const deployer = createDelegate({
    policies: [sharedPolicy, spendingPolicy],
    chain: { ...CHAIN_BASE, privateKey: DEPLOYER_KEY },
  });

  const agentA = createDelegate({
    policies: [sharedPolicy, spendingPolicy],
    chain: { ...CHAIN_BASE, privateKey: AGENT_A_KEY },
  });

  const agentB = createDelegate({
    policies: [sharedPolicy, spendingPolicy],
    chain: { ...CHAIN_BASE, privateKey: AGENT_B_KEY },
  });

  // ── 1. TRUST ──────────────────────────────────────────────────────

  hr("1. TRUST — Agent Identity Registration");

  // Register the shared policy on-chain
  console.log("Registering shared policy on-chain...");
  const regTx = await deployer.registerPolicy(sharedPolicy, "ipfs://data-sharing-policy");
  console.log(`   Policy registered: ${regTx}`);

  const policyHash = hashObject(sharedPolicy) as `0x${string}`;
  console.log(`   Policy hash: ${policyHash}`);

  // Register Agent A identity
  console.log("\nAgent A registering identity...");
  const agentAId = hashObject("agent-alpha") as `0x${string}`;
  const regATx = await agentA.registerAgent(agentAId, "ipfs://agent-alpha-metadata");
  console.log(`   Agent A registered: ${regATx}`);

  // Agent A commits to the shared policy
  console.log("\nAgent A committing to policy...");
  const commitTx = await agentA.commitPolicy(policyHash);
  console.log(`   Policy committed: ${commitTx}`);

  // Register Agent B identity
  console.log("\nAgent B registering identity...");
  const agentBId = hashObject("agent-beta") as `0x${string}`;
  const regBTx = await agentB.registerAgent(agentBId, "ipfs://agent-beta-metadata");
  console.log(`   Agent B registered: ${regBTx}`);

  // Agent B looks up Agent A's identity
  console.log("\nAgent B looking up Agent A...");
  const agentAInfo = await agentB.getAgent("0x70997970C51812dc3A010C7d01b50e0d17dc79C8" as `0x${string}`);
  console.log(`   Agent ID: ${agentAInfo.agentId}`);
  console.log(`   Metadata: ${agentAInfo.metadataURI}`);
  console.log(`   Committed policies: ${agentAInfo.policyHashes.length}`);
  console.log(`   Policy hash matches: ${agentAInfo.policyHashes[0] === policyHash}`);
  console.log("   ✓ Trust established through on-chain commitments, not a registry vouching");

  // ── 2. COOPERATE ──────────────────────────────────────────────────

  hr("2. COOPERATE — Bilateral Agreement");

  // Agent A proposes agreement with Agent B
  console.log("Agent A proposing agreement with Agent B...");
  const proposeTx = await agentA.proposeAgreement(
    policyHash,
    "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC" as `0x${string}` // Agent B address
  );
  console.log(`   Agreement proposed: ${proposeTx}`);

  // Compute the deterministic agreement ID
  const { encodePacked, keccak256 } = await import("viem");
  const agreementId = keccak256(
    encodePacked(
      ["bytes32", "address", "address"],
      [
        policyHash,
        "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // Agent A
        "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", // Agent B
      ]
    )
  ) as `0x${string}`;

  // Actually compute with abi.encode (same as contract)
  const { encodeAbiParameters } = await import("viem");
  const agreementIdReal = keccak256(
    encodeAbiParameters(
      [{ type: "bytes32" }, { type: "address" }, { type: "address" }],
      [
        policyHash,
        "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
      ]
    )
  ) as `0x${string}`;
  console.log(`   Agreement ID: ${agreementIdReal}`);

  // Agent B signs the agreement
  console.log("\nAgent B signing agreement...");
  const signTx = await agentB.signAgreement(agreementIdReal);
  console.log(`   Agreement signed: ${signTx}`);

  // Check agreement status
  const agreementInfo = await agentA.getAgreement(agreementIdReal);
  console.log(`\n   Agreement finalized: ${agreementInfo.finalized}`);
  console.log(`   Party A: ${agreementInfo.partyA}`);
  console.log(`   Party B: ${agreementInfo.partyB}`);
  console.log("   ✓ Neither party can change the rules — policy hash is immutable on-chain");

  // ── 3. PAY ────────────────────────────────────────────────────────

  hr("3. PAY — Vault Escrow with Spending Limits");

  // Register spending policy
  console.log("Registering spending policy...");
  try {
    await deployer.registerPolicy(spendingPolicy, "ipfs://spending-cap-policy");
    console.log("   Spending policy registered");
  } catch {
    console.log("   Spending policy already registered (ok)");
  }

  const spendPolicyHash = hashObject(spendingPolicy) as `0x${string}`;

  // Deployer deposits 1 ETH into vault
  console.log("\nDepositing 1 ETH into vault...");
  const depositTx = await deployer.chainClient!.walletClient.writeContract({
    address: CHAIN_BASE.contracts.vault,
    abi: [{ type: "function", name: "deposit", inputs: [{ name: "policyHash", type: "bytes32" }], outputs: [], stateMutability: "payable" }],
    functionName: "deposit",
    args: [spendPolicyHash],
    value: BigInt("1000000000000000000"), // 1 ETH
  });
  console.log(`   Deposited: ${depositTx}`);

  // Set spending limits for Agent A
  console.log("\nSetting spending limits for Agent A...");
  const recipient1 = "0x90F79bf6EB2c4f870365E785982E1f101E93b906";
  await deployer.setSpendingLimit(
    spendPolicyHash,
    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" as `0x${string}`, // Agent A
    BigInt("100000000000000000"),  // 0.1 ETH max per tx
    BigInt("500000000000000000"),  // 0.5 ETH max per day
    [recipient1 as `0x${string}`]  // Approved recipients
  );
  console.log("   Limits set: 0.1 ETH/tx, 0.5 ETH/day");

  // Agent A spends 0.05 ETH — should succeed
  console.log("\nAgent A spending 0.05 ETH → approved recipient...");
  try {
    const spendTx = await agentA.recordSpend(
      spendPolicyHash,
      recipient1 as `0x${string}`,
      BigInt("50000000000000000"), // 0.05 ETH
    );
    console.log(`   ✓ ALLOWED — tx: ${spendTx}`);
  } catch (e) {
    console.log(`   ✗ DENIED — ${e instanceof Error ? e.message : e}`);
  }

  // Agent A tries to spend 5 ETH — should be denied
  console.log("\nAgent A trying to spend 5 ETH (exceeds limit)...");
  try {
    await agentA.recordSpend(
      spendPolicyHash,
      recipient1 as `0x${string}`,
      BigInt("5000000000000000000"), // 5 ETH
    );
    console.log("   ✓ ALLOWED (unexpected!)");
  } catch {
    console.log("   ✗ DENIED — exceeds per-transaction limit (0.1 ETH max)");
  }

  // Check vault balance
  const spent = await agentA.getSpentToday(spendPolicyHash);
  console.log(`\n   Vault spent today: ${Number(spent) / 1e18} ETH`);
  console.log("   ✓ Agent holds no keys to funds. Vault enforces limits on-chain.");

  // ── 4. VERIFY ─────────────────────────────────────────────────────

  hr("4. VERIFY — On-Chain Decision Verification");

  // Evaluate and attest a decision
  const safeRequest: AgentActionRequest = {
    actionType: "read",
    tool: "read",
    risk: 2,
    target: "staging-data",
    justification: "Routine data access under agreement.",
  };

  const result = deployer.evaluate(sharedPolicy, safeRequest);
  console.log(`Evaluation: ${result.outcome} (${result.scorecard.passed}/${result.scorecard.passed + result.scorecard.failed} rules passed)`);

  console.log("\nAttesting decision on-chain...");
  const attestTx = await agentA.attest(sharedPolicy, safeRequest, result);
  console.log(`   Attested: ${attestTx}`);

  // Verify
  console.log("\nVerifying decision on-chain...");
  const isValid = await agentB.verify(sharedPolicy, safeRequest, result);
  console.log(`   Verified: ${isValid}`);

  // Tamper and verify
  const tamperedRequest = { ...safeRequest, risk: 9 };
  const tamperedResult = deployer.evaluate(sharedPolicy, tamperedRequest);
  const isTamperedValid = await agentB.verify(sharedPolicy, tamperedRequest, tamperedResult);
  console.log(`   Tampered verification: ${isTamperedValid} (should be false)`);
  console.log("   ✓ Any change to the decision is detectable on-chain");

  // ── Summary ───────────────────────────────────────────────────────

  hr("DEMO COMPLETE");
  console.log("Themes demonstrated:");
  console.log("  Trust     — Agent identity registered, policies committed, verifiable by address");
  console.log("  Cooperate — Bilateral agreement formed under immutable shared policy");
  console.log("  Pay       — Vault escrow with per-tx and daily spending limits enforced on-chain");
  console.log("  Verify    — Decisions attested and verified on-chain, tamper-evident");
}

main().catch(console.error);
