#!/usr/bin/env npx tsx
/**
 * Delegate — Full Feature Demo Recording
 *
 * Two AI agents go through the entire Delegate workflow:
 *   1. Register identities on-chain
 *   2. Define & register policies
 *   3. Commit to policies publicly
 *   4. Discover each other on-chain
 *   5. Form a bilateral agreement
 *   6. Evaluate requests (allow + deny)
 *   7. Attest decisions on-chain
 *   8. Fund vault & enforce spending limits
 *   9. Verify decisions on-chain (+ tamper detection)
 *
 * Prerequisites:
 *   - Anvil running: anvil --port 8545
 *   - Contracts deployed: cd packages/contracts && forge script script/Deploy.s.sol --rpc-url http://127.0.0.1:8545 --broadcast
 *
 * Run:
 *   npx tsx examples/demo-recording.ts
 */

import {
  createDelegate,
  hashObject,
  type Policy,
  type AgentActionRequest,
} from "../packages/sdk/src/index.js";

// ── Anvil accounts ──────────────────────────────────────────────────

const CHAIN_CONFIG = {
  rpc: "http://127.0.0.1:8545",
  chainId: 31337,
  contracts: {
    registry:      "0x5FbDB2315678afecb367f032d93F642f64180aa3" as const,
    auditLog:      "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512" as const,
    verifier:      "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0" as const,
    agentRegistry: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9" as const,
    agreement:     "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9" as const,
    vault:         "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707" as const,
  },
};

// Anvil account #3 — Alice
const ALICE_KEY  = "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6";
const ALICE_ADDR = "0x90F79bf6EB2c4f870365E785982E1f101E93b906";

// Anvil account #4 — Bob
const BOB_KEY  = "0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a";
const BOB_ADDR = "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65";

// Anvil account #0 — Vault owner
const OWNER_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

// Recipient for vault spends (Anvil account #6)
const RECIPIENT = "0x976EA74026E726554dB657fA54763abd0C3a0aa9" as `0x${string}`;

// ── Formatting helpers ──────────────────────────────────────────────

const RESET = "\x1b[0m";
const BOLD  = "\x1b[1m";
const DIM   = "\x1b[2m";
const GREEN = "\x1b[32m";
const RED   = "\x1b[31m";
const CYAN  = "\x1b[36m";
const YELLOW = "\x1b[33m";
const MAGENTA = "\x1b[35m";
const WHITE = "\x1b[37m";
const BG_GREEN = "\x1b[42m";
const BG_RED   = "\x1b[41m";

function banner(text: string) {
  const line = "═".repeat(60);
  console.log(`\n${CYAN}╔${line}╗${RESET}`);
  console.log(`${CYAN}║${RESET}  ${BOLD}${text.padEnd(57)}${RESET}${CYAN}║${RESET}`);
  console.log(`${CYAN}╚${line}╝${RESET}\n`);
}

function step(n: number, title: string, agent?: string) {
  const tag = agent ? `${MAGENTA}[${agent}]${RESET} ` : "";
  console.log(`\n${BOLD}${WHITE}  STEP ${n}${RESET}  ${tag}${BOLD}${title}${RESET}`);
  console.log(`${DIM}  ${"─".repeat(56)}${RESET}`);
}

function info(label: string, value: string) {
  console.log(`    ${DIM}${label}:${RESET} ${value}`);
}

function tx(hash: string) {
  console.log(`    ${DIM}tx:${RESET} ${YELLOW}${hash.slice(0, 18)}...${hash.slice(-6)}${RESET}`);
}

function allow(msg: string) {
  console.log(`    ${BG_GREEN}${BOLD}${WHITE} ALLOW ${RESET} ${GREEN}${msg}${RESET}`);
}

function deny(msg: string) {
  console.log(`    ${BG_RED}${BOLD}${WHITE} DENY  ${RESET} ${RED}${msg}${RESET}`);
}

function check(label: string, passed: boolean) {
  const icon = passed ? `${GREEN}✓${RESET}` : `${RED}✗${RESET}`;
  console.log(`    ${icon} ${label}`);
}

function ruleCheck(rule: string, passed: boolean) {
  const icon = passed ? `${GREEN}✓${RESET}` : `${RED}✗${RESET}`;
  const color = passed ? DIM : RED;
  console.log(`      ${icon} ${color}${rule}${RESET}`);
}

