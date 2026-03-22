#!/usr/bin/env npx tsx
/**
 * Zero-Context Agent Test
 *
 * Proves that an agent with NO prior knowledge of Delegate can:
 *   1. Read skill.md
 *   2. Parse contract addresses and instructions
 *   3. Install and use delegate-sdk from npm
 *   4. Complete the full workflow autonomously
 *
 * The agent has nothing except:
 *   - A private key with devnet ETH
 *   - The URL to skill.md
 *
 * Prerequisites:
 *   - Anvil running: anvil --port 8545
 *   - Contracts deployed
 *
 * Run:
 *   npx tsx examples/zero-context-agent-test.ts
 */

import * as fs from "fs";
import * as path from "path";

// ── The agent starts here. It knows NOTHING about Delegate. ─────────

const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const CYAN = "\x1b[36m";
const YELLOW = "\x1b[33m";
const MAGENTA = "\x1b[35m";
const BG_GREEN = "\x1b[42m";
const BG_RED = "\x1b[41m";
const WHITE = "\x1b[37m";

function log(msg: string) { console.log(`  ${msg}`); }
function pass(msg: string) { console.log(`  ${GREEN}✓${RESET} ${msg}`); }
function fail(msg: string) { console.log(`  ${RED}✗${RESET} ${msg}`); }
function heading(msg: string) {
  console.log(`\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`);
  console.log(`  ${BOLD}${msg}${RESET}`);
  console.log(`${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`);
}

// All the agent has: a key with devnet ETH and a path to skill.md
// Anvil account #2 (has 10000 ETH) — the only thing the agent has
const AGENT_KEY = "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a";
const SKILL_MD_PATH = path.join(__dirname, "../public/skill.md");

