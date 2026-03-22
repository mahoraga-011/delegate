export type LineColor = "fg" | "dim" | "green" | "red" | "cyan" | "yellow" | "magenta" | "white";

export interface TerminalLine {
  text: string;
  color: LineColor;
  indent?: number;
  bold?: boolean;
  badge?: "allow" | "deny";
  icon?: "check" | "cross";
}

export interface TerminalStep {
  title: string;
  agent: "alice" | "bob" | "both" | "system";
  stepNumber: number;
  lines: TerminalLine[];
  /** Frames to display this step (at 30fps) */
  duration: number;
}

export const TERMINAL_STEPS: TerminalStep[] = [
  // STEP 1: Register identities
  {
    stepNumber: 1,
    title: "Register Identities",
    agent: "both",
    duration: 90,
    lines: [
      { text: "Alice registered on-chain  0x90F7...3906", color: "fg", indent: 1 },
      { text: "Bob registered on-chain    0x15d3...6A65", color: "fg", indent: 1 },
      { text: "Both agents have on-chain identity", color: "green", icon: "check", indent: 1 },
    ],
  },

  // STEP 2: Define & register policy
  {
    stepNumber: 2,
    title: "Define & Register Policy",
    agent: "alice",
    duration: 110,
    lines: [
      { text: "Policy: Data Sharing Policy (4 rules)", color: "fg", indent: 1 },
      { text: '  actionType ∈ read|query|transfer', color: "dim", indent: 1 },
      { text: "  risk ≤ 4  •  amount ≤ 0.1 ETH  •  tool ∈ api|transfer", color: "dim", indent: 1 },
      { text: "Policy hash registered on-chain (immutable)", color: "green", icon: "check", indent: 1 },
    ],
  },

  // STEP 3: Alice commits, Bob discovers
  {
    stepNumber: 3,
    title: "Commit & Discover",
    agent: "both",
    duration: 100,
    lines: [
      { text: "[Alice] Committed to policy on-chain", color: "magenta", indent: 1 },
      { text: "[Bob]   Discovered Alice's commitment", color: "cyan", indent: 1 },
      { text: "[Bob]   Policy hash verified — rules match", color: "green", icon: "check", indent: 1 },
    ],
  },

  // STEP 4: Form bilateral agreement
  {
    stepNumber: 4,
    title: "Form Agreement",
    agent: "both",
    duration: 110,
    lines: [
      { text: "[Alice] → Proposed bilateral agreement", color: "magenta", indent: 1 },
      { text: "[Bob]   ← Signed agreement", color: "cyan", indent: 1 },
      { text: "Agreement finalized — locked on-chain", color: "green", icon: "check", indent: 1 },
      { text: "Neither party can change the rules.", color: "dim", indent: 1 },
    ],
  },

  // STEP 5: Evaluate safe request — ALLOW
  {
    stepNumber: 5,
    title: "Evaluate — Safe Query",
    agent: "alice",
    duration: 120,
    lines: [
      { text: '→ { action: "query", tool: "api", risk: 2, amount: 0 }', color: "fg", indent: 1 },
      { text: "  actionType ✓  risk ✓  amount ✓  tool ✓", color: "dim", indent: 1 },
      { text: "4/4 rules passed", color: "fg", badge: "allow", indent: 1 },
    ],
  },

  // STEP 6: Evaluate dangerous request — DENY
  {
    stepNumber: 6,
    title: "Evaluate — Dangerous Op",
    agent: "alice",
    duration: 120,
    lines: [
      { text: '→ { action: "execute", tool: "shell", risk: 9, amount: 5.0 }', color: "fg", indent: 1 },
      { text: "  actionType ✗  risk ✗  amount ✗  tool ✗", color: "red", indent: 1 },
      { text: "4/4 rules failed — blocked", color: "fg", badge: "deny", indent: 1 },
    ],
  },

  // STEP 7: Attest decisions on-chain
  {
    stepNumber: 7,
    title: "Attest On-Chain",
    agent: "alice",
    duration: 100,
    lines: [
      { text: "keccak256(policy + request + result) → hash", color: "dim", indent: 1 },
      { text: "▸ ALLOW decision attested", color: "green", indent: 1 },
      { text: "▸ DENY  decision attested", color: "red", indent: 1 },
      { text: "Permanent. Append-only. Tamper-evident.", color: "green", icon: "check", indent: 1 },
    ],
  },

  // STEP 8: Vault operations
  {
    stepNumber: 8,
    title: "Vault — Deposit & Limits",
    agent: "system",
    duration: 90,
    lines: [
      { text: "Deposited 0.5 ETH  •  Max/tx: 0.1  •  Max/day: 0.3", color: "fg", indent: 1 },
      { text: "Spending limits enforced by smart contract", color: "green", icon: "check", indent: 1 },
    ],
  },

  // STEP 9: Vault spend — ALLOW
  {
    stepNumber: 9,
    title: "Vault Spend — 0.05 ETH",
    agent: "alice",
    duration: 80,
    lines: [
      { text: "→ spend 0.05 ETH to 0x976E...0aa9", color: "fg", indent: 1 },
      { text: "0.05 ≤ 0.1 max/tx — within limit", color: "fg", badge: "allow", indent: 1 },
    ],
  },

  // STEP 10: Vault spend — DENY (over limit)
  {
    stepNumber: 10,
    title: "Vault Spend — 0.5 ETH",
    agent: "alice",
    duration: 80,
    lines: [
      { text: "→ spend 0.5 ETH to 0x976E...0aa9", color: "fg", indent: 1 },
      { text: "0.5 > 0.1 max/tx — rejected by contract", color: "fg", badge: "deny", indent: 1 },
    ],
  },

  // STEP 11: Vault spend — DENY (bad recipient)
  {
    stepNumber: 11,
    title: "Vault Spend — Bad Recipient",
    agent: "alice",
    duration: 80,
    lines: [
      { text: "→ spend 0.01 ETH to 0x15d3... (not in allowlist)", color: "fg", indent: 1 },
      { text: "Unauthorized recipient — rejected", color: "fg", badge: "deny", indent: 1 },
    ],
  },

  // STEP 12: Bob verifies
  {
    stepNumber: 12,
    title: "Cross-Agent Verification",
    agent: "bob",
    duration: 100,
    lines: [
      { text: "[Bob] Re-evaluates same request independently", color: "cyan", indent: 1 },
      { text: "[Bob] Outcome: ALLOW — matches Alice", color: "fg", indent: 1 },
      { text: "[Bob] On-chain lookup: FOUND", color: "green", icon: "check", indent: 1 },
    ],
  },

  // STEP 13: Tamper detection
  {
    stepNumber: 13,
    title: "Tamper Detection",
    agent: "bob",
    duration: 120,
    lines: [
      { text: "[Bob] Modifies request: risk 2 → 3", color: "cyan", indent: 1 },
      { text: "Original hash: 0x4d7a...  Tampered: 0x8f2c...", color: "fg", indent: 1 },
      { text: "NOT FOUND on-chain — forgery detected", color: "fg", badge: "deny", indent: 1 },
      { text: "Change one field → hash changes → verification fails.", color: "dim", indent: 1 },
    ],
  },
];
