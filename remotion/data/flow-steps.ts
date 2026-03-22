export type NodeId = "agentA" | "agentB" | "policy" | "engine" | "registry" | "auditlog" | "verifier" | "agreement" | "vault";

export interface FlowNode {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  sub: string;
}

export const NODES: Record<NodeId, FlowNode> = {
  agentA:    { x: 30,  y: 20,  w: 140, h: 56, label: "Agent A",       sub: "creates + operates" },
  policy:    { x: 300, y: 20,  w: 140, h: 56, label: "Policy",        sub: "deterministic rules" },
  agentB:    { x: 570, y: 20,  w: 140, h: 56, label: "Agent B",       sub: "discovers + verifies" },
  engine:    { x: 30,  y: 145, w: 170, h: 56, label: "Policy Engine", sub: "evaluate request" },
  registry:  { x: 30,  y: 275, w: 120, h: 50, label: "Registry",      sub: "policy hashes" },
  auditlog:  { x: 170, y: 275, w: 120, h: 50, label: "AuditLog",      sub: "decisions" },
  verifier:  { x: 310, y: 275, w: 120, h: 50, label: "Verifier",      sub: "proofs" },
  agreement: { x: 450, y: 275, w: 130, h: 50, label: "Agreement",     sub: "bilateral" },
  vault:     { x: 600, y: 275, w: 120, h: 50, label: "Vault",         sub: "escrow" },
};

export interface FlowStep {
  id: number;
  title: string;
  desc: string;
  active: NodeId[];
  arrows: { from: NodeId; to: NodeId }[];
  result?: "allow" | "deny";
  detail: string;
}

export const FLOW_STEPS: FlowStep[] = [
  {
    id: 1,
    title: "Define Policy",
    desc: "Agent A creates a set of deterministic rules.",
    active: ["agentA", "policy"],
    arrows: [{ from: "agentA", to: "policy" }],
    detail: 'risk <= 4, tool = "transfer", amount <= 0.1 ETH',
  },
  {
    id: 2,
    title: "Register On-Chain",
    desc: "Policy hash gets stored on the blockchain.",
    active: ["policy", "registry"],
    arrows: [{ from: "policy", to: "registry" }],
    detail: "keccak256(policy) → 0x3a4f...b2c1",
  },
  {
    id: 3,
    title: "Agent B Discovers",
    desc: "Agent B looks up the policy hash on-chain.",
    active: ["agentB", "registry"],
    arrows: [{ from: "registry", to: "agentB" }],
    detail: "getPolicy(hash) → verified rules match",
  },
  {
    id: 4,
    title: "Form Agreement",
    desc: "Both agents sign a bilateral agreement.",
    active: ["agentA", "agentB", "agreement"],
    arrows: [{ from: "agentA", to: "agreement" }, { from: "agentB", to: "agreement" }],
    detail: "Neither party can change the rules after signing",
  },
  {
    id: 5,
    title: "Agent Makes Request",
    desc: "Agent A wants to transfer 0.05 ETH.",
    active: ["agentA", "engine"],
    arrows: [{ from: "agentA", to: "engine" }],
    detail: '{ tool: "transfer", amount: 0.05, risk: 2 }',
  },
  {
    id: 6,
    title: "Engine Evaluates",
    desc: "Every rule checked. All pass = ALLOW.",
    active: ["engine"],
    arrows: [],
    result: "allow",
    detail: "risk 2 <= 4 ✓  |  tool = transfer ✓  |  amount 0.05 <= 0.1 ✓",
  },
  {
    id: 7,
    title: "Attest On-Chain",
    desc: "Decision hashes logged on the blockchain.",
    active: ["engine", "auditlog"],
    arrows: [{ from: "engine", to: "auditlog" }],
    detail: "logDecision(policyHash, requestHash, resultHash)",
  },
  {
    id: 8,
    title: "Vault Enforces Spending",
    desc: "Contract enforces per-tx and daily limits.",
    active: ["agentA", "vault"],
    arrows: [{ from: "agentA", to: "vault" }],
    result: "allow",
    detail: "0.05 ETH <= 0.1 max/tx ✓  |  0.05 <= 0.5 max/day ✓",
  },
  {
    id: 9,
    title: "Overspend Denied",
    desc: "Agent tries 5 ETH. Vault rejects it on-chain.",
    active: ["agentA", "vault"],
    arrows: [{ from: "agentA", to: "vault" }],
    result: "deny",
    detail: "5 ETH > 0.1 max/tx ✗  DENIED by contract",
  },
  {
    id: 10,
    title: "Anyone Can Verify",
    desc: "Re-evaluate, compute hashes, check on-chain.",
    active: ["agentB", "verifier"],
    arrows: [{ from: "agentB", to: "verifier" }],
    detail: "Tamper one field → hashes don't match → NOT FOUND",
  },
];

export function cx(id: NodeId) { return NODES[id].x + NODES[id].w / 2; }
export function cy(id: NodeId) { return NODES[id].y + NODES[id].h / 2; }
export function bottom(id: NodeId) { return NODES[id].y + NODES[id].h; }
export function top(id: NodeId) { return NODES[id].y; }

export function curvePath(fromId: NodeId, toId: NodeId): string {
  const fx = cx(fromId), fy = cy(fromId);
  const tx = cx(toId), ty = cy(toId);

  if (Math.abs(fy - ty) < 30) {
    const midY = fy - 30;
    return `M ${fx} ${fy} Q ${(fx + tx) / 2} ${midY} ${tx} ${ty}`;
  }

  const midX = (fx + tx) / 2;
  const midY = (fy + ty) / 2;

  if (Math.abs(fx - tx) > 300) {
    const arcX = fx < tx ? midX + 40 : midX - 40;
    return `M ${fx} ${bottom(fromId)} C ${fx} ${midY}, ${arcX} ${midY}, ${tx} ${top(toId)}`;
  }

  return `M ${fx} ${bottom(fromId)} C ${fx} ${midY}, ${tx} ${midY}, ${tx} ${top(toId)}`;
}
