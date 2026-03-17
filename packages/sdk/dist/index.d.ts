type PolicyRule = {
    id: string;
    label: string;
    field: string;
    operator: "equals" | "notEquals" | "includes" | "notIncludes" | "lte" | "gte";
    value: string | number;
    rationale: string;
};
type Policy = {
    id: string;
    name: string;
    description: string;
    defaultEffect: "allow" | "deny";
    rules: PolicyRule[];
};
type AgentActionRequest = {
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
type PolicyCheck = {
    ruleId: string;
    label: string;
    passed: boolean;
    summary: string;
    rationale: string;
};
type EvaluationResult = {
    outcome: "allow" | "deny";
    checks: PolicyCheck[];
    reason: string;
    scorecard: {
        passed: number;
        failed: number;
    };
};
type AuditEntry = {
    id: string;
    timestamp: string;
    policyName: string;
    request: AgentActionRequest;
    result: EvaluationResult;
    txHash?: string;
};
type AgentIdentity = {
    agentId: string;
    owner: string;
    metadataURI: string;
    policyHashes: string[];
};
type Agreement = {
    agreementId: string;
    policyHash: string;
    partyA: string;
    partyB: string;
    signedByA: boolean;
    signedByB: boolean;
    finalized: boolean;
};
type VaultInfo = {
    balance: bigint;
    spentToday: bigint;
    maxPerTx: bigint;
    maxPerDay: bigint;
    allowedRecipients: string[];
};
type ChainConfig = {
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
type DelegateConfig = {
    policies: Policy[];
    chain?: ChainConfig;
};

declare const AUDIT_LOG_ABI: readonly [{
    readonly type: "function";
    readonly name: "logDecision";
    readonly inputs: readonly [{
        readonly name: "policyHash";
        readonly type: "bytes32";
    }, {
        readonly name: "requestHash";
        readonly type: "bytes32";
    }, {
        readonly name: "resultHash";
        readonly type: "bytes32";
    }, {
        readonly name: "allowed";
        readonly type: "bool";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "event";
    readonly name: "DecisionLogged";
    readonly inputs: readonly [{
        readonly name: "agent";
        readonly type: "address";
        readonly indexed: true;
    }, {
        readonly name: "policyHash";
        readonly type: "bytes32";
        readonly indexed: true;
    }, {
        readonly name: "requestHash";
        readonly type: "bytes32";
        readonly indexed: false;
    }, {
        readonly name: "resultHash";
        readonly type: "bytes32";
        readonly indexed: false;
    }, {
        readonly name: "allowed";
        readonly type: "bool";
        readonly indexed: false;
    }, {
        readonly name: "timestamp";
        readonly type: "uint256";
        readonly indexed: false;
    }];
}];
declare const REGISTRY_ABI: readonly [{
    readonly type: "function";
    readonly name: "registerPolicy";
    readonly inputs: readonly [{
        readonly name: "policyHash";
        readonly type: "bytes32";
    }, {
        readonly name: "metadataURI";
        readonly type: "string";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "getPolicy";
    readonly inputs: readonly [{
        readonly name: "policyHash";
        readonly type: "bytes32";
    }];
    readonly outputs: readonly [{
        readonly name: "registrant";
        readonly type: "address";
    }, {
        readonly name: "timestamp";
        readonly type: "uint256";
    }, {
        readonly name: "metadataURI";
        readonly type: "string";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "event";
    readonly name: "PolicyRegistered";
    readonly inputs: readonly [{
        readonly name: "registrant";
        readonly type: "address";
        readonly indexed: true;
    }, {
        readonly name: "policyHash";
        readonly type: "bytes32";
        readonly indexed: true;
    }, {
        readonly name: "metadataURI";
        readonly type: "string";
        readonly indexed: false;
    }, {
        readonly name: "timestamp";
        readonly type: "uint256";
        readonly indexed: false;
    }];
}];
declare const VERIFIER_ABI: readonly [{
    readonly type: "function";
    readonly name: "verify";
    readonly inputs: readonly [{
        readonly name: "policyHash";
        readonly type: "bytes32";
    }, {
        readonly name: "requestHash";
        readonly type: "bytes32";
    }, {
        readonly name: "resultHash";
        readonly type: "bytes32";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "bool";
    }];
    readonly stateMutability: "view";
}];
declare const AGENT_REGISTRY_ABI: readonly [{
    readonly type: "function";
    readonly name: "registerAgent";
    readonly inputs: readonly [{
        readonly name: "agentId";
        readonly type: "bytes32";
    }, {
        readonly name: "metadataURI";
        readonly type: "string";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "commitPolicy";
    readonly inputs: readonly [{
        readonly name: "policyHash";
        readonly type: "bytes32";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "getAgent";
    readonly inputs: readonly [{
        readonly name: "owner";
        readonly type: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "agentId";
        readonly type: "bytes32";
    }, {
        readonly name: "metadataURI";
        readonly type: "string";
    }, {
        readonly name: "policyHashes";
        readonly type: "bytes32[]";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "isRegistered";
    readonly inputs: readonly [{
        readonly name: "";
        readonly type: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "bool";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "event";
    readonly name: "AgentRegistered";
    readonly inputs: readonly [{
        readonly name: "owner";
        readonly type: "address";
        readonly indexed: true;
    }, {
        readonly name: "agentId";
        readonly type: "bytes32";
        readonly indexed: true;
    }, {
        readonly name: "metadataURI";
        readonly type: "string";
        readonly indexed: false;
    }, {
        readonly name: "timestamp";
        readonly type: "uint256";
        readonly indexed: false;
    }];
}, {
    readonly type: "event";
    readonly name: "PolicyCommitted";
    readonly inputs: readonly [{
        readonly name: "owner";
        readonly type: "address";
        readonly indexed: true;
    }, {
        readonly name: "policyHash";
        readonly type: "bytes32";
        readonly indexed: true;
    }, {
        readonly name: "timestamp";
        readonly type: "uint256";
        readonly indexed: false;
    }];
}];
declare const AGREEMENT_ABI: readonly [{
    readonly type: "function";
    readonly name: "proposeAgreement";
    readonly inputs: readonly [{
        readonly name: "policyHash";
        readonly type: "bytes32";
    }, {
        readonly name: "counterparty";
        readonly type: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "agreementId";
        readonly type: "bytes32";
    }];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "signAgreement";
    readonly inputs: readonly [{
        readonly name: "agreementId";
        readonly type: "bytes32";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "verifyCompliance";
    readonly inputs: readonly [{
        readonly name: "agreementId";
        readonly type: "bytes32";
    }, {
        readonly name: "requestHash";
        readonly type: "bytes32";
    }, {
        readonly name: "resultHash";
        readonly type: "bytes32";
    }];
    readonly outputs: readonly [{
        readonly name: "compliant";
        readonly type: "bool";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "getAgreement";
    readonly inputs: readonly [{
        readonly name: "agreementId";
        readonly type: "bytes32";
    }];
    readonly outputs: readonly [{
        readonly name: "policyHash";
        readonly type: "bytes32";
    }, {
        readonly name: "partyA";
        readonly type: "address";
    }, {
        readonly name: "partyB";
        readonly type: "address";
    }, {
        readonly name: "signedByA";
        readonly type: "bool";
    }, {
        readonly name: "signedByB";
        readonly type: "bool";
    }, {
        readonly name: "timestamp";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "event";
    readonly name: "AgreementProposed";
    readonly inputs: readonly [{
        readonly name: "agreementId";
        readonly type: "bytes32";
        readonly indexed: true;
    }, {
        readonly name: "policyHash";
        readonly type: "bytes32";
        readonly indexed: true;
    }, {
        readonly name: "partyA";
        readonly type: "address";
        readonly indexed: true;
    }, {
        readonly name: "partyB";
        readonly type: "address";
        readonly indexed: false;
    }, {
        readonly name: "timestamp";
        readonly type: "uint256";
        readonly indexed: false;
    }];
}, {
    readonly type: "event";
    readonly name: "AgreementFinalized";
    readonly inputs: readonly [{
        readonly name: "agreementId";
        readonly type: "bytes32";
        readonly indexed: true;
    }, {
        readonly name: "partyA";
        readonly type: "address";
        readonly indexed: true;
    }, {
        readonly name: "partyB";
        readonly type: "address";
        readonly indexed: true;
    }, {
        readonly name: "timestamp";
        readonly type: "uint256";
        readonly indexed: false;
    }];
}];
declare const VAULT_ABI: readonly [{
    readonly type: "function";
    readonly name: "deposit";
    readonly inputs: readonly [{
        readonly name: "policyHash";
        readonly type: "bytes32";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
}, {
    readonly type: "function";
    readonly name: "setSpendingLimit";
    readonly inputs: readonly [{
        readonly name: "policyHash";
        readonly type: "bytes32";
    }, {
        readonly name: "agent";
        readonly type: "address";
    }, {
        readonly name: "maxPerTx";
        readonly type: "uint256";
    }, {
        readonly name: "maxPerDay";
        readonly type: "uint256";
    }, {
        readonly name: "allowedRecipients";
        readonly type: "address[]";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "spend";
    readonly inputs: readonly [{
        readonly name: "policyHash";
        readonly type: "bytes32";
    }, {
        readonly name: "recipient";
        readonly type: "address";
    }, {
        readonly name: "amount";
        readonly type: "uint256";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "withdraw";
    readonly inputs: readonly [{
        readonly name: "policyHash";
        readonly type: "bytes32";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "getBalance";
    readonly inputs: readonly [{
        readonly name: "policyHash";
        readonly type: "bytes32";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "getSpentToday";
    readonly inputs: readonly [{
        readonly name: "policyHash";
        readonly type: "bytes32";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "getSpendingLimit";
    readonly inputs: readonly [{
        readonly name: "policyHash";
        readonly type: "bytes32";
    }];
    readonly outputs: readonly [{
        readonly name: "agent";
        readonly type: "address";
    }, {
        readonly name: "maxPerTx";
        readonly type: "uint256";
    }, {
        readonly name: "maxPerDay";
        readonly type: "uint256";
    }, {
        readonly name: "allowedRecipients";
        readonly type: "address[]";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "event";
    readonly name: "Deposited";
    readonly inputs: readonly [{
        readonly name: "policyHash";
        readonly type: "bytes32";
        readonly indexed: true;
    }, {
        readonly name: "depositor";
        readonly type: "address";
        readonly indexed: true;
    }, {
        readonly name: "amount";
        readonly type: "uint256";
        readonly indexed: false;
    }];
}, {
    readonly type: "event";
    readonly name: "SpendingLimitSet";
    readonly inputs: readonly [{
        readonly name: "policyHash";
        readonly type: "bytes32";
        readonly indexed: true;
    }, {
        readonly name: "agent";
        readonly type: "address";
        readonly indexed: true;
    }, {
        readonly name: "maxPerTx";
        readonly type: "uint256";
        readonly indexed: false;
    }, {
        readonly name: "maxPerDay";
        readonly type: "uint256";
        readonly indexed: false;
    }];
}, {
    readonly type: "event";
    readonly name: "SpendExecuted";
    readonly inputs: readonly [{
        readonly name: "policyHash";
        readonly type: "bytes32";
        readonly indexed: true;
    }, {
        readonly name: "agent";
        readonly type: "address";
        readonly indexed: true;
    }, {
        readonly name: "recipient";
        readonly type: "address";
        readonly indexed: true;
    }, {
        readonly name: "amount";
        readonly type: "uint256";
        readonly indexed: false;
    }];
}, {
    readonly type: "event";
    readonly name: "SpendDenied";
    readonly inputs: readonly [{
        readonly name: "policyHash";
        readonly type: "bytes32";
        readonly indexed: true;
    }, {
        readonly name: "agent";
        readonly type: "address";
        readonly indexed: true;
    }, {
        readonly name: "recipient";
        readonly type: "address";
        readonly indexed: false;
    }, {
        readonly name: "amount";
        readonly type: "uint256";
        readonly indexed: false;
    }, {
        readonly name: "reason";
        readonly type: "string";
        readonly indexed: false;
    }];
}, {
    readonly type: "event";
    readonly name: "Withdrawn";
    readonly inputs: readonly [{
        readonly name: "policyHash";
        readonly type: "bytes32";
        readonly indexed: true;
    }, {
        readonly name: "owner";
        readonly type: "address";
        readonly indexed: true;
    }, {
        readonly name: "amount";
        readonly type: "uint256";
        readonly indexed: false;
    }];
}];
interface ChainClient {
    publicClient: any;
    walletClient: any;
    contracts: ChainConfig["contracts"];
}
declare function createChainClient(config: ChainConfig): ChainClient;
/**
 * Attest a policy decision on-chain via the AuditLog contract.
 * Returns the transaction hash.
 */
declare function attest(client: ChainClient, policy: Policy, request: AgentActionRequest, result: EvaluationResult): Promise<`0x${string}`>;
/**
 * Verify a decision exists on-chain via the Verifier contract.
 */
declare function verify(client: ChainClient, policy: Policy, request: AgentActionRequest, result: EvaluationResult): Promise<boolean>;
/**
 * Register a policy hash on-chain via the Registry contract.
 */
declare function registerPolicy(client: ChainClient, policy: Policy, metadataURI?: string): Promise<`0x${string}`>;
/**
 * Register an agent identity on-chain.
 */
declare function registerAgent(client: ChainClient, agentId: `0x${string}`, metadataURI?: string): Promise<`0x${string}`>;
/**
 * Commit to a policy (agent must be registered, policy must exist in registry).
 */
declare function commitPolicy(client: ChainClient, policyHash: `0x${string}`): Promise<`0x${string}`>;
/**
 * Look up an agent by address.
 */
declare function getAgent(client: ChainClient, address: `0x${string}`): Promise<AgentIdentity>;
/**
 * Propose a bilateral agreement.
 */
declare function proposeAgreement(client: ChainClient, policyHash: `0x${string}`, counterparty: `0x${string}`): Promise<`0x${string}`>;
/**
 * Sign (finalize) an agreement as the counterparty.
 */
declare function signAgreement(client: ChainClient, agreementId: `0x${string}`): Promise<`0x${string}`>;
/**
 * Get agreement details.
 */
declare function getAgreement(client: ChainClient, agreementId: `0x${string}`): Promise<Agreement>;
/**
 * Record a spend through the vault (called by authorized agent).
 */
declare function recordSpend(client: ChainClient, policyHash: `0x${string}`, recipient: `0x${string}`, amount: bigint): Promise<`0x${string}`>;
/**
 * Get amount spent in the current 24h window.
 */
declare function getSpentToday(client: ChainClient, policyHash: `0x${string}`): Promise<bigint>;
/**
 * Set spending limits for an agent under a policy.
 */
declare function setSpendingLimit(client: ChainClient, policyHash: `0x${string}`, agent: `0x${string}`, maxPerTx: bigint, maxPerDay: bigint, allowedRecipients: `0x${string}`[]): Promise<`0x${string}`>;

type ToolFunction<TArgs extends unknown[] = unknown[], TReturn = unknown> = (...args: TArgs) => TReturn | Promise<TReturn>;
type WrappedResult<TReturn> = {
    allowed: boolean;
    result?: TReturn;
    txHash?: `0x${string}`;
    reason: string;
};
/**
 * Wrap a tool function with policy evaluation and optional on-chain attestation.
 *
 * The `extractRequest` function converts tool arguments into an AgentActionRequest
 * for policy evaluation.
 */
declare function wrap<TArgs extends unknown[], TReturn>(policy: Policy, toolFn: ToolFunction<TArgs, TReturn>, extractRequest: (...args: TArgs) => AgentActionRequest, chainClient?: ChainClient): (...args: TArgs) => Promise<WrappedResult<TReturn>>;

declare const evaluateRule: (request: AgentActionRequest, rule: PolicyRule) => PolicyCheck;
declare const evaluatePolicy: (policy: Policy, request: AgentActionRequest) => EvaluationResult;

/**
 * Canonical JSON stringify with sorted keys.
 * Ensures deterministic serialization regardless of object key insertion order.
 */
declare function canonicalize(obj: unknown): string;
/**
 * Hash an object using canonical JSON → keccak256.
 * Returns a bytes32 hex string.
 */
declare function hashObject(obj: unknown): `0x${string}`;

interface DelegateInstance {
    /** Evaluate a policy against a request (pure, deterministic) */
    evaluate: (policy: Policy, request: AgentActionRequest) => EvaluationResult;
    /** Hash any object using canonical JSON → keccak256 */
    hash: (obj: unknown) => `0x${string}`;
    /** Attest a decision on-chain (requires chain config) */
    attest: (policy: Policy, request: AgentActionRequest, result: EvaluationResult) => Promise<`0x${string}`>;
    /** Verify a decision exists on-chain (requires chain config) */
    verify: (policy: Policy, request: AgentActionRequest, result: EvaluationResult) => Promise<boolean>;
    /** Register a policy hash on-chain (requires chain config) */
    registerPolicy: (policy: Policy, metadataURI?: string) => Promise<`0x${string}`>;
    /** Register an agent identity on-chain */
    registerAgent: (agentId: `0x${string}`, metadataURI?: string) => Promise<`0x${string}`>;
    /** Commit to a policy as an agent */
    commitPolicy: (policyHash: `0x${string}`) => Promise<`0x${string}`>;
    /** Look up an agent by address */
    getAgent: (address: `0x${string}`) => Promise<AgentIdentity>;
    /** Propose a bilateral agreement */
    proposeAgreement: (policyHash: `0x${string}`, counterparty: `0x${string}`) => Promise<`0x${string}`>;
    /** Sign an agreement as counterparty */
    signAgreement: (agreementId: `0x${string}`) => Promise<`0x${string}`>;
    /** Get agreement details */
    getAgreement: (agreementId: `0x${string}`) => Promise<Agreement>;
    /** Execute a spend through the vault */
    recordSpend: (policyHash: `0x${string}`, recipient: `0x${string}`, amount: bigint) => Promise<`0x${string}`>;
    /** Get amount spent today in vault */
    getSpentToday: (policyHash: `0x${string}`) => Promise<bigint>;
    /** Set spending limits in vault */
    setSpendingLimit: (policyHash: `0x${string}`, agent: `0x${string}`, maxPerTx: bigint, maxPerDay: bigint, allowedRecipients: `0x${string}`[]) => Promise<`0x${string}`>;
    /** Wrap a tool function with policy enforcement + optional attestation */
    wrap: <TArgs extends unknown[], TReturn>(policy: Policy, toolFn: ToolFunction<TArgs, TReturn>, extractRequest: (...args: TArgs) => AgentActionRequest) => (...args: TArgs) => Promise<WrappedResult<TReturn>>;
    /** The configured policies */
    policies: Policy[];
    /** The chain client, if configured */
    chainClient?: ChainClient;
}
/**
 * Create a Delegate instance.
 *
 * Usage:
 * ```ts
 * const delegate = createDelegate({
 *   policies: [myPolicy],
 *   chain: { rpc, privateKey, contracts }
 * })
 *
 * const result = delegate.evaluate(myPolicy, request)
 * const txHash = await delegate.attest(myPolicy, request, result)
 * const valid = await delegate.verify(myPolicy, request, result)
 * ```
 */
declare function createDelegate(config: DelegateConfig): DelegateInstance;

export { AGENT_REGISTRY_ABI, AGREEMENT_ABI, AUDIT_LOG_ABI, type AgentActionRequest, type AgentIdentity, type Agreement, type AuditEntry, type ChainClient, type ChainConfig, type DelegateConfig, type DelegateInstance, type EvaluationResult, type Policy, type PolicyCheck, type PolicyRule, REGISTRY_ABI, type ToolFunction, VAULT_ABI, VERIFIER_ABI, type VaultInfo, type WrappedResult, attest, canonicalize, commitPolicy, createChainClient, createDelegate, evaluatePolicy, evaluateRule, getAgent, getAgreement, getSpentToday, hashObject, proposeAgreement, recordSpend, registerAgent, registerPolicy, setSpendingLimit, signAgreement, verify, wrap };