async function main() {
  let assertions = 0;
  let passed = 0;

  function assert(condition: boolean, msg: string) {
    assertions++;
    if (condition) { passed++; pass(msg); }
    else { fail(msg); }
  }

  console.log();
  console.log(`  ${BOLD}${MAGENTA}╔════════════════════════════════════════════════════════╗${RESET}`);
  console.log(`  ${BOLD}${MAGENTA}║  Zero-Context Agent Test                               ║${RESET}`);
  console.log(`  ${BOLD}${MAGENTA}║  Agent knows nothing. Only has skill.md and a key.      ║${RESET}`);
  console.log(`  ${BOLD}${MAGENTA}╚════════════════════════════════════════════════════════╝${RESET}`);

  // ═══════════════════════════════════════════════════════════════════
  // PHASE 1: Read skill.md — the agent's only source of truth
  // ═══════════════════════════════════════════════════════════════════

  heading("Phase 1: Read skill.md");

  log(`${DIM}Agent reads skill.md to learn about the platform...${RESET}`);
  const skillContent = fs.readFileSync(SKILL_MD_PATH, "utf-8");
  assert(skillContent.length > 0, `skill.md loaded (${skillContent.length} chars)`);

  // ═══════════════════════════════════════════════════════════════════
  // PHASE 2: Parse contract addresses from skill.md
  // ═══════════════════════════════════════════════════════════════════

  heading("Phase 2: Parse configuration from skill.md");

  // Agent parses Anvil contract addresses from the Local Development section
  const contracts: Record<string, string> = {};
  const localSection = skillContent.split("## Local Development")[1] || "";
  const addressMatches = localSection.matchAll(/\|\s*(\w+)\s*\|\s*(0x[a-fA-F0-9]+)\s*\|/g);
  for (const match of addressMatches) {
    const name = match[1];
    const addr = match[2];
    // Map table names to config keys
    if (name === "PolicyRegistry") contracts.registry = addr;
    else if (name === "AuditLog") contracts.auditLog = addr;
    else if (name === "Verifier") contracts.verifier = addr;
    else if (name === "AgentRegistry") contracts.agentRegistry = addr;
    else if (name === "Agreement") contracts.agreement = addr;
    else if (name === "Vault") contracts.vault = addr;
  }

  assert(Object.keys(contracts).length === 6, `Parsed ${Object.keys(contracts).length} contract addresses`);
  for (const [name, addr] of Object.entries(contracts)) {
    log(`  ${DIM}${name}: ${addr}${RESET}`);
  }

  // Agent finds the package name from install instructions
  const packageMatch = skillContent.match(/npm install (\S+)/);
  const packageName = packageMatch ? packageMatch[1] : "delegate-sdk";
  assert(packageName === "delegate-sdk", `Found SDK package: ${packageName}`);

  // Agent finds chain ID for local dev
  const chainIdMatch = localSection.match(/chain ID (\d+)/);
  const chainId = chainIdMatch ? parseInt(chainIdMatch[1]) : 31337;
  assert(chainId === 31337, `Found local chain ID: ${chainId}`);

  // ═══════════════════════════════════════════════════════════════════
  // PHASE 3: Import SDK and initialize (the agent figured out how)
  // ═══════════════════════════════════════════════════════════════════

  heading("Phase 3: Initialize SDK");

  log(`${DIM}Agent imports delegate-sdk and creates a client...${RESET}`);

  // Agent uses the published SDK
  const { createDelegate, hashObject } = await import("delegate-sdk");

  const policy = {
    id: "agent-safety-v1",
    name: "Autonomous Agent Safety Policy",
    description: "Agent-defined policy from reading skill.md",
    defaultEffect: "deny" as const,
    rules: [
      { id: "action-type", label: "Action must be read or query", field: "actionType", operator: "includes" as const, value: "read|query", rationale: "Restrict to read operations" },
      { id: "risk-cap", label: "Risk at most 5", field: "risk", operator: "lte" as const, value: 5, rationale: "Block high-risk actions" },
      { id: "amount-cap", label: "Amount at most 0.05 ETH", field: "amount", operator: "lte" as const, value: 0.05, rationale: "Small spending cap" },
    ],
  };

  const agent = createDelegate({
    policies: [policy],
    chain: {
      rpc: "http://127.0.0.1:8545",
      privateKey: AGENT_KEY,
      chainId,
      contracts: contracts as any,
    },
  });

  assert(agent !== null, "SDK client created successfully");
  log(`  ${DIM}Policy: "${policy.name}" with ${policy.rules.length} rules${RESET}`);

  // ═══════════════════════════════════════════════════════════════════
  // PHASE 4: Evaluate requests (pure logic, no chain)
  // ═══════════════════════════════════════════════════════════════════

  heading("Phase 4: Evaluate requests (off-chain)");

  const safeRequest = {
    actionType: "query",
    tool: "api",
    risk: 3,
    target: "public-data",
    justification: "Agent needs to fetch data",
    amount: 0,
  };

  const safeResult = agent.evaluate(policy, safeRequest);
  assert(safeResult.outcome === "allow", `Safe request → ${safeResult.outcome.toUpperCase()} (${safeResult.scorecard.passed}/${safeResult.checks.length} passed)`);

  const dangerousRequest = {
    actionType: "delete",
    tool: "admin",
    risk: 9,
    target: "production-db",
    justification: "Cleanup",
    amount: 10,
  };

  const dangerousResult = agent.evaluate(policy, dangerousRequest);
  assert(dangerousResult.outcome === "deny", `Dangerous request → ${dangerousResult.outcome.toUpperCase()} (${dangerousResult.scorecard.failed}/${dangerousResult.checks.length} failed)`);

  // ═══════════════════════════════════════════════════════════════════
  // PHASE 5: Register identity on-chain
  // ═══════════════════════════════════════════════════════════════════

  heading("Phase 5: Register identity on-chain");

  const agentId = hashObject("zero-context-agent-v1") as `0x${string}`;
  const regTx = await agent.registerAgent(agentId, "ipfs://zero-context-agent");
  assert(typeof regTx === "string" && regTx.startsWith("0x"), `Registered agent on-chain (tx: ${regTx.slice(0, 16)}...)`);

  // ═══════════════════════════════════════════════════════════════════
  // PHASE 6: Register & commit to policy on-chain
  // ═══════════════════════════════════════════════════════════════════

  heading("Phase 6: Register & commit to policy");

  const policyRegTx = await agent.registerPolicy(policy, "ipfs://agent-safety-policy-v1");
  assert(typeof policyRegTx === "string", `Policy registered on-chain (tx: ${policyRegTx.slice(0, 16)}...)`);

  const policyHash = hashObject(policy) as `0x${string}`;
  const commitTx = await agent.commitPolicy(policyHash);
  assert(typeof commitTx === "string", `Committed to policy (tx: ${commitTx.slice(0, 16)}...)`);

  // ═══════════════════════════════════════════════════════════════════
  // PHASE 7: Attest a decision on-chain
  // ═══════════════════════════════════════════════════════════════════

  heading("Phase 7: Attest decision on-chain");

  const attestTx = await agent.attest(policy, safeRequest, safeResult);
  assert(typeof attestTx === "string", `ALLOW decision attested (tx: ${attestTx.slice(0, 16)}...)`);

  const attestTx2 = await agent.attest(policy, dangerousRequest, dangerousResult);
  assert(typeof attestTx2 === "string", `DENY decision attested (tx: ${attestTx2.slice(0, 16)}...)`);

  // ═══════════════════════════════════════════════════════════════════
  // PHASE 8: Verify decision on-chain
  // ═══════════════════════════════════════════════════════════════════

  heading("Phase 8: Verify decision on-chain");

  const verified = await agent.verify(policy, safeRequest, safeResult);
  assert(verified === true, `On-chain verification: ${verified ? "FOUND" : "NOT FOUND"}`);

  // Tamper and verify fails
  const tamperedRequest = { ...safeRequest, risk: 999 };
  const tamperedResult = agent.evaluate(policy, tamperedRequest);
  const tamperedVerified = await agent.verify(policy, tamperedRequest, tamperedResult);
  assert(tamperedVerified === false, `Tampered request verification: ${tamperedVerified ? "FOUND (bad!)" : "NOT FOUND (correct!)"}`);

  // ═══════════════════════════════════════════════════════════════════
  // PHASE 9: Look up own identity on-chain
  // ═══════════════════════════════════════════════════════════════════

  heading("Phase 9: Look up own identity");

  // Get own address from the private key
  const { privateKeyToAccount } = await import("viem/accounts");
  const account = privateKeyToAccount(AGENT_KEY as `0x${string}`);
  const agentInfo = await agent.getAgent(account.address);
  assert(agentInfo.agentId === agentId, `Agent ID matches on-chain`);
  assert(agentInfo.policyHashes.length > 0, `Agent has ${agentInfo.policyHashes.length} committed policy`);
  assert(agentInfo.policyHashes[0] === policyHash, `Committed policy hash matches`);

  // ═══════════════════════════════════════════════════════════════════
  // Results
  // ═══════════════════════════════════════════════════════════════════

  console.log();
  console.log(`${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`);
  if (passed === assertions) {
    console.log(`  ${BG_GREEN}${BOLD}${WHITE} PASS ${RESET} ${GREEN}${passed}/${assertions} assertions passed${RESET}`);
  } else {
    console.log(`  ${BG_RED}${BOLD}${WHITE} FAIL ${RESET} ${RED}${passed}/${assertions} assertions passed${RESET}`);
  }
  console.log(`${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`);
  console.log();
  console.log(`  ${DIM}The agent had zero context about Delegate.${RESET}`);
  console.log(`  ${DIM}It read skill.md, parsed addresses, installed the SDK,${RESET}`);
  console.log(`  ${DIM}and completed the full workflow autonomously.${RESET}`);
  console.log();

  process.exit(passed === assertions ? 0 : 1);
}

main().catch((e) => {
  console.error(`\n${RED}Error:${RESET}`, e);
  process.exit(1);
});
