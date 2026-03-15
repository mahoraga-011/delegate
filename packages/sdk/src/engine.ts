import type { AgentActionRequest, EvaluationResult, Policy, PolicyCheck, PolicyRule } from "./types.js";

export const evaluateRule = (request: AgentActionRequest, rule: PolicyRule): PolicyCheck => {
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
