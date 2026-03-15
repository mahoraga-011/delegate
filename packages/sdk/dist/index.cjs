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
  AUDIT_LOG_ABI: () => AUDIT_LOG_ABI,
  REGISTRY_ABI: () => REGISTRY_ABI,
  VERIFIER_ABI: () => VERIFIER_ABI,
  attest: () => attest,
  canonicalize: () => canonicalize,
  createChainClient: () => createChainClient,
  createDelegate: () => createDelegate,
  evaluatePolicy: () => evaluatePolicy,
  evaluateRule: () => evaluateRule,
  hashObject: () => hashObject,
  registerPolicy: () => registerPolicy,
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
    wrap: (policy, toolFn, extractRequest) => {
      return wrap(policy, toolFn, extractRequest, chainClient);
    },
    policies: config.policies,
    chainClient
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AUDIT_LOG_ABI,
  REGISTRY_ABI,
  VERIFIER_ABI,
  attest,
  canonicalize,
  createChainClient,
  createDelegate,
  evaluatePolicy,
  evaluateRule,
  hashObject,
  registerPolicy,
  verify,
  wrap
});
//# sourceMappingURL=index.cjs.map