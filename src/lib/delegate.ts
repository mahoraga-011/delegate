// Re-export core types and engine from the SDK
export type {
  PolicyRule,
  Policy,
  AgentActionRequest,
  PolicyCheck,
  EvaluationResult,
  AuditEntry,
} from "@anthropic-hackathon/delegate-sdk";

export { evaluatePolicy } from "@anthropic-hackathon/delegate-sdk";

// Dashboard-specific sample data and helpers below
import type { Policy, AgentActionRequest, AuditEntry } from "@anthropic-hackathon/delegate-sdk";
import { evaluatePolicy } from "@anthropic-hackathon/delegate-sdk";

export const samplePolicies: Policy[] = [
  {
    id: "hackathon-safe-default",
    name: "Safe default",
    description:
      "Blocks shell and network actions by default, and only allows low-risk read/write style operations.",
    defaultEffect: "deny",
    rules: [
      {
        id: "risk-cap",
        label: "Risk score must stay at or below 4",
        field: "risk",
        operator: "lte",
        value: 4,
        rationale: "Hackathon deployments should prefer visibly conservative automation.",
      },
      {
        id: "tool-not-shell",
        label: "Tool cannot be shell/exec",
        field: "tool",
        operator: "notIncludes",
        value: "exec",
        rationale: "Direct shell execution is the most obvious breakout vector.",
      },
      {
        id: "tool-not-network",
        label: "Target cannot reference a production domain",
        field: "target",
        operator: "notIncludes",
        value: "prod",
        rationale: "Keep early agent actions away from production systems.",
      },
      {
        id: "action-allowed",
        label: "Action type must be read, classify, or summarize",
        field: "actionType",
        operator: "includes",
        value: "read|classify|summarize",
        rationale: "Only deterministic, low-impact actions are allowed in this profile.",
      },
    ],
  },
  {
    id: "ops-review-gate",
    name: "Ops review gate",
    description:
      "Allows limited command execution in staging, but denies elevated risk and destructive targets.",
    defaultEffect: "deny",
    rules: [
      {
        id: "risk-cap-ops",
        label: "Risk score must stay at or below 6",
        field: "risk",
        operator: "lte",
        value: 6,
        rationale: "Staging can tolerate more automation than prod, but not blind autonomy.",
      },
      {
        id: "target-must-be-staging",
        label: "Target must include staging",
        field: "target",
        operator: "includes",
        value: "staging",
        rationale: "This policy only covers isolated pre-production systems.",
      },
      {
        id: "tool-allowed-ops",
        label: "Tool must be exec or read",
        field: "tool",
        operator: "includes",
        value: "exec|read",
        rationale: "Keep tool surface area constrained and auditable.",
      },
      {
        id: "target-not-delete",
        label: "Target cannot include delete or drop",
        field: "target",
        operator: "notIncludes",
        value: "delete|drop",
        rationale: "Destructive operations stay blocked even in staging.",
      },
    ],
  },
];

const shortId = () => {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const segments = [4, 4];
  return segments
    .map((len) =>
      Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
    )
    .join("-");
};

export const makeAuditEntry = (policy: Policy, request: AgentActionRequest, index: number): AuditEntry => ({
  id: `dlg-${shortId()}`,
  timestamp: new Date(Date.now() - index * 1000 * 60 * 11).toISOString(),
  policyName: policy.name,
  request,
  result: evaluatePolicy(policy, request),
});

export const seedRequest: AgentActionRequest = {
  actionType: "read",
  tool: "read",
  risk: 2,
  target: "staging-docs-bucket",
  justification: "Summarize recent incident notes before standup.",
};

const seedRequest1: AgentActionRequest = {
  actionType: "summarize",
  tool: "read",
  risk: 3,
  target: "staging-postmortems",
  justification: "Generate a short operator digest.",
};

const seedRequest2: AgentActionRequest = {
  actionType: "execute",
  tool: "exec",
  risk: 8,
  target: "prod-ledger-node",
  justification: "Restart the failed service automatically.",
};

export const seedAuditLog: AuditEntry[] = [
  {
    id: "dlg-v7k2-m9x4",
    timestamp: "2026-03-15T08:00:00.000Z",
    policyName: samplePolicies[0].name,
    request: seedRequest1,
    result: evaluatePolicy(samplePolicies[0], seedRequest1),
  },
  {
    id: "dlg-a3f1-p2w8",
    timestamp: "2026-03-15T07:49:00.000Z",
    policyName: samplePolicies[0].name,
    request: seedRequest2,
    result: evaluatePolicy(samplePolicies[0], seedRequest2),
  },
];
