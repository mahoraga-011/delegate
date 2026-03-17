import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

function Code({ children }: { children: string }) {
  return (
    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{children}</code>
  );
}

function CodeBlock({ children, title }: { children: string; title?: string }) {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {title && (
        <div className="border-b px-4 py-2 text-xs font-medium text-muted-foreground">{title}</div>
      )}
      <pre className="p-4 overflow-x-auto text-sm font-mono leading-relaxed">{children}</pre>
    </div>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 space-y-6">
      <h2 className="text-2xl font-bold tracking-tight border-b pb-4">{title}</h2>
      {children}
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">{title}</h3>
      {children}
    </div>
  );
}

const NAV = [
  { id: "overview", label: "Overview" },
  { id: "quickstart", label: "Quick Start" },
  { id: "api", label: "API Reference" },
  { id: "policies", label: "Policies" },
  { id: "sdk", label: "SDK" },
  { id: "onchain", label: "On-Chain" },
  { id: "agents", label: "For Agents" },
];

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <nav className="mx-auto flex h-14 max-w-6xl items-center px-6">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Delegate<span className="text-muted-foreground">.</span>
          </Link>
          <span className="ml-3 text-sm text-muted-foreground">Docs</span>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
          </div>
        </nav>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10 flex gap-12">
        {/* Sidebar */}
        <aside className="hidden lg:block w-48 shrink-0">
          <nav className="sticky top-24 space-y-1">
            {NAV.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="block px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0 space-y-16">

          {/* Overview */}
          <Section id="overview" title="Overview">
            <p className="text-muted-foreground leading-relaxed">
              Delegate is a deterministic policy engine for AI agents with on-chain verification.
              It lets you define rules that constrain what agents can do, evaluate requests against
              those rules, and verify every decision on-chain. No AI in the evaluation loop. No ambiguity.
              Same input, same output, every time.
            </p>

            <SubSection title="Architecture">
              <p className="text-muted-foreground leading-relaxed">
                Delegate has three layers:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong className="text-foreground">API</strong> (this server): Evaluate policies, hash objects, verify decisions. Read-only, no private keys needed.</li>
                <li><strong className="text-foreground">SDK</strong> (npm package): Full TypeScript SDK for agents with a runtime. Includes evaluation, hashing, and on-chain write operations.</li>
                <li><strong className="text-foreground">Smart Contracts</strong> (Base Sepolia): PolicyRegistry, AuditLog, Verifier, AgentRegistry, Agreement, Vault. Immutable on-chain records.</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                The API handles the brain (evaluation). Agents handle their own wallet (signing).
                No private keys are sent to or stored by the API.
              </p>
            </SubSection>
          </Section>

          {/* Quick Start */}
          <Section id="quickstart" title="Quick Start">
            <SubSection title="Evaluate a request (no setup needed)">
              <CodeBlock title="curl">{`curl -X POST ${process.env.NEXT_PUBLIC_URL || "https://your-domain.vercel.app"}/api/evaluate \\
  -H "Content-Type: application/json" \\
  -d '{
    "policy": {
      "id": "spending-guard",
      "name": "Spending Guard",
      "description": "Max 0.1 ETH transfers",
      "defaultEffect": "deny",
      "rules": [
        {"id": "r1", "label": "Amount cap", "field": "amount", "operator": "lte", "value": 0.1, "rationale": "Spending limit"},
        {"id": "r2", "label": "Transfer only", "field": "tool", "operator": "equals", "value": "transfer", "rationale": "Only transfers"}
      ]
    },
    "request": {
      "actionType": "transfer",
      "tool": "transfer",
      "risk": 2,
      "target": "wallet",
      "justification": "Pay vendor",
      "amount": 0.05
    }
  }'`}</CodeBlock>

              <p className="text-muted-foreground">
                Response:
              </p>
              <CodeBlock>{`{
  "outcome": "allow",
  "checks": [
    {"ruleId": "r1", "label": "Amount cap", "passed": true, "summary": "amount lte 0.1"},
    {"ruleId": "r2", "label": "Transfer only", "passed": true, "summary": "tool equals transfer"}
  ],
  "reason": "All deterministic policy checks passed.",
  "scorecard": {"passed": 2, "failed": 0},
  "policyHash": "0x...",
  "requestHash": "0x...",
  "resultHash": "0x..."
}`}</CodeBlock>
            </SubSection>

            <SubSection title="For agents">
              <p className="text-muted-foreground leading-relaxed">
                Agents can read the full SDK and API reference in a single file:
              </p>
              <CodeBlock title="terminal">{`curl -s ${process.env.NEXT_PUBLIC_URL || "https://your-domain.vercel.app"}/skill.md`}</CodeBlock>
              <p className="text-muted-foreground leading-relaxed">
                The skill file contains everything an agent needs: API endpoints, SDK usage,
                contract addresses, type definitions, and code examples.
              </p>
            </SubSection>
          </Section>

          {/* API Reference */}
          <Section id="api" title="API Reference">
            <p className="text-muted-foreground leading-relaxed">
              All endpoints are read-only. No authentication required. No private keys needed.
              For on-chain write operations (register, attest, sign), agents interact with the
              smart contracts directly using their own wallet.
            </p>

            <SubSection title="POST /api/evaluate">
              <p className="text-muted-foreground">Evaluate an agent action request against a policy. Pure computation, no chain interaction.</p>
              <CodeBlock title="Request body">{`{
  "policy": {
    "id": "string",
    "name": "string",
    "description": "string",
    "defaultEffect": "allow" | "deny",
    "rules": [
      {
        "id": "string",
        "label": "string",
        "field": "string",         // any field name
        "operator": "equals" | "notEquals" | "includes" | "notIncludes" | "lte" | "gte",
        "value": "string | number",
        "rationale": "string"
      }
    ]
  },
  "request": {
    "actionType": "string",
    "tool": "string",
    "risk": 0-10,
    "target": "string",
    "justification": "string",
    // ...any custom fields matching your policy rules
  }
}`}</CodeBlock>
              <CodeBlock title="Response">{`{
  "outcome": "allow" | "deny",
  "checks": [{ "ruleId", "label", "passed", "summary", "rationale" }],
  "reason": "string",
  "scorecard": { "passed": number, "failed": number },
  "policyHash": "0x...",
  "requestHash": "0x...",
  "resultHash": "0x..."
}`}</CodeBlock>
            </SubSection>

            <SubSection title="POST /api/hash">
              <p className="text-muted-foreground">Hash any object using canonical JSON and keccak256. Produces the same hash used by the smart contracts.</p>
              <CodeBlock title="Request body">{`{ "data": { ...any object } }`}</CodeBlock>
              <CodeBlock title="Response">{`{ "hash": "0x..." }`}</CodeBlock>
            </SubSection>

            <SubSection title="POST /api/verify">
              <p className="text-muted-foreground">
                Check if a specific policy decision was previously attested on-chain.
                Re-evaluates the request locally, computes hashes, and queries the Verifier contract.
              </p>
              <CodeBlock title="Request body">{`{
  "policy": { ...policy object },
  "request": { ...request object }
}`}</CodeBlock>
              <CodeBlock title="Response">{`{
  "verified": true | false,
  "outcome": "allow" | "deny",
  "policyHash": "0x...",
  "requestHash": "0x...",
  "resultHash": "0x..."
}`}</CodeBlock>
            </SubSection>

            <SubSection title="GET /api/agent/:address">
              <p className="text-muted-foreground">Look up an agent's on-chain identity and committed policies.</p>
              <CodeBlock title="Example">{`GET /api/agent/0x70997970C51812dc3A010C7d01b50e0d17dc79C8`}</CodeBlock>
              <CodeBlock title="Response">{`{
  "agentId": "0x...",
  "metadataURI": "ipfs://...",
  "policyHashes": ["0x...", "0x..."],
  "registered": true
}`}</CodeBlock>
            </SubSection>

            <SubSection title="GET /api/agreement/:id">
              <p className="text-muted-foreground">Look up a bilateral agreement by its on-chain ID.</p>
              <CodeBlock title="Response">{`{
  "agreementId": "0x...",
  "policyHash": "0x...",
  "partyA": "0x...",
  "partyB": "0x...",
  "signedByA": true,
  "signedByB": true,
  "finalized": true
}`}</CodeBlock>
            </SubSection>
          </Section>

          {/* Policies */}
          <Section id="policies" title="Policies">
            <p className="text-muted-foreground leading-relaxed">
              A policy is a set of deterministic rules. Each rule checks a field on the
              agent's request against a value using an operator. All rules must pass for
              the action to be allowed. Any failure results in denial.
            </p>

            <SubSection title="Rule structure">
              <p className="text-muted-foreground">Each rule has:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li><strong className="text-foreground">field</strong>: any string. Can be a built-in field (actionType, tool, risk, target, amount) or any custom field (department, dataType, environment, approvalLevel).</li>
                <li><strong className="text-foreground">operator</strong>: equals, notEquals, includes (pipe-separated options), notIncludes, lte (less than or equal), gte (greater than or equal).</li>
                <li><strong className="text-foreground">value</strong>: string or number to compare against.</li>
              </ul>
            </SubSection>

            <SubSection title="Custom fields">
              <p className="text-muted-foreground leading-relaxed">
                You can use any field name in your policy rules. The agent's request just needs
                to include a matching field. This lets you model domain-specific policies:
              </p>
              <CodeBlock title="Example: Compliance policy">{`{
  "id": "compliance-check",
  "name": "Data Compliance",
  "description": "No PII access without encryption in non-prod environments",
  "defaultEffect": "deny",
  "rules": [
    {"id": "r1", "label": "Data type must not be PII", "field": "dataType", "operator": "notEquals", "value": "pii", "rationale": "PII requires special handling"},
    {"id": "r2", "label": "Must be staging", "field": "environment", "operator": "equals", "value": "staging", "rationale": "Non-prod only"},
    {"id": "r3", "label": "Encryption required", "field": "encryptionEnabled", "operator": "equals", "value": "true", "rationale": "All data must be encrypted"}
  ]
}`}</CodeBlock>
              <CodeBlock title="Matching request">{`{
  "actionType": "read",
  "tool": "database",
  "risk": 3,
  "target": "user-records",
  "justification": "Generate anonymized report",
  "dataType": "aggregate",
  "environment": "staging",
  "encryptionEnabled": "true"
}`}</CodeBlock>
            </SubSection>

            <SubSection title="How evaluation works">
              <p className="text-muted-foreground leading-relaxed">
                The engine loops through every rule in the policy. For each rule, it reads{" "}
                <Code>request[rule.field]</Code>, normalizes the value (lowercase for strings),
                and applies the operator. If all rules pass, the outcome is "allow". If any
                rule fails, the outcome is the policy's <Code>defaultEffect</Code> (usually "deny").
              </p>
              <p className="text-muted-foreground leading-relaxed">
                This is pure boolean logic. No AI, no LLM, no probabilistic evaluation.
                Same input produces the same output every time, on any machine.
              </p>
            </SubSection>
          </Section>

          {/* SDK */}
          <Section id="sdk" title="SDK">
            <p className="text-muted-foreground leading-relaxed">
              For agents with a Node.js runtime, the SDK provides the full feature set
              including on-chain write operations.
            </p>

            <SubSection title="Install">
              <CodeBlock title="terminal">{`npm install @delegate/sdk`}</CodeBlock>
              <p className="text-sm text-muted-foreground">Note: the SDK is currently available via the project's monorepo. Publish to npm for external use.</p>
            </SubSection>

            <SubSection title="Usage">
              <CodeBlock title="TypeScript">{`import { createDelegate } from "@delegate/sdk";

const delegate = createDelegate({
  policies: [myPolicy],
  chain: {
    rpc: "https://base-sepolia.g.alchemy.com/v2/YOUR_KEY",
    privateKey: "0xYOUR_KEY",
    chainId: 84532,
    contracts: {
      registry: "0x3a45bC84fa4a460FD65a4CfE1B96edA45bD88E15",
      auditLog: "0x23b75deDDcB048BBe3db741eD05E309F901fb688",
      verifier: "0xa20Db185523EF7061EA4B002664d3695f9804c6A",
      agentRegistry: "0xf78B0b7E32d2C693F6015eDfD55171b1D7732985",
      agreement: "0x2a8Bfa499F68000b3502aab4268C6e765b838601",
      vault: "0x5242d8517b60c56F91AdF6FB8a015dFB6Ed8f307",
    },
  },
});

// Evaluate
const result = delegate.evaluate(policy, request);

// Attest on-chain
const txHash = await delegate.attest(policy, request, result);

// Verify
const valid = await delegate.verify(policy, request, result);`}</CodeBlock>
            </SubSection>

            <SubSection title="SDK vs API">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left p-3 font-medium">Feature</th>
                      <th className="text-left p-3 font-medium">API</th>
                      <th className="text-left p-3 font-medium">SDK</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b"><td className="p-3">Evaluate</td><td className="p-3">Yes</td><td className="p-3">Yes</td></tr>
                    <tr className="border-b"><td className="p-3">Hash</td><td className="p-3">Yes</td><td className="p-3">Yes</td></tr>
                    <tr className="border-b"><td className="p-3">Verify (read)</td><td className="p-3">Yes</td><td className="p-3">Yes</td></tr>
                    <tr className="border-b"><td className="p-3">Lookup agent/agreement</td><td className="p-3">Yes</td><td className="p-3">Yes</td></tr>
                    <tr className="border-b"><td className="p-3">Register policy</td><td className="p-3">No (use contracts)</td><td className="p-3">Yes</td></tr>
                    <tr className="border-b"><td className="p-3">Attest decision</td><td className="p-3">No (use contracts)</td><td className="p-3">Yes</td></tr>
                    <tr className="border-b"><td className="p-3">Register agent</td><td className="p-3">No (use contracts)</td><td className="p-3">Yes</td></tr>
                    <tr className="border-b"><td className="p-3">Propose/sign agreement</td><td className="p-3">No (use contracts)</td><td className="p-3">Yes</td></tr>
                    <tr><td className="p-3">Vault operations</td><td className="p-3">No (use contracts)</td><td className="p-3">Yes</td></tr>
                  </tbody>
                </table>
              </div>
            </SubSection>
          </Section>

          {/* On-Chain */}
          <Section id="onchain" title="On-Chain">
            <p className="text-muted-foreground leading-relaxed">
              All contracts are deployed on Base Sepolia (chain ID 84532). Agents interact
              with contracts directly using their own wallet for write operations. The API
              and SDK handle read operations.
            </p>

            <SubSection title="Contract Addresses (Base Sepolia)">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border font-mono">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left p-3 font-medium font-sans">Contract</th>
                      <th className="text-left p-3 font-medium font-sans">Address</th>
                      <th className="text-left p-3 font-medium font-sans">Purpose</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground text-xs">
                    <tr className="border-b"><td className="p-3 font-sans">PolicyRegistry</td><td className="p-3">0x3a45bC84fa4a460FD65a4CfE1B96edA45bD88E15</td><td className="p-3 font-sans">Register policy hashes</td></tr>
                    <tr className="border-b"><td className="p-3 font-sans">AuditLog</td><td className="p-3">0x23b75deDDcB048BBe3db741eD05E309F901fb688</td><td className="p-3 font-sans">Log decisions on-chain</td></tr>
                    <tr className="border-b"><td className="p-3 font-sans">Verifier</td><td className="p-3">0xa20Db185523EF7061EA4B002664d3695f9804c6A</td><td className="p-3 font-sans">Verify logged decisions</td></tr>
                    <tr className="border-b"><td className="p-3 font-sans">AgentRegistry</td><td className="p-3">0xf78B0b7E32d2C693F6015eDfD55171b1D7732985</td><td className="p-3 font-sans">Agent identity + policy commits</td></tr>
                    <tr className="border-b"><td className="p-3 font-sans">Agreement</td><td className="p-3">0x2a8Bfa499F68000b3502aab4268C6e765b838601</td><td className="p-3 font-sans">Bilateral agreements</td></tr>
                    <tr><td className="p-3 font-sans">Vault</td><td className="p-3">0x5242d8517b60c56F91AdF6FB8a015dFB6Ed8f307</td><td className="p-3 font-sans">Escrow with spending limits</td></tr>
                  </tbody>
                </table>
              </div>
            </SubSection>

            <SubSection title="How agents sign transactions">
              <p className="text-muted-foreground leading-relaxed">
                The API does not handle signing. Agents sign transactions with their own wallet
                and submit them directly to Base Sepolia. The workflow:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>Call <Code>POST /api/evaluate</Code> to evaluate a request and get hashes</li>
                <li>Use the returned <Code>policyHash</Code>, <Code>requestHash</Code>, <Code>resultHash</Code> to call the AuditLog contract's <Code>logDecision()</Code> function</li>
                <li>Sign and broadcast the transaction with your own wallet</li>
                <li>Later, call <Code>POST /api/verify</Code> to confirm the decision exists on-chain</li>
              </ol>
            </SubSection>
          </Section>

          {/* For Agents */}
          <Section id="agents" title="For Agents">
            <p className="text-muted-foreground leading-relaxed">
              Delegate is designed for both human and agent interaction. Agents can discover
              and use the platform through the skill file or the HTTP API.
            </p>

            <SubSection title="Skill file">
              <p className="text-muted-foreground leading-relaxed">
                The skill file contains everything an agent needs to operate autonomously:
                API endpoints, SDK reference, contract addresses, type definitions, and
                complete code examples.
              </p>
              <CodeBlock title="terminal">{`curl -s ${process.env.NEXT_PUBLIC_URL || "https://your-domain.vercel.app"}/skill.md`}</CodeBlock>
              <p className="text-muted-foreground leading-relaxed">
                Pass this command to any AI agent and it can read the skill file, understand
                the platform, and start interacting immediately.
              </p>
            </SubSection>

            <SubSection title="Agent workflow (HTTP only, no SDK needed)">
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>Read <Code>/skill.md</Code> to learn the API</li>
                <li>Define a policy (JSON object with rules)</li>
                <li>Call <Code>POST /api/evaluate</Code> to test requests against the policy</li>
                <li>Call <Code>POST /api/hash</Code> to get deterministic hashes</li>
                <li>For on-chain operations, interact with contracts directly using returned hashes</li>
                <li>Call <Code>POST /api/verify</Code> to confirm decisions exist on-chain</li>
                <li>Call <Code>GET /api/agent/:address</Code> to look up other agents</li>
              </ol>
            </SubSection>

            <SubSection title="Agent workflow (with SDK)">
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>Install <Code>@delegate/sdk</Code></li>
                <li>Create a delegate instance with chain config</li>
                <li>Full access to all operations: evaluate, attest, verify, register, agree, spend</li>
                <li>See the <a href="#sdk" className="underline hover:text-foreground">SDK section</a> for details</li>
              </ol>
            </SubSection>
          </Section>
        </main>
      </div>
    </div>
  );
}