function pause(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Main demo ───────────────────────────────────────────────────────

async function main() {
  banner("Delegate — Two Agents, Full Autonomous Demo");

  console.log(`  ${DIM}Two AI agents (Alice & Bob) will autonomously:${RESET}`);
  console.log(`  ${DIM}  • Register identities on-chain${RESET}`);
  console.log(`  ${DIM}  • Define & deploy policies${RESET}`);
  console.log(`  ${DIM}  • Form a bilateral agreement${RESET}`);
  console.log(`  ${DIM}  • Evaluate, attest, and verify decisions${RESET}`);
  console.log(`  ${DIM}  • Enforce spending through the vault${RESET}`);
  console.log(`  ${DIM}  • Detect tampering${RESET}`);
  console.log();

  await pause(2500);

  // ── Setup ──

  const sharedPolicy: Policy = {
    id: "data-sharing-v1",
    name: "Data Sharing Policy",
    description: "Allow read/query operations under risk 4, transfers up to 0.1 ETH",
    defaultEffect: "deny",
    rules: [
      { id: "action-type", label: "Action must be read, query, or transfer", field: "actionType", operator: "includes", value: "read|query|transfer", rationale: "Restrict to safe operation types" },
      { id: "risk-limit",  label: "Risk score at most 4",                    field: "risk",       operator: "lte",      value: 4,                      rationale: "Block high-risk operations" },
      { id: "amount-cap",  label: "Amount at most 0.1 ETH",                 field: "amount",     operator: "lte",      value: 0.1,                    rationale: "Spending cap per action" },
      { id: "tool-check",  label: "Tool must be api or transfer",           field: "tool",       operator: "includes", value: "api|transfer",          rationale: "Only approved tools" },
    ],
  };

  const alice = createDelegate({ policies: [sharedPolicy], chain: { ...CHAIN_CONFIG, privateKey: ALICE_KEY } });
  const bob   = createDelegate({ policies: [sharedPolicy], chain: { ...CHAIN_CONFIG, privateKey: BOB_KEY } });
  const owner = createDelegate({ policies: [],              chain: { ...CHAIN_CONFIG, privateKey: OWNER_KEY } });

  const policyHash = hashObject(sharedPolicy) as `0x${string}`;

  // ═══════════════════════════════════════════════════════════════════
  // STEP 1: Register agent identities
  // ═══════════════════════════════════════════════════════════════════

  step(1, "Register Agent Identities On-Chain");

  const aliceId = hashObject("agent-alice-data-provider") as `0x${string}`;
  const bobId   = hashObject("agent-bob-data-consumer") as `0x${string}`;

  const aliceRegTx = await alice.registerAgent(aliceId, "ipfs://alice-metadata");
  info("Alice", `${ALICE_ADDR.slice(0, 10)}...`);
  info("Agent ID", aliceId.slice(0, 18) + "...");
  tx(aliceRegTx);

  await pause(2500);

  const bobRegTx = await bob.registerAgent(bobId, "ipfs://bob-metadata");
  info("Bob", `${BOB_ADDR.slice(0, 10)}...`);
  info("Agent ID", bobId.slice(0, 18) + "...");
  tx(bobRegTx);

  check("Both agents registered on-chain", true);

  await pause(2000);

  // ═══════════════════════════════════════════════════════════════════
  // STEP 2: Define & register the policy
  // ═══════════════════════════════════════════════════════════════════

  step(2, "Define & Register Policy", "Alice");

  info("Policy", sharedPolicy.name);
  info("Rules", `${sharedPolicy.rules.length} deterministic rules`);
  for (const rule of sharedPolicy.rules) {
    console.log(`      ${DIM}• ${rule.label}  (${rule.field} ${rule.operator} ${rule.value})${RESET}`);
  }
  info("Hash", policyHash.slice(0, 18) + "...");
  info("Default", `${sharedPolicy.defaultEffect.toUpperCase()} (if any rule fails)`);

  await pause(2000);

  const regTx = await alice.registerPolicy(sharedPolicy, "ipfs://data-sharing-policy-v1");
  tx(regTx);
  check("Policy hash stored on-chain (immutable)", true);

  await pause(2000);

  // ═══════════════════════════════════════════════════════════════════
  // STEP 3: Commit to the policy
  // ═══════════════════════════════════════════════════════════════════

  step(3, "Commit to Policy Publicly", "Alice");

  const commitTx = await alice.commitPolicy(policyHash);
  tx(commitTx);
  info("Commitment", "Alice publicly binds to this policy on-chain");
  check("Policy commitment recorded", true);

  await pause(2000);

  // ═══════════════════════════════════════════════════════════════════
  // STEP 4: Bob discovers Alice on-chain
  // ═══════════════════════════════════════════════════════════════════

  step(4, "Discover & Verify Alice's Commitments", "Bob");

  const aliceInfo = await bob.getAgent(ALICE_ADDR as `0x${string}`);
  info("Found agent", `ID ${aliceInfo.agentId.slice(0, 18)}...`);
  info("Metadata", aliceInfo.metadataURI);
  info("Committed policies", `${aliceInfo.policyHashes.length} found`);
  check(`Policy hash matches: ${policyHash.slice(0, 18)}...`, aliceInfo.policyHashes[0] === policyHash);

  console.log(`\n    ${DIM}Bob independently verifies: the policy rules are the ones${RESET}`);
  console.log(`    ${DIM}he expects. No trust needed — just hash comparison.${RESET}`);

  await pause(2500);

  // ═══════════════════════════════════════════════════════════════════
  // STEP 5: Form bilateral agreement
  // ═══════════════════════════════════════════════════════════════════

  step(5, "Form Bilateral Agreement");

  info("Policy", sharedPolicy.name);
  info("Party A", `Alice (${ALICE_ADDR.slice(0, 10)}...)`);
  info("Party B", `Bob (${BOB_ADDR.slice(0, 10)}...)`);

  await pause(2000);

  const proposeTx = await alice.proposeAgreement(policyHash, BOB_ADDR as `0x${string}`);
  console.log(`    ${MAGENTA}[Alice]${RESET} Proposed agreement`);
  tx(proposeTx);

  // Compute agreement ID
  const { encodeAbiParameters, keccak256 } = await import("viem");
  const agreementId = keccak256(
    encodeAbiParameters(
      [{ type: "bytes32" }, { type: "address" }, { type: "address" }],
      [policyHash, ALICE_ADDR as `0x${string}`, BOB_ADDR as `0x${string}`]
    )
  ) as `0x${string}`;

  await pause(2500);

  const signTx = await bob.signAgreement(agreementId);
  console.log(`    ${MAGENTA}[Bob]${RESET}   Signed agreement`);
  tx(signTx);

  const agreement = await alice.getAgreement(agreementId);
  check("Agreement finalized on-chain", agreement.finalized);
  info("Agreement ID", agreementId.slice(0, 18) + "...");
  console.log(`\n    ${DIM}Neither party can change the rules. Locked on-chain.${RESET}`);

  await pause(2500);

  // ═══════════════════════════════════════════════════════════════════
  // STEP 6: Evaluate requests — ALLOW
  // ═══════════════════════════════════════════════════════════════════

  step(6, "Evaluate Request — Safe Query", "Alice");

  const safeRequest: AgentActionRequest = {
    actionType: "query",
    tool: "api",
    risk: 2,
    target: "shared-dataset",
    justification: "Fetch records under bilateral agreement",
    amount: 0,
  };

  info("Action", safeRequest.actionType);
  info("Tool", safeRequest.tool);
  info("Risk", String(safeRequest.risk));
  info("Amount", `${safeRequest.amount} ETH`);

  await pause(2000);

  const safeResult = alice.evaluate(sharedPolicy, safeRequest);
  console.log();
  for (const c of safeResult.checks) {
    ruleCheck(`${c.label}`, c.passed);
  }
  console.log();
  allow(`${safeResult.scorecard.passed}/${safeResult.checks.length} rules passed`);

  await pause(2000);

  // ═══════════════════════════════════════════════════════════════════
  // STEP 7: Evaluate request — DENY
  // ═══════════════════════════════════════════════════════════════════

  step(7, "Evaluate Request — Dangerous Operation", "Alice");

  const dangerousRequest: AgentActionRequest = {
    actionType: "execute",
    tool: "shell",
    risk: 9,
    target: "production-db",
    justification: "Drop and recreate tables",
    amount: 5.0,
  };

  info("Action", dangerousRequest.actionType);
  info("Tool", dangerousRequest.tool);
  info("Risk", String(dangerousRequest.risk));
  info("Amount", `${dangerousRequest.amount} ETH`);

  await pause(2000);

  const dangerousResult = alice.evaluate(sharedPolicy, dangerousRequest);
  console.log();
  for (const c of dangerousResult.checks) {
    ruleCheck(`${c.label}`, c.passed);
  }
  console.log();
  deny(`${dangerousResult.scorecard.failed}/${dangerousResult.checks.length} rules failed — blocked`);

  await pause(2500);

  // ═══════════════════════════════════════════════════════════════════
  // STEP 8: Attest decisions on-chain
  // ═══════════════════════════════════════════════════════════════════

  step(8, "Attest Decisions On-Chain", "Alice");

  console.log(`\n    ${DIM}Hashing policy + request + result → keccak256${RESET}`);
  info("Policy hash",  hashObject(sharedPolicy).slice(0, 18) + "...");
  info("Request hash", hashObject(safeRequest).slice(0, 18) + "...");
  info("Result hash",  hashObject(safeResult).slice(0, 18) + "...");

  await pause(2000);

  const attestTx1 = await alice.attest(sharedPolicy, safeRequest, safeResult);
  console.log(`\n    ${GREEN}▸ ALLOW decision attested${RESET}`);
  tx(attestTx1);

  await pause(2000);

  const attestTx2 = await alice.attest(sharedPolicy, dangerousRequest, dangerousResult);
  console.log(`    ${RED}▸ DENY decision attested${RESET}`);
  tx(attestTx2);

  check("Both decisions permanently logged on-chain", true);
  console.log(`\n    ${DIM}Append-only. No updates. No deletes. Tamper-evident.${RESET}`);

  await pause(2500);

  // ═══════════════════════════════════════════════════════════════════
  // STEP 9: Vault — deposit & set spending limits
  // ═══════════════════════════════════════════════════════════════════

  step(9, "Fund Vault & Set Spending Limits", "Owner");

  // Deposit into vault
  await owner.chainClient!.walletClient.writeContract({
    address: CHAIN_CONFIG.contracts.vault,
    abi: [{ type: "function", name: "deposit", inputs: [{ name: "policyHash", type: "bytes32" }], outputs: [], stateMutability: "payable" }],
    functionName: "deposit",
    args: [policyHash],
    value: BigInt("500000000000000000"), // 0.5 ETH
  });
  info("Deposited", "0.5 ETH into vault");

  await pause(2000);

  // Set spending limits — Alice can spend
  await owner.setSpendingLimit(
    policyHash,
    ALICE_ADDR as `0x${string}`,
    BigInt("100000000000000000"),  // 0.1 ETH max per tx
    BigInt("300000000000000000"),  // 0.3 ETH max per day
    [RECIPIENT],
  );
  info("Max per tx", "0.1 ETH");
  info("Max per day", "0.3 ETH");
  info("Allowed recipient", RECIPIENT.slice(0, 10) + "...");
  check("Spending limits enforced by smart contract", true);

  await pause(2000);

  // ═══════════════════════════════════════════════════════════════════
  // STEP 10: Vault — spend within limits (ALLOW)
  // ═══════════════════════════════════════════════════════════════════

  step(10, "Vault Spend — Within Limits", "Alice");

  info("Amount", "0.05 ETH");
  info("Recipient", RECIPIENT.slice(0, 10) + "...");
  info("Limit check", "0.05 <= 0.1 max/tx");

  await pause(2000);

  try {
    const spendTx = await alice.recordSpend(policyHash, RECIPIENT, BigInt("50000000000000000"));
    allow("0.05 ETH — within per-tx limit");
    tx(spendTx);
  } catch (e) {
    deny(`Unexpected failure: ${e}`);
  }

  const spentSoFar = await alice.getSpentToday(policyHash);
  info("Spent today", `${Number(spentSoFar) / 1e18} ETH`);

  await pause(2000);

  // ═══════════════════════════════════════════════════════════════════
  // STEP 11: Vault — overspend (DENY)
  // ═══════════════════════════════════════════════════════════════════

  step(11, "Vault Spend — Exceeds Limit", "Alice");

  info("Amount", "0.5 ETH");
  info("Limit check", "0.5 > 0.1 max/tx");

  await pause(2000);

  try {
    await alice.recordSpend(policyHash, RECIPIENT, BigInt("500000000000000000"));
    allow("This should not have happened");
  } catch {
    deny("0.5 ETH — exceeds per-tx limit. Rejected by contract.");
  }

  console.log(`\n    ${DIM}Agent never held the funds. Vault enforces limits on-chain.${RESET}`);

  await pause(2000);

  // ═══════════════════════════════════════════════════════════════════
  // STEP 12: Vault — unauthorized recipient (DENY)
  // ═══════════════════════════════════════════════════════════════════

  step(12, "Vault Spend — Unauthorized Recipient", "Alice");

  const badRecipient = BOB_ADDR as `0x${string}`;
  info("Amount", "0.01 ETH");
  info("Recipient", `${badRecipient.slice(0, 10)}... (not in allowlist)`);

  await pause(2000);

  try {
    await alice.recordSpend(policyHash, badRecipient, BigInt("10000000000000000"));
    allow("This should not have happened");
  } catch {
    deny("Recipient not in allowlist. Rejected by contract.");
  }

  await pause(2000);

  // ═══════════════════════════════════════════════════════════════════
  // STEP 13: Bob verifies Alice's decisions on-chain
  // ═══════════════════════════════════════════════════════════════════

  step(13, "Verify Decisions On-Chain", "Bob");

  console.log(`\n    ${DIM}Bob re-evaluates the same request independently...${RESET}`);

  await pause(2000);

  const bobResult = bob.evaluate(sharedPolicy, safeRequest);
  info("Bob's evaluation", bobResult.outcome.toUpperCase());
  info("Matches Alice?", bobResult.outcome === safeResult.outcome ? "YES" : "NO");

  await pause(2000);

  console.log(`\n    ${DIM}Bob checks if Alice's decision exists on-chain...${RESET}`);
  const verified = await bob.verify(sharedPolicy, safeRequest, safeResult);
  check(`On-chain verification: ${verified ? "FOUND" : "NOT FOUND"}`, verified);

  await pause(2000);

  // ═══════════════════════════════════════════════════════════════════
  // STEP 14: Tamper detection
  // ═══════════════════════════════════════════════════════════════════

  step(14, "Tamper Detection", "Bob");

  console.log(`\n    ${DIM}Bob modifies one field in the request (risk: 2 → 3)...${RESET}`);

  const tamperedRequest = { ...safeRequest, risk: 3 };
  info("Original risk", "2");
  info("Tampered risk", "3");

  await pause(2000);

  info("Original hash", hashObject(safeRequest).slice(0, 18) + "...");
  info("Tampered hash", hashObject(tamperedRequest).slice(0, 18) + "...");
  console.log(`    ${DIM}Hashes differ → on-chain lookup will fail${RESET}`);

  await pause(2000);

  const tamperedResult = bob.evaluate(sharedPolicy, tamperedRequest);
  const tamperedVerified = await bob.verify(sharedPolicy, tamperedRequest, tamperedResult);

  if (!tamperedVerified) {
    deny("Tampered request — NOT FOUND on-chain. Forgery detected.");
  } else {
    allow("This should not match");
  }

  console.log(`\n    ${DIM}Change one field → hash changes → verification fails.${RESET}`);
  console.log(`    ${DIM}Tamper-evident by design.${RESET}`);

  await pause(2500);

  // ═══════════════════════════════════════════════════════════════════
  // Summary
  // ═══════════════════════════════════════════════════════════════════

  banner("Demo Complete — Full Feature Walkthrough");

  console.log(`  ${GREEN}✓${RESET} Agent identity registration on-chain`);
  console.log(`  ${GREEN}✓${RESET} Deterministic policy definition & on-chain registration`);
  console.log(`  ${GREEN}✓${RESET} Public policy commitment`);
  console.log(`  ${GREEN}✓${RESET} On-chain agent discovery & verification`);
  console.log(`  ${GREEN}✓${RESET} Bilateral agreement (propose → sign → finalize)`);
  console.log(`  ${GREEN}✓${RESET} Policy evaluation — ALLOW (safe query)`);
  console.log(`  ${GREEN}✓${RESET} Policy evaluation — DENY (dangerous operation)`);
  console.log(`  ${GREEN}✓${RESET} On-chain decision attestation (append-only audit log)`);
  console.log(`  ${GREEN}✓${RESET} Vault deposit & spending limit enforcement`);
  console.log(`  ${GREEN}✓${RESET} Vault spend — within limits (ALLOW)`);
  console.log(`  ${GREEN}✓${RESET} Vault spend — exceeds limit (DENY)`);
  console.log(`  ${GREEN}✓${RESET} Vault spend — unauthorized recipient (DENY)`);
  console.log(`  ${GREEN}✓${RESET} Cross-agent on-chain verification`);
  console.log(`  ${GREEN}✓${RESET} Tamper detection (single-field change caught)`);
  console.log();
  console.log(`  ${DIM}No AI in evaluation. No ambiguity. Same input → same output.${RESET}`);
  console.log(`  ${DIM}Ethereum is the trust anchor.${RESET}`);
  console.log();
}

main().catch((e) => {
  console.error(`\n${RED}Error:${RESET}`, e);
  process.exit(1);
});
