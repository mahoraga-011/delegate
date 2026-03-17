// Re-export core types and engine from the SDK
export type {
  PolicyRule,
  Policy,
  AgentActionRequest,
  PolicyCheck,
  EvaluationResult,
  AuditEntry,
  AgentIdentity,
  Agreement,
  VaultInfo,
} from "@delegate/sdk";

export { evaluatePolicy } from "@delegate/sdk";

// Dashboard-specific sample data and helpers below
import type { Policy, AgentActionRequest, AuditEntry } from "@delegate/sdk";
import { evaluatePolicy } from "@delegate/sdk";

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

export const spendingCapPolicy: Policy = {
  id: "spending-cap",
  name: "Spending cap",
  description:
    "Max 0.1 ETH per transaction, tool must be transfer, approved recipients only.",
  defaultEffect: "deny",
  rules: [
    {
      id: "amount-cap",
      label: "Amount must be at most 0.1 ETH",
      field: "amount",
      operator: "lte",
      value: 0.1,
      rationale: "Hard cap on per-transaction spending to limit blast radius.",
    },
    {
      id: "tool-transfer",
      label: "Tool must be transfer",
      field: "tool",
      operator: "equals",
      value: "transfer",
      rationale: "Only transfer operations are allowed under this spending policy.",
    },
    {
      id: "risk-cap-spend",
      label: "Risk score must stay at or below 5",
      field: "risk",
      operator: "lte",
      value: 5,
      rationale: "Financial operations require moderate risk tolerance.",
    },
  ],
};

export const trustVerificationPolicy: Policy = {
  id: "trust-verification",
  name: "Trust verification",
  description:
    "Low-risk, read/query/verify actions only. Ideal for agent identity verification workflows.",
  defaultEffect: "deny",
  rules: [
    {
      id: "risk-low",
      label: "Risk score must stay at or below 3",
      field: "risk",
      operator: "lte",
      value: 3,
      rationale: "Trust verification should be zero-impact.",
    },
    {
      id: "action-readonly",
      label: "Action type must be read, query, or verify",
      field: "actionType",
      operator: "includes",
      value: "read|query|verify",
      rationale: "Only read-only operations are permitted in trust flows.",
    },
  ],
};

export const dataSharingPolicy: Policy = {
  id: "data-sharing-agreement",
  name: "Data sharing agreement",
  description:
    "Read-only access, risk at most 3, staging targets only. For bilateral data sharing agreements.",
  defaultEffect: "deny",
  rules: [
    {
      id: "action-read-only",
      label: "Action type must be read",
      field: "actionType",
      operator: "equals",
      value: "read",
      rationale: "Data sharing agreements restrict to read-only access.",
    },
    {
      id: "risk-cap-sharing",
      label: "Risk score must stay at or below 3",
      field: "risk",
      operator: "lte",
      value: 3,
      rationale: "Data sharing must be low-risk.",
    },
    {
      id: "target-staging-only",
      label: "Target must include staging",
      field: "target",
      operator: "includes",
      value: "staging",
      rationale: "Data sharing is restricted to staging environments.",
    },
  ],
};

export const allPolicies: Policy[] = [
  ...samplePolicies,
  spendingCapPolicy,
  trustVerificationPolicy,
  dataSharingPolicy,
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
  actionType: "",
  tool: "",
  risk: 0,
  target: "",
  justification: "",
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
