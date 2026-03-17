export type PolicyRule = {
  id: string;
  label: string;
  field: string;
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
  amount?: number;
  currency?: string;
  recipient?: string;
  agentId?: string;
  agreementId?: string;
  [key: string]: string | number | boolean | undefined;
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
  txHash?: string;
};

export type AgentIdentity = {
  agentId: string;
  owner: string;
  metadataURI: string;
  policyHashes: string[];
};

export type Agreement = {
  agreementId: string;
  policyHash: string;
  partyA: string;
  partyB: string;
  signedByA: boolean;
  signedByB: boolean;
  finalized: boolean;
};

export type VaultInfo = {
  balance: bigint;
  spentToday: bigint;
  maxPerTx: bigint;
  maxPerDay: bigint;
  allowedRecipients: string[];
};

export type ChainConfig = {
  rpc: string;
  privateKey: string;
  chainId?: number;
  contracts: {
    registry: `0x${string}`;
    auditLog: `0x${string}`;
    verifier: `0x${string}`;
    agentRegistry?: `0x${string}`;
    agreement?: `0x${string}`;
    vault?: `0x${string}`;
  };
};

export type DelegateConfig = {
  policies: Policy[];
  chain?: ChainConfig;
};
