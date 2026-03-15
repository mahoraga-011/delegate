type PolicyRule = {
    id: string;
    label: string;
    field: "actionType" | "tool" | "risk" | "target";
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
type ChainConfig = {
    rpc: string;
    privateKey: string;
    chainId?: number;
    contracts: {
        registry: `0x${string}`;
        auditLog: `0x${string}`;
        verifier: `0x${string}`;
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

export { AUDIT_LOG_ABI, type AgentActionRequest, type AuditEntry, type ChainClient, type ChainConfig, type DelegateConfig, type DelegateInstance, type EvaluationResult, type Policy, type PolicyCheck, type PolicyRule, REGISTRY_ABI, type ToolFunction, VERIFIER_ABI, type WrappedResult, attest, canonicalize, createChainClient, createDelegate, evaluatePolicy, evaluateRule, hashObject, registerPolicy, verify, wrap };
