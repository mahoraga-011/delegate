"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  AGENT_REGISTRY_ABI: () => AGENT_REGISTRY_ABI,
  AGREEMENT_ABI: () => AGREEMENT_ABI,
  AUDIT_LOG_ABI: () => AUDIT_LOG_ABI,
  REGISTRY_ABI: () => REGISTRY_ABI,
  VAULT_ABI: () => VAULT_ABI,
  VERIFIER_ABI: () => VERIFIER_ABI,
  attest: () => attest,
  canonicalize: () => canonicalize,
  commitPolicy: () => commitPolicy,
  createChainClient: () => createChainClient,
  createDelegate: () => createDelegate,
  evaluatePolicy: () => evaluatePolicy,
  evaluateRule: () => evaluateRule,
  getAgent: () => getAgent,
  getAgreement: () => getAgreement,
  getSpentToday: () => getSpentToday,
  hashObject: () => hashObject,
  proposeAgreement: () => proposeAgreement,
  recordSpend: () => recordSpend,
  registerAgent: () => registerAgent,
  registerPolicy: () => registerPolicy,
  setSpendingLimit: () => setSpendingLimit,
  signAgreement: () => signAgreement,
  verify: () => verify,
  wrap: () => wrap
});
module.exports = __toCommonJS(index_exports);

// src/engine.ts
var evaluateRule = (request, rule) => {
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
    rationale: rule.rationale
  };
};
var evaluatePolicy = (policy, request) => {
  const checks = policy.rules.map((rule) => evaluateRule(request, rule));
  const failed = checks.filter((check) => !check.passed).length;
  const passed = checks.length - failed;
  const outcome = failed === 0 ? "allow" : policy.defaultEffect;
  return {
    outcome,
    checks,
    reason: failed === 0 ? "All deterministic policy checks passed. Action can be delegated safely." : `${failed} policy check${failed === 1 ? "" : "s"} failed, so the request is denied by default.`,
    scorecard: { passed, failed }
  };
};

// src/hashing.ts
var import_viem = require("viem");
function canonicalize(obj) {
  if (obj === null || obj === void 0) return JSON.stringify(obj);
  if (typeof obj !== "object") return JSON.stringify(obj);
  if (Array.isArray(obj)) {
    return "[" + obj.map(canonicalize).join(",") + "]";
  }
  const sorted = Object.keys(obj).sort();
  const entries = sorted.map(
    (key) => `${JSON.stringify(key)}:${canonicalize(obj[key])}`
  );
  return "{" + entries.join(",") + "}";
}
function hashObject(obj) {
  const canonical = canonicalize(obj);
  return (0, import_viem.keccak256)((0, import_viem.toHex)(canonical));
}

