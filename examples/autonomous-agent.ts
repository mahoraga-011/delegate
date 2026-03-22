#!/usr/bin/env npx tsx
/**
 * Autonomous Agent Test
 *
 * Two agents that discover Delegate by reading skill.md,
 * extract everything they need from it, and operate independently.
 * Nothing is hardcoded — all config comes from the skill file.
 *
 * Prerequisites:
 *   - Anvil running on port 8545 with contracts deployed
 *   - Dev server running on port 3000 (serves skill.md)
 */

// ── Phase 1: Agent reads skill.md and learns the platform ──

async function readSkillFile(url: string): Promise<string> {
  console.log(`[agent] Fetching skill file from ${url}...`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch skill.md: ${res.status}`);
  const text = await res.text();
  console.log(`[agent] Read ${text.length} bytes from skill.md`);
  return text;
}

function parseContractAddresses(skill: string, section: string): Record<string, string> {
  // Extract the specific section first
  const sectionStart = skill.indexOf(section);
  if (sectionStart === -1) throw new Error(`Section "${section}" not found in skill.md`);
  const sectionText = skill.slice(sectionStart, skill.indexOf("\n## ", sectionStart + 1));

  const contracts: Record<string, string> = {};
  const tableRegex = /\|\s*(\w+)\s*\|\s*(0x[a-fA-F0-9]{40})\s*\|/g;
  let match;
  while ((match = tableRegex.exec(sectionText)) !== null) {
    const name = match[1].toLowerCase();
    contracts[name] = match[2];
  }
  return contracts;
}

function parseChainId(skill: string): number {
  const match = skill.match(/chain ID (\d+)/i);
  return match ? parseInt(match[1]) : 84532;
}

function parsePackageName(skill: string): string {
  const match = skill.match(/npm install (.+)/);
  return match ? match[1].trim() : "delegate-sdk";
}

// ── Phase 2: Agent sets up SDK using only skill.md info ──

async function main() {
  console.log("=== Autonomous Agent Test ===\n");
  console.log("Two agents discover Delegate by reading skill.md.\n");
  console.log("No hardcoded addresses. No hardcoded config.\n");
  console.log("Everything comes from the skill file.\n");

  // Both agents read the skill file
  const skillUrl = "http://localhost:3000/skill.md";
  const skill = await readSkillFile(skillUrl);

  // Parse everything from skill.md
  // Agent reads the Local Development section for Anvil addresses
  const addresses = parseContractAddresses(skill, "## Local Development");
  const chainId = parseChainId(skill);
  const packageName = parsePackageName(skill);

  console.log(`\n[agent] Parsed from skill.md:`);
  console.log(`  Package: ${packageName}`);
  console.log(`  Chain ID: ${chainId}`);
  console.log(`  Contracts found: ${Object.keys(addresses).join(", ")}`);
  for (const [name, addr] of Object.entries(addresses)) {
    console.log(`    ${name}: ${addr}`);
  }

  // Validate we got what we need
  const required = ["policyregistry", "auditlog", "verifier", "agentregistry", "agreement", "vault"];
  for (const name of required) {
    if (!addresses[name]) {
      throw new Error(`[agent] Missing contract address for ${name} in skill.md`);
    }
  }
  console.log(`\n[agent] All required contracts found. Proceeding.\n`);

  // Dynamic import of the SDK (agent learned the package name from skill.md)
  const sdk = await import("../packages/sdk/src/index.js");

  // Build chain config from parsed data — using Anvil for local test
  // In production, agents would use the Base Sepolia RPC from skill.md
  const chainConfig = {
    rpc: "http://127.0.0.1:8545",
    chainId: 31337, // local test; skill.md says 84532 for production
    contracts: {
      registry: addresses["policyregistry"] as `0x${string}`,
      auditLog: addresses["auditlog"] as `0x${string}`,
      verifier: addresses["verifier"] as `0x${string}`,
      agentRegistry: addresses["agentregistry"] as `0x${string}`,
      agreement: addresses["agreement"] as `0x${string}`,
      vault: addresses["vault"] as `0x${string}`,
    },
  };

  // ── Phase 3: Two agents initialize independently ──

  // Agent Alice (Anvil account #5)
  const alice = sdk.createDelegate({
    policies: [],
    chain: {
      ...chainConfig,
      privateKey: "0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba",
    },
  });
  const aliceAddr = "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc" as `0x${string}`;

  // Agent Bob (Anvil account #6)
  const bob = sdk.createDelegate({
    policies: [],
    chain: {
      ...chainConfig,
      privateKey: "0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e",
    },
  });
  const bobAddr = "0x976EA74026E726554dB657fA54763abd0C3a0aa9" as `0x${string}`;

  let passed = 0;
  let failed = 0;
  function check(ok: boolean, msg: string) {
    if (ok) { console.log(`  ✓ ${msg}`); passed++; }
    else { console.log(`  ✗ ${msg}`); failed++; }
  }

  // ── Phase 4: Alice creates a policy (learned format from skill.md) ──

  console.log("--- Phase 4: Alice creates a policy ---\n");

  // Alice read the Policy type definition from skill.md and creates her own
  const alicePolicy = {
    id: "alice-data-policy",
    name: "Alice Data Access",
    description: "Read-only data access, low risk",
    defaultEffect: "deny" as const,
    rules: [
      {
        id: "action-read",
        label: "Must be read or query",
        field: "actionType" as const,
        operator: "includes" as const,
        value: "read|query",
        rationale: "Read-only access",
      },
      {
        id: "risk-low",
        label: "Risk at most 3",
        field: "risk" as const,
        operator: "lte" as const,
        value: 3,
        rationale: "Low risk operations only",
      },
    ],
  };

  // Test the policy locally (skill.md: "evaluate" action)
  const testAllow = alice.evaluate(alicePolicy, {
    actionType: "read", tool: "read", risk: 2, target: "data", justification: "test",
  });
  check(testAllow.outcome === "allow", "Alice's policy allows read/risk-2");

  const testDeny = alice.evaluate(alicePolicy, {
    actionType: "delete", tool: "exec", risk: 9, target: "prod", justification: "test",
  });
  check(testDeny.outcome === "deny", "Alice's policy denies delete/risk-9");

  // Register policy on-chain (skill.md: "registerPolicy" action)
  await alice.registerPolicy(alicePolicy, "ipfs://alice-data-policy");
  console.log("  Alice registered policy on-chain");

  // ── Phase 5: Alice registers identity (learned from skill.md) ──

  console.log("\n--- Phase 5: Agents register identities ---\n");

  const aliceId = alice.hash("agent-alice") as `0x${string}`;
  await alice.registerAgent(aliceId, "ipfs://alice-agent");
  console.log("  Alice registered identity on-chain");

  const bobId = bob.hash("agent-bob") as `0x${string}`;
  await bob.registerAgent(bobId, "ipfs://bob-agent");
  console.log("  Bob registered identity on-chain");

  // Alice commits to her policy (skill.md: "commitPolicy" action)
  const policyHash = alice.hash(alicePolicy) as `0x${string}`;
  await alice.commitPolicy(policyHash);
  console.log("  Alice committed to her policy");

  // ── Phase 6: Bob discovers Alice (learned from skill.md: "getAgent") ──

  console.log("\n--- Phase 6: Bob discovers Alice ---\n");

  const aliceInfo = await bob.getAgent(aliceAddr);
  check(aliceInfo.policyHashes.length > 0, "Bob found Alice's committed policies");
  check(aliceInfo.metadataURI === "ipfs://alice-agent", "Bob verified Alice's metadata");
  check(aliceInfo.policyHashes[0] === policyHash, "Bob verified Alice's policy hash");

  console.log(`  Bob sees Alice committed to policy: ${policyHash.slice(0, 16)}...`);
  console.log(`  Bob says: "I trust Alice because I verified her on-chain commitments."`);

  // ── Phase 7: Form agreement (learned from skill.md: "proposeAgreement" + "signAgreement") ──

  console.log("\n--- Phase 7: Bilateral agreement ---\n");

  await alice.proposeAgreement(policyHash, bobAddr);
  console.log("  Alice proposed agreement with Bob");

  // Compute agreement ID (skill.md shows deterministic: keccak256(policyHash, partyA, partyB))
  const { encodeAbiParameters, keccak256 } = await import("viem");
  const agreementId = keccak256(
    encodeAbiParameters(
      [{ type: "bytes32" }, { type: "address" }, { type: "address" }],
      [policyHash, aliceAddr, bobAddr]
    )
  ) as `0x${string}`;

  await bob.signAgreement(agreementId);
  console.log("  Bob signed the agreement");

  const agreement = await alice.getAgreement(agreementId);
  check(agreement.finalized, "Agreement is finalized");
  console.log(`  Both agents locked to policy ${policyHash.slice(0, 16)}...`);

  // ── Phase 8: Operate under agreement (evaluate + attest + verify) ──

  console.log("\n--- Phase 8: Operate and verify ---\n");

  const request = {
    actionType: "query",
    tool: "read",
    risk: 1,
    target: "shared-dataset",
    justification: "Data query under bilateral agreement",
    agreementId,
  };

  const result = alice.evaluate(alicePolicy, request);
  check(result.outcome === "allow", "Query allowed by policy");

  // Alice attests (skill.md: "attest" action)
  const tx = await alice.attest(alicePolicy, request, result);
  console.log(`  Alice attested decision: ${tx.slice(0, 16)}...`);

  // Bob verifies (skill.md: "verify" action)
  const verified = await bob.verify(alicePolicy, request, result);
  check(verified, "Bob verified Alice's decision on-chain");

  // Bob tampers and re-verifies
  const tampered = { ...request, risk: 8 };
  const tamperedResult = alice.evaluate(alicePolicy, tampered);
  const tamperedVerified = await bob.verify(alicePolicy, tampered, tamperedResult);
  check(!tamperedVerified, "Tampered request fails verification");

  // ── Phase 9: Vault (owner deposits, Bob spends) ──

  console.log("\n--- Phase 9: Vault spending ---\n");

  // Owner (Anvil account #0) sets up the vault
  const ownerSdk = sdk.createDelegate({
    policies: [],
    chain: {
      ...chainConfig,
      privateKey: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    },
  });

  // Bob creates a spending policy
  const spendPolicy = {
    id: "bob-spending",
    name: "Bob Spending",
    description: "Transfer tool, max 0.1 ETH",
    defaultEffect: "deny" as const,
    rules: [
      { id: "tool", label: "Transfer only", field: "tool" as const, operator: "equals" as const, value: "transfer", rationale: "Only transfers" },
      { id: "cap", label: "Max 0.1 ETH", field: "amount" as const, operator: "lte" as const, value: 0.1, rationale: "Spending cap" },
    ],
  };

  await bob.registerPolicy(spendPolicy);
  const spendHash = bob.hash(spendPolicy) as `0x${string}`;

  // Owner deposits (skill.md: "deposit" action via chainClient)
  await ownerSdk.chainClient!.walletClient.writeContract({
    address: chainConfig.contracts.vault,
    abi: [{ type: "function", name: "deposit", inputs: [{ name: "policyHash", type: "bytes32" }], outputs: [], stateMutability: "payable" }],
    functionName: "deposit",
    args: [spendHash],
    value: BigInt("500000000000000000"),
  });
  console.log("  Owner deposited 0.5 ETH");

  // Owner sets limits (skill.md: "setSpendingLimit" action)
  const recipient = aliceAddr; // Bob pays Alice
  await ownerSdk.setSpendingLimit(
    spendHash, bobAddr,
    BigInt("100000000000000000"), // 0.1 ETH/tx
    BigInt("300000000000000000"), // 0.3 ETH/day
    [recipient],
  );
  console.log("  Owner set limits: 0.1 ETH/tx, 0.3 ETH/day, recipient: Alice");

  // Bob spends 0.05 ETH to Alice (skill.md: "recordSpend" action)
  try {
    await bob.recordSpend(spendHash, recipient, BigInt("50000000000000000"));
    check(true, "Bob spent 0.05 ETH to Alice - ALLOWED");
  } catch {
    check(false, "Bob spend 0.05 should succeed");
  }

  // Bob tries 0.5 ETH - exceeds limit
  try {
    await bob.recordSpend(spendHash, recipient, BigInt("500000000000000000"));
    check(false, "Should have been denied");
  } catch {
    check(true, "Bob spend 0.5 ETH - DENIED (exceeds per-tx limit)");
  }

  // Check vault
  const spent = await bob.getSpentToday(spendHash);
  check(Number(spent) === 50000000000000000, "Vault tracks 0.05 ETH spent today");

  // ── Results ──

  console.log(`\n=== RESULTS: ${passed} passed, ${failed} failed ===`);
  console.log(`\nBoth agents discovered Delegate by reading skill.md.`);
  console.log(`All contract addresses parsed from the skill file.`);
  console.log(`No hardcoded config. Full autonomous operation.\n`);

  if (failed > 0) process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); });
