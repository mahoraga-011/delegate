export type PolicyRule = {
  id: string;
  label: string;
  field: "actionType" | "tool" | "risk" | "target";
  operator: "equals" | "notEquals" | "includes" | "notIncludes" | "lte" | "gte";
  value: string | number;
  rationale: string;
};

export type Policy = {
  id: string;
  name: string;
  description: string;
  defaultEffect: "allow" | "deny";
  rules: PolicyRule[];
};

export type AgentActionRequest = {
  actionType: string;
  tool: string;
  risk: number;
  target: string;
  justification: string;
};

export type PolicyCheck = {
  ruleId: string;
  label: string;
  passed: boolean;
  summary: string;
  rationale: string;
};

export type EvaluationResult = {
  outcome: "allow" | "deny";
  checks: PolicyCheck[];
  reason: string;
  scorecard: {
    passed: number;
    failed: number;
  };
};

export type AuditEntry = {
  id: string;
  timestamp: string;
  policyName: string;
  request: AgentActionRequest;
  result: EvaluationResult;
};

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

const evaluateRule = (request: AgentActionRequest, rule: PolicyRule): PolicyCheck => {
  const rawValue = request[rule.field];
  const normalized = typeof rawValue === "string" ? rawValue.toLowerCase() : rawValue;
  const expected = typeof rule.value === "string" ? rule.value.toLowerCase() : rule.value;

  let passed = false;

  switch (rule.operator) {
    case "equals":
      passed = normalized === expected;
      break;
    case "notEquals":
      passed = normalized !== expected;
      break;
    case "includes": {
      if (typeof normalized === "string" && typeof expected === "string") {
        const options = expected.split("|").map((item) => item.trim());
        passed = options.some((item) => normalized.includes(item));
      }
      break;
    }
    case "notIncludes": {
      if (typeof normalized === "string" && typeof expected === "string") {
        const options = expected.split("|").map((item) => item.trim());
        passed = options.every((item) => !normalized.includes(item));
      }
      break;
    }
    case "lte":
      passed = typeof normalized === "number" && typeof expected === "number" && normalized <= expected;
      break;
    case "gte":
      passed = typeof normalized === "number" && typeof expected === "number" && normalized >= expected;
      break;
  }

  return {
    ruleId: rule.id,
    label: rule.label,
    passed,
    summary: `${rule.field} ${rule.operator} ${String(rule.value)}`,
    rationale: rule.rationale,
  };
};

export const evaluatePolicy = (policy: Policy, request: AgentActionRequest): EvaluationResult => {
  const checks = policy.rules.map((rule) => evaluateRule(request, rule));
  const failed = checks.filter((check) => !check.passed).length;
  const passed = checks.length - failed;
  const outcome = failed === 0 ? "allow" : policy.defaultEffect;

  return {
    outcome,
    checks,
    reason:
      failed === 0
        ? "All deterministic policy checks passed. Action can be delegated safely."
        : `${failed} policy check${failed === 1 ? "" : "s"} failed, so the request is denied by default.`,
    scorecard: { passed, failed },
  };
};

export const makeAuditEntry = (policy: Policy, request: AgentActionRequest, index: number): AuditEntry => ({
  id: `audit-${index + 1}`,
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

export const seedAuditLog: AuditEntry[] = [
  makeAuditEntry(
    samplePolicies[0],
    {
      actionType: "summarize",
      tool: "read",
      risk: 3,
      target: "staging-postmortems",
      justification: "Generate a short operator digest.",
    },
    0,
  ),
  makeAuditEntry(
    samplePolicies[0],
    {
      actionType: "execute",
      tool: "exec",
      risk: 8,
      target: "prod-ledger-node",
      justification: "Restart the failed service automatically.",
    },
    1,
  ),
];