// src/chain.ts
var import_viem2 = require("viem");
var import_accounts = require("viem/accounts");
var import_chains = require("viem/chains");
var AUDIT_LOG_ABI = [
  {
    type: "function",
    name: "logDecision",
    inputs: [
      { name: "policyHash", type: "bytes32" },
      { name: "requestHash", type: "bytes32" },
      { name: "resultHash", type: "bytes32" },
      { name: "allowed", type: "bool" }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "event",
    name: "DecisionLogged",
    inputs: [
      { name: "agent", type: "address", indexed: true },
      { name: "policyHash", type: "bytes32", indexed: true },
      { name: "requestHash", type: "bytes32", indexed: false },
      { name: "resultHash", type: "bytes32", indexed: false },
      { name: "allowed", type: "bool", indexed: false },
      { name: "timestamp", type: "uint256", indexed: false }
    ]
  }
];
var REGISTRY_ABI = [
  {
    type: "function",
    name: "registerPolicy",
    inputs: [
      { name: "policyHash", type: "bytes32" },
      { name: "metadataURI", type: "string" }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "getPolicy",
    inputs: [{ name: "policyHash", type: "bytes32" }],
    outputs: [
      { name: "registrant", type: "address" },
      { name: "timestamp", type: "uint256" },
      { name: "metadataURI", type: "string" }
    ],
    stateMutability: "view"
  },
  {
    type: "event",
    name: "PolicyRegistered",
    inputs: [
      { name: "registrant", type: "address", indexed: true },
      { name: "policyHash", type: "bytes32", indexed: true },
      { name: "metadataURI", type: "string", indexed: false },
      { name: "timestamp", type: "uint256", indexed: false }
    ]
  }
];
var VERIFIER_ABI = [
  {
    type: "function",
    name: "verify",
    inputs: [
      { name: "policyHash", type: "bytes32" },
      { name: "requestHash", type: "bytes32" },
      { name: "resultHash", type: "bytes32" }
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view"
  }
];
var AGENT_REGISTRY_ABI = [
  {
    type: "function",
    name: "registerAgent",
    inputs: [
      { name: "agentId", type: "bytes32" },
      { name: "metadataURI", type: "string" }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "commitPolicy",
    inputs: [{ name: "policyHash", type: "bytes32" }],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "getAgent",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [
      { name: "agentId", type: "bytes32" },
      { name: "metadataURI", type: "string" },
      { name: "policyHashes", type: "bytes32[]" }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "isRegistered",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view"
  },
  {
    type: "event",
    name: "AgentRegistered",
    inputs: [
      { name: "owner", type: "address", indexed: true },
      { name: "agentId", type: "bytes32", indexed: true },
      { name: "metadataURI", type: "string", indexed: false },
      { name: "timestamp", type: "uint256", indexed: false }
    ]
  },
  {
    type: "event",
    name: "PolicyCommitted",
    inputs: [
      { name: "owner", type: "address", indexed: true },
      { name: "policyHash", type: "bytes32", indexed: true },
      { name: "timestamp", type: "uint256", indexed: false }
    ]
  }
];
var AGREEMENT_ABI = [
  {
    type: "function",
    name: "proposeAgreement",
    inputs: [
      { name: "policyHash", type: "bytes32" },
      { name: "counterparty", type: "address" }
    ],
    outputs: [{ name: "agreementId", type: "bytes32" }],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "signAgreement",
    inputs: [{ name: "agreementId", type: "bytes32" }],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "verifyCompliance",
    inputs: [
      { name: "agreementId", type: "bytes32" },
      { name: "requestHash", type: "bytes32" },
      { name: "resultHash", type: "bytes32" }
    ],
    outputs: [{ name: "compliant", type: "bool" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getAgreement",
    inputs: [{ name: "agreementId", type: "bytes32" }],
    outputs: [
      { name: "policyHash", type: "bytes32" },
      { name: "partyA", type: "address" },
      { name: "partyB", type: "address" },
      { name: "signedByA", type: "bool" },
      { name: "signedByB", type: "bool" },
      { name: "timestamp", type: "uint256" }
    ],
    stateMutability: "view"
  },
  {
    type: "event",
    name: "AgreementProposed",
    inputs: [
      { name: "agreementId", type: "bytes32", indexed: true },
      { name: "policyHash", type: "bytes32", indexed: true },
      { name: "partyA", type: "address", indexed: true },
      { name: "partyB", type: "address", indexed: false },
      { name: "timestamp", type: "uint256", indexed: false }
    ]
  },
  {
    type: "event",
    name: "AgreementFinalized",
    inputs: [
      { name: "agreementId", type: "bytes32", indexed: true },
      { name: "partyA", type: "address", indexed: true },
      { name: "partyB", type: "address", indexed: true },
      { name: "timestamp", type: "uint256", indexed: false }
    ]
  }
];
var VAULT_ABI = [
  {
    type: "function",
    name: "deposit",
    inputs: [{ name: "policyHash", type: "bytes32" }],
    outputs: [],
    stateMutability: "payable"
  },
  {
    type: "function",
    name: "setSpendingLimit",
    inputs: [
      { name: "policyHash", type: "bytes32" },
      { name: "agent", type: "address" },
      { name: "maxPerTx", type: "uint256" },
      { name: "maxPerDay", type: "uint256" },
      { name: "allowedRecipients", type: "address[]" }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "spend",
    inputs: [
      { name: "policyHash", type: "bytes32" },
      { name: "recipient", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "withdraw",
    inputs: [{ name: "policyHash", type: "bytes32" }],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "getBalance",
    inputs: [{ name: "policyHash", type: "bytes32" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getSpentToday",
    inputs: [{ name: "policyHash", type: "bytes32" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getSpendingLimit",
    inputs: [{ name: "policyHash", type: "bytes32" }],
    outputs: [
      { name: "agent", type: "address" },
      { name: "maxPerTx", type: "uint256" },
      { name: "maxPerDay", type: "uint256" },
      { name: "allowedRecipients", type: "address[]" }
    ],
    stateMutability: "view"
  },
  {
    type: "event",
    name: "Deposited",
    inputs: [
      { name: "policyHash", type: "bytes32", indexed: true },
      { name: "depositor", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false }
    ]
  },
  {
    type: "event",
    name: "SpendingLimitSet",
    inputs: [
      { name: "policyHash", type: "bytes32", indexed: true },
      { name: "agent", type: "address", indexed: true },
      { name: "maxPerTx", type: "uint256", indexed: false },
      { name: "maxPerDay", type: "uint256", indexed: false }
    ]
  },
  {
    type: "event",
    name: "SpendExecuted",
    inputs: [
      { name: "policyHash", type: "bytes32", indexed: true },
      { name: "agent", type: "address", indexed: true },
      { name: "recipient", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false }
    ]
  },
  {
    type: "event",
    name: "SpendDenied",
    inputs: [
      { name: "policyHash", type: "bytes32", indexed: true },
      { name: "agent", type: "address", indexed: true },
      { name: "recipient", type: "address", indexed: false },
      { name: "amount", type: "uint256", indexed: false },
      { name: "reason", type: "string", indexed: false }
    ]
  },
  {
    type: "event",
    name: "Withdrawn",
    inputs: [
      { name: "policyHash", type: "bytes32", indexed: true },
      { name: "owner", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false }
    ]
  }
];
function createChainClient(config) {
  const account = (0, import_accounts.privateKeyToAccount)(config.privateKey);
  const chain = config.chainId ? (0, import_viem2.defineChain)({ id: config.chainId, name: "custom", nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 }, rpcUrls: { default: { http: [config.rpc] } } }) : import_chains.baseSepolia;
  const publicClient = (0, import_viem2.createPublicClient)({
    chain,
    transport: (0, import_viem2.http)(config.rpc)
  });
  const walletClient = (0, import_viem2.createWalletClient)({
    account,
    chain,
    transport: (0, import_viem2.http)(config.rpc)
  });
  return { publicClient, walletClient, contracts: config.contracts };
}
async function attest(client, policy, request, result) {
  const policyHash = hashObject(policy);
  const requestHash = hashObject(request);
  const resultHash = hashObject(result);
  const txHash = await client.walletClient.writeContract({
    address: client.contracts.auditLog,
    abi: AUDIT_LOG_ABI,
    functionName: "logDecision",
    args: [policyHash, requestHash, resultHash, result.outcome === "allow"]
  });
  return txHash;
}
async function verify(client, policy, request, result) {
  const policyHash = hashObject(policy);
  const requestHash = hashObject(request);
  const resultHash = hashObject(result);
  const isValid = await client.publicClient.readContract({
    address: client.contracts.verifier,
    abi: VERIFIER_ABI,
    functionName: "verify",
    args: [policyHash, requestHash, resultHash]
  });
  return isValid;
}
async function registerPolicy(client, policy, metadataURI = "") {
  const policyHash = hashObject(policy);
  const txHash = await client.walletClient.writeContract({
    address: client.contracts.registry,
    abi: REGISTRY_ABI,
    functionName: "registerPolicy",
    args: [policyHash, metadataURI]
  });
  return txHash;
}
async function registerAgent(client, agentId, metadataURI = "") {
  if (!client.contracts.agentRegistry) throw new Error("agentRegistry contract not configured");
  const txHash = await client.walletClient.writeContract({
    address: client.contracts.agentRegistry,
    abi: AGENT_REGISTRY_ABI,
    functionName: "registerAgent",
    args: [agentId, metadataURI]
  });
  return txHash;
}
async function commitPolicy(client, policyHash) {
  if (!client.contracts.agentRegistry) throw new Error("agentRegistry contract not configured");
  const txHash = await client.walletClient.writeContract({
    address: client.contracts.agentRegistry,
    abi: AGENT_REGISTRY_ABI,
    functionName: "commitPolicy",
    args: [policyHash]
  });
  return txHash;
}
async function getAgent(client, address) {
  if (!client.contracts.agentRegistry) throw new Error("agentRegistry contract not configured");
  const result = await client.publicClient.readContract({
    address: client.contracts.agentRegistry,
    abi: AGENT_REGISTRY_ABI,
    functionName: "getAgent",
    args: [address]
  });
  const [agentId, metadataURI, policyHashes] = result;
  return {
    agentId,
    owner: address,
    metadataURI,
    policyHashes
  };
}
async function proposeAgreement(client, policyHash, counterparty) {
  if (!client.contracts.agreement) throw new Error("agreement contract not configured");
  const txHash = await client.walletClient.writeContract({
    address: client.contracts.agreement,
    abi: AGREEMENT_ABI,
    functionName: "proposeAgreement",
    args: [policyHash, counterparty]
  });
  return txHash;
}
async function signAgreement(client, agreementId) {
  if (!client.contracts.agreement) throw new Error("agreement contract not configured");
  const txHash = await client.walletClient.writeContract({
    address: client.contracts.agreement,
    abi: AGREEMENT_ABI,
    functionName: "signAgreement",
    args: [agreementId]
  });
  return txHash;
}
async function getAgreement(client, agreementId) {
  if (!client.contracts.agreement) throw new Error("agreement contract not configured");
  const result = await client.publicClient.readContract({
    address: client.contracts.agreement,
    abi: AGREEMENT_ABI,
    functionName: "getAgreement",
    args: [agreementId]
  });
  const [policyHash, partyA, partyB, signedByA, signedByB] = result;
  return {
    agreementId,
    policyHash,
    partyA,
    partyB,
    signedByA,
    signedByB,
    finalized: signedByA && signedByB
  };
}
async function recordSpend(client, policyHash, recipient, amount) {
  if (!client.contracts.vault) throw new Error("vault contract not configured");
  const txHash = await client.walletClient.writeContract({
    address: client.contracts.vault,
    abi: VAULT_ABI,
    functionName: "spend",
    args: [policyHash, recipient, amount]
  });
  return txHash;
}
async function getSpentToday(client, policyHash) {
  if (!client.contracts.vault) throw new Error("vault contract not configured");
  const result = await client.publicClient.readContract({
    address: client.contracts.vault,
    abi: VAULT_ABI,
    functionName: "getSpentToday",
    args: [policyHash]
  });
  return result;
}
async function setSpendingLimit(client, policyHash, agent, maxPerTx, maxPerDay, allowedRecipients) {
  if (!client.contracts.vault) throw new Error("vault contract not configured");
  const txHash = await client.walletClient.writeContract({
    address: client.contracts.vault,
    abi: VAULT_ABI,
    functionName: "setSpendingLimit",
    args: [policyHash, agent, maxPerTx, maxPerDay, allowedRecipients]
  });
  return txHash;
}

// src/middleware.ts
function wrap(policy, toolFn, extractRequest, chainClient) {
  return async (...args) => {
    const request = extractRequest(...args);
    const evaluation = evaluatePolicy(policy, request);
    if (evaluation.outcome !== "allow") {
      let txHash2;
      if (chainClient) {
        txHash2 = await attest(chainClient, policy, request, evaluation);
      }
      return {
        allowed: false,
        reason: evaluation.reason,
        txHash: txHash2
      };
    }
    if (request.amount && request.recipient && chainClient?.contracts.vault) {
      const policyHash = hashObject(policy);
      const amountWei = BigInt(Math.floor(request.amount * 1e18));
      try {
        await recordSpend(chainClient, policyHash, request.recipient, amountWei);
      } catch (err) {
        return {
          allowed: false,
          reason: `Vault spend denied: ${err instanceof Error ? err.message : String(err)}`
        };
      }
    }
    const result = await toolFn(...args);
    let txHash;
    if (chainClient) {
      txHash = await attest(chainClient, policy, request, evaluation);
    }
    return {
      allowed: true,
      result,
      reason: evaluation.reason,
      txHash
    };
  };
}

// src/index.ts
function createDelegate(config) {
  const chainClient = config.chain ? createChainClient(config.chain) : void 0;
  return {
    evaluate: evaluatePolicy,
    hash: hashObject,
    attest: (policy, request, result) => {
      if (!chainClient) throw new Error("Chain config required for attest()");
      return attest(chainClient, policy, request, result);
    },
    verify: (policy, request, result) => {
      if (!chainClient) throw new Error("Chain config required for verify()");
      return verify(chainClient, policy, request, result);
    },
    registerPolicy: (policy, metadataURI) => {
      if (!chainClient) throw new Error("Chain config required for registerPolicy()");
      return registerPolicy(chainClient, policy, metadataURI);
    },
    registerAgent: (agentId, metadataURI) => {
      if (!chainClient) throw new Error("Chain config required for registerAgent()");
      return registerAgent(chainClient, agentId, metadataURI);
    },
    commitPolicy: (policyHash) => {
      if (!chainClient) throw new Error("Chain config required for commitPolicy()");
      return commitPolicy(chainClient, policyHash);
    },
    getAgent: (address) => {
      if (!chainClient) throw new Error("Chain config required for getAgent()");
      return getAgent(chainClient, address);
    },
    proposeAgreement: (policyHash, counterparty) => {
      if (!chainClient) throw new Error("Chain config required for proposeAgreement()");
      return proposeAgreement(chainClient, policyHash, counterparty);
    },
    signAgreement: (agreementId) => {
      if (!chainClient) throw new Error("Chain config required for signAgreement()");
      return signAgreement(chainClient, agreementId);
    },
    getAgreement: (agreementId) => {
      if (!chainClient) throw new Error("Chain config required for getAgreement()");
      return getAgreement(chainClient, agreementId);
    },
    recordSpend: (policyHash, recipient, amount) => {
      if (!chainClient) throw new Error("Chain config required for recordSpend()");
      return recordSpend(chainClient, policyHash, recipient, amount);
    },
    getSpentToday: (policyHash) => {
      if (!chainClient) throw new Error("Chain config required for getSpentToday()");
      return getSpentToday(chainClient, policyHash);
    },
    setSpendingLimit: (policyHash, agent, maxPerTx, maxPerDay, allowedRecipients) => {
      if (!chainClient) throw new Error("Chain config required for setSpendingLimit()");
      return setSpendingLimit(chainClient, policyHash, agent, maxPerTx, maxPerDay, allowedRecipients);
    },
    wrap: (policy, toolFn, extractRequest) => {
      return wrap(policy, toolFn, extractRequest, chainClient);
    },
    policies: config.policies,
    chainClient
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AGENT_REGISTRY_ABI,
  AGREEMENT_ABI,
  AUDIT_LOG_ABI,
  REGISTRY_ABI,
  VAULT_ABI,
  VERIFIER_ABI,
  attest,
  canonicalize,
  commitPolicy,
  createChainClient,
  createDelegate,
  evaluatePolicy,
  evaluateRule,
  getAgent,
  getAgreement,
  getSpentToday,
  hashObject,
  proposeAgreement,
  recordSpend,
  registerAgent,
  registerPolicy,
  setSpendingLimit,
  signAgreement,
  verify,
  wrap
});
//# sourceMappingURL=index.cjs.map