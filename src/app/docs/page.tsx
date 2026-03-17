"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArchitectureDiagram } from "@/components/docs/architecture-diagram";

function Code({ children }: { children: string }) {
  return (
    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{children}</code>
  );
}

function CodeBlock({ children, title }: { children: string; title?: string }) {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {title && (
        <div className="border-b px-4 py-2 text-xs font-medium text-muted-foreground bg-muted/30">{title}</div>
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

function Sub({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">{title}</h3>
      {children}
    </div>
  );
}

const NAV = [
  { id: "overview", label: "Overview" },
  { id: "architecture", label: "Architecture" },
  { id: "quickstart", label: "Quick Start" },
  { id: "api", label: "API Reference" },
  { id: "policies", label: "Policies" },
  { id: "sdk", label: "SDK" },
  { id: "onchain", label: "On-Chain" },
  { id: "agents", label: "For Agents" },
];

function Sidebar({ activeSection }: { activeSection: string }) {
  return (
    <aside className="hidden lg:block w-52 shrink-0">
      <div className="sticky top-20">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-3">On this page</p>
        <nav className="space-y-0.5 border-l">
          {NAV.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`block pl-4 py-1.5 text-sm transition-colors border-l-2 -ml-px ${
                activeSection === item.id
                  ? "border-foreground text-foreground font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
              }`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </aside>
  );
}

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );

    for (const item of NAV) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://your-domain.vercel.app";

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <nav className="mx-auto flex h-14 max-w-6xl items-center px-6">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Delegate<span className="text-muted-foreground">.</span>
          </Link>
          <span className="ml-3 rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">Docs</span>
          <div className="ml-auto flex items-center gap-3">
            <ThemeToggle />
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
          </div>
        </nav>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10 flex gap-10">
        <Sidebar activeSection={activeSection} />

        {/* Content */}
        <main className="flex-1 min-w-0 space-y-16">

          {/* Overview */}
          <Section id="overview" title="Overview">
            <p className="text-muted-foreground leading-relaxed">
              Delegate is a deterministic policy engine for AI agents with on-chain verification.
              Define rules that constrain what agents can do, evaluate requests against
              those rules, and verify every decision on-chain.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              No AI in the evaluation loop. No ambiguity. Same input, same output, every time.
            </p>
            <div className="grid gap-4 sm:grid-cols-3 mt-6">
              {[
                { title: "API", desc: "HTTP endpoints for evaluation, hashing, and reads. No keys needed." },
                { title: "SDK", desc: "TypeScript package for full access including on-chain writes." },
                { title: "Contracts", desc: "6 smart contracts on Base Sepolia for immutable records." },
              ].map((item) => (
                <div key={item.title} className="rounded-lg border p-4">
                  <p className="font-semibold text-sm">{item.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* Architecture */}
          <Section id="architecture" title="Architecture">
            <p className="text-muted-foreground leading-relaxed">
              Three layers. Agents interact via HTTP API or SDK. The policy engine evaluates
              deterministically. Smart contracts store immutable on-chain records.
            </p>
            <div className="mt-6">
              <ArchitectureDiagram />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 mt-6">
              <div className="rounded-lg border p-4 space-y-2">
                <p className="font-semibold text-sm">Read path (API)</p>
                <p className="text-xs text-muted-foreground">
                  Agent sends HTTP request to the API. The API evaluates the policy locally,
                  returns the result with hashes. Can also verify decisions and look up agents
                  or agreements on-chain. No private keys involved.
                </p>
              </div>
              <div className="rounded-lg border p-4 space-y-2">
                <p className="font-semibold text-sm">Write path (Agent wallet)</p>
                <p className="text-xs text-muted-foreground">
                  Agent signs transactions with their own wallet and submits directly to
                  the smart contracts on Base Sepolia. Register policies, attest decisions,
                  register identity, sign agreements, manage vault spending.
                </p>
              </div>
            </div>
          </Section>

          {/* Quick Start */}
          <Section id="quickstart" title="Quick Start">
            <Sub title="Evaluate a request (no setup needed)">
              <CodeBlock title="curl">{`curl -X POST ${baseUrl}/api/evaluate \\
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
              <CodeBlock title="Response">{`{
  "outcome": "allow",
  "checks": [
    {"ruleId": "r1", "label": "Amount cap", "passed": true, "summary": "amount lte 0.1"},
    {"ruleId": "r2", "label": "Transfer only", "passed": true, "summary": "tool equals transfer"}
  ],
  "scorecard": {"passed": 2, "failed": 0},
  "policyHash": "0x...",
  "requestHash": "0x...",
  "resultHash": "0x..."
}`}</CodeBlock>
            </Sub>

            <Sub title="For agents">
              <p className="text-muted-foreground leading-relaxed">
                Agents can read the full reference in one command:
              </p>
              <CodeBlock title="terminal">{`curl -s ${baseUrl}/skill.md`}</CodeBlock>
            </Sub>
          </Section>

          {/* API Reference */}
          <Section id="api" title="API Reference">
            <p className="text-muted-foreground leading-relaxed">
              All endpoints are read-only. No authentication. No private keys.
              For on-chain writes, agents interact with smart contracts directly using their own wallet.
            </p>

            <Sub title="POST /api/evaluate">
              <p className="text-muted-foreground text-sm">Evaluate a request against a policy. Pure computation, no chain interaction.</p>
              <CodeBlock title="Request">{`{
  "policy": {
    "id": "string",
    "name": "string",
    "description": "string",
    "defaultEffect": "allow" | "deny",
    "rules": [{
      "id": "string",
      "label": "string",
      "field": "string",       // any field name
      "operator": "equals" | "notEquals" | "includes" | "notIncludes" | "lte" | "gte",
      "value": "string | number",
      "rationale": "string"
    }]
  },
  "request": {
    "actionType": "string",
    "tool": "string",
    "risk": 0-10,
    "target": "string",
    "justification": "string"
    // + any custom fields
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
            </Sub>

            <Sub title="POST /api/hash">
              <p className="text-muted-foreground text-sm">Hash any object using canonical JSON + keccak256.</p>
              <CodeBlock title="Request / Response">{`// Request
{ "data": { ...any object } }

// Response
{ "hash": "0x..." }`}</CodeBlock>
            </Sub>

            <Sub title="POST /api/verify">
              <p className="text-muted-foreground text-sm">Check if a decision was attested on-chain. Re-evaluates locally and queries the Verifier contract.</p>
              <CodeBlock title="Request / Response">{`// Request
{ "policy": Policy, "request": AgentActionRequest }

// Response
{ "verified": boolean, "outcome": "allow"|"deny", "policyHash", "requestHash", "resultHash" }`}</CodeBlock>
            </Sub>

            <Sub title="GET /api/agent/:address">
              <p className="text-muted-foreground text-sm">Look up an agent's identity and committed policies.</p>
              <CodeBlock title="Response">{`{ "agentId": "0x...", "metadataURI": "ipfs://...", "policyHashes": ["0x..."], "registered": true }`}</CodeBlock>
            </Sub>

            <Sub title="GET /api/agreement/:id">
              <p className="text-muted-foreground text-sm">Look up a bilateral agreement.</p>
              <CodeBlock title="Response">{`{ "policyHash": "0x...", "partyA": "0x...", "partyB": "0x...", "signedByA": true, "signedByB": true, "finalized": true }`}</CodeBlock>
            </Sub>
          </Section>

          {/* Policies */}
          <Section id="policies" title="Policies">
            <p className="text-muted-foreground leading-relaxed">
              A policy is a set of deterministic rules. Each rule checks a field on the
              agent's request against a value using an operator. All rules must pass for ALLOW.
              Any failure results in DENY.
            </p>

            <Sub title="Rule fields">
              <p className="text-muted-foreground text-sm">
                Rules can use any field name. Built-in fields include <Code>actionType</Code>,{" "}
                <Code>tool</Code>, <Code>risk</Code>, <Code>target</Code>, <Code>amount</Code>.
                You can add domain-specific fields like <Code>department</Code>,{" "}
                <Code>dataType</Code>, <Code>environment</Code>, <Code>approvalLevel</Code>,{" "}
                <Code>encryptionEnabled</Code>, or anything else.
              </p>
            </Sub>

            <Sub title="Operators">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border">
                  <thead><tr className="border-b bg-muted/30">
                    <th className="text-left p-3 font-medium">Operator</th>
                    <th className="text-left p-3 font-medium">Type</th>
                    <th className="text-left p-3 font-medium">Example</th>
                  </tr></thead>
                  <tbody className="text-muted-foreground font-mono text-xs">
                    <tr className="border-b"><td className="p-3">equals</td><td className="p-3 font-sans">string/number</td><td className="p-3">tool equals "transfer"</td></tr>
                    <tr className="border-b"><td className="p-3">notEquals</td><td className="p-3 font-sans">string/number</td><td className="p-3">target notEquals "prod"</td></tr>
                    <tr className="border-b"><td className="p-3">includes</td><td className="p-3 font-sans">string (pipe-separated)</td><td className="p-3">actionType includes "read|query"</td></tr>
                    <tr className="border-b"><td className="p-3">notIncludes</td><td className="p-3 font-sans">string (pipe-separated)</td><td className="p-3">target notIncludes "delete|drop"</td></tr>
                    <tr className="border-b"><td className="p-3">lte</td><td className="p-3 font-sans">number</td><td className="p-3">risk lte 4</td></tr>
                    <tr><td className="p-3">gte</td><td className="p-3 font-sans">number</td><td className="p-3">amount gte 0.01</td></tr>
                  </tbody>
                </table>
              </div>
            </Sub>

            <Sub title="Custom fields example">
              <CodeBlock title="Compliance policy">{`{
  "rules": [
    {"field": "dataType", "operator": "notEquals", "value": "pii", ...},
    {"field": "environment", "operator": "equals", "value": "staging", ...},
    {"field": "encryptionEnabled", "operator": "equals", "value": "true", ...},
    {"field": "department", "operator": "includes", "value": "engineering|security", ...}
  ]
}

// Matching request
{
  "actionType": "read", "tool": "database", "risk": 3,
  "target": "user-records", "justification": "Generate report",
  "dataType": "aggregate", "environment": "staging",
  "encryptionEnabled": "true", "department": "engineering"
}`}</CodeBlock>
            </Sub>
          </Section>

          {/* SDK */}
          <Section id="sdk" title="SDK">
            <p className="text-muted-foreground leading-relaxed">
              For agents with a Node.js runtime, the SDK provides full access including on-chain writes.
            </p>
            <CodeBlock title="Install">{`npm install @delegate/sdk`}</CodeBlock>
            <CodeBlock title="Usage">{`import { createDelegate } from "@delegate/sdk";

const delegate = createDelegate({
  policies: [myPolicy],
  chain: {
    rpc: "https://base-sepolia.g.alchemy.com/v2/YOUR_KEY",
    privateKey: "0xYOUR_KEY",
    chainId: 84532,
    contracts: { registry: "0x3a45...", auditLog: "0x23b7...", ... }
  }
});

// Evaluate (same as API)
const result = delegate.evaluate(policy, request);

// Write operations (SDK only, requires private key)
await delegate.registerPolicy(policy);
await delegate.attest(policy, request, result);
await delegate.registerAgent(agentId, "ipfs://metadata");
await delegate.proposeAgreement(policyHash, counterpartyAddress);`}</CodeBlock>

            <Sub title="API vs SDK">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border">
                  <thead><tr className="border-b bg-muted/30">
                    <th className="text-left p-3 font-medium">Operation</th>
                    <th className="text-left p-3 font-medium">API</th>
                    <th className="text-left p-3 font-medium">SDK</th>
                  </tr></thead>
                  <tbody className="text-muted-foreground text-xs">
                    <tr className="border-b"><td className="p-3">Evaluate, Hash, Verify</td><td className="p-3">Yes</td><td className="p-3">Yes</td></tr>
                    <tr className="border-b"><td className="p-3">Lookup agent/agreement</td><td className="p-3">Yes</td><td className="p-3">Yes</td></tr>
                    <tr className="border-b"><td className="p-3">Register, Attest, Agree</td><td className="p-3">No (use contracts)</td><td className="p-3">Yes</td></tr>
                    <tr><td className="p-3">Vault spending</td><td className="p-3">No (use contracts)</td><td className="p-3">Yes</td></tr>
                  </tbody>
                </table>
              </div>
            </Sub>
          </Section>

          {/* On-Chain */}
          <Section id="onchain" title="On-Chain">
            <p className="text-muted-foreground leading-relaxed">
              6 contracts deployed on Base Sepolia (chain ID 84532). The API handles reads.
              For writes, agents sign transactions with their own wallet and submit directly.
            </p>

            <Sub title="Contracts">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border">
                  <thead><tr className="border-b bg-muted/30">
                    <th className="text-left p-3 font-medium">Contract</th>
                    <th className="text-left p-3 font-medium font-mono text-xs">Address</th>
                    <th className="text-left p-3 font-medium">Purpose</th>
                  </tr></thead>
                  <tbody className="text-muted-foreground text-xs">
                    <tr className="border-b"><td className="p-3">PolicyRegistry</td><td className="p-3 font-mono">0x3a45bC84fa4a460FD65a4CfE1B96edA45bD88E15</td><td className="p-3">Register policy hashes</td></tr>
                    <tr className="border-b"><td className="p-3">AuditLog</td><td className="p-3 font-mono">0x23b75deDDcB048BBe3db741eD05E309F901fb688</td><td className="p-3">Log decisions</td></tr>
                    <tr className="border-b"><td className="p-3">Verifier</td><td className="p-3 font-mono">0xa20Db185523EF7061EA4B002664d3695f9804c6A</td><td className="p-3">Verify decisions</td></tr>
                    <tr className="border-b"><td className="p-3">AgentRegistry</td><td className="p-3 font-mono">0xf78B0b7E32d2C693F6015eDfD55171b1D7732985</td><td className="p-3">Agent identity</td></tr>
                    <tr className="border-b"><td className="p-3">Agreement</td><td className="p-3 font-mono">0x2a8Bfa499F68000b3502aab4268C6e765b838601</td><td className="p-3">Bilateral agreements</td></tr>
                    <tr><td className="p-3">Vault</td><td className="p-3 font-mono">0x5242d8517b60c56F91AdF6FB8a015dFB6Ed8f307</td><td className="p-3">Escrow + spending limits</td></tr>
                  </tbody>
                </table>
              </div>
            </Sub>

            <Sub title="Write workflow">
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Call <Code>POST /api/evaluate</Code> to evaluate and get hashes</li>
                <li>Use <Code>policyHash</Code> + <Code>requestHash</Code> + <Code>resultHash</Code> from the response</li>
                <li>Call AuditLog's <Code>logDecision(policyHash, requestHash, resultHash, allowed)</Code> with your wallet</li>
                <li>Later, call <Code>POST /api/verify</Code> to confirm it exists on-chain</li>
              </ol>
            </Sub>
          </Section>

          {/* For Agents */}
          <Section id="agents" title="For Agents">
            <p className="text-muted-foreground leading-relaxed">
              Delegate is designed for both human and agent interaction. Agents discover
              the platform through the skill file or HTTP API.
            </p>

            <Sub title="Skill file">
              <p className="text-muted-foreground text-sm leading-relaxed">
                The skill file contains the full reference: API endpoints, SDK usage,
                contract addresses, type definitions, and code examples. Pass this
                command to any AI agent:
              </p>
              <CodeBlock title="terminal">{`curl -s ${baseUrl}/skill.md`}</CodeBlock>
            </Sub>

            <Sub title="Agent workflow (HTTP only)">
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Read <Code>/skill.md</Code> to learn the API</li>
                <li>Define a policy as a JSON object with rules</li>
                <li>Call <Code>POST /api/evaluate</Code> to test requests against the policy</li>
                <li>Call <Code>POST /api/hash</Code> to get deterministic hashes for any object</li>
                <li>For on-chain writes, interact with contracts using the returned hashes and your own wallet</li>
                <li>Call <Code>POST /api/verify</Code> to confirm decisions exist on-chain</li>
                <li>Call <Code>GET /api/agent/:address</Code> to look up other agents</li>
              </ol>
            </Sub>
          </Section>
        </main>
      </div>
    </div>
  );
}
