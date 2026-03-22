"use client";

import { motion } from "framer-motion";

export function ForAgents() {
  return (
    <section id="for-agents" className="min-h-screen flex items-center py-20 border-t scroll-mt-20">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">For Agents</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Agent-readable platform overview
          </h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            The following section is structured for AI agents to parse and understand.
            For the full SDK reference, read <a href="/skill.md" className="underline hover:text-foreground">skill.md</a>.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-10 rounded-xl border bg-card p-8 space-y-6 font-mono text-sm leading-relaxed"
        >
          <div>
            <h3 className="font-semibold text-base font-sans">What is Delegate?</h3>
            <p className="mt-2 text-muted-foreground">
              Delegate is a deterministic policy engine for AI agents with on-chain verification
              on Base Sepolia (chain ID 84532). It provides an SDK and smart contracts that let
              agents define rules, evaluate action requests, log decisions on-chain, register
              identity, form bilateral agreements, and manage spending through an escrow vault.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-base font-sans">How agents use Delegate</h3>
            <ol className="mt-2 space-y-1 text-muted-foreground list-decimal list-inside">
              <li>Read skill.md to learn the SDK API and contract addresses</li>
              <li>Install the SDK: npm install delegate-sdk</li>
              <li>Create a policy (a set of deterministic rules)</li>
              <li>Register the policy hash on-chain</li>
              <li>Register agent identity on-chain</li>
              <li>Commit to policies so other agents can verify your commitments</li>
              <li>Propose and sign bilateral agreements under shared policies</li>
              <li>Evaluate action requests against policies (all pass = allow, any fail = deny)</li>
              <li>Attest decisions on-chain for tamper-evident verification</li>
              <li>Use the vault for policy-scoped spending with per-tx and daily limits</li>
            </ol>
          </div>

          <div>
            <h3 className="font-semibold text-base font-sans">Contract addresses (Base Sepolia)</h3>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-xs text-muted-foreground">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-4 font-medium text-foreground">Contract</th>
                    <th className="text-left py-2 font-medium text-foreground">Address</th>
                  </tr>
                </thead>
                <tbody className="font-mono">
                  <tr className="border-b"><td className="py-2 pr-4">PolicyRegistry</td><td>0x3a45bC84fa4a460FD65a4CfE1B96edA45bD88E15</td></tr>
                  <tr className="border-b"><td className="py-2 pr-4">AuditLog</td><td>0x23b75deDDcB048BBe3db741eD05E309F901fb688</td></tr>
                  <tr className="border-b"><td className="py-2 pr-4">Verifier</td><td>0xa20Db185523EF7061EA4B002664d3695f9804c6A</td></tr>
                  <tr className="border-b"><td className="py-2 pr-4">AgentRegistry</td><td>0xf78B0b7E32d2C693F6015eDfD55171b1D7732985</td></tr>
                  <tr className="border-b"><td className="py-2 pr-4">Agreement</td><td>0x2a8Bfa499F68000b3502aab4268C6e765b838601</td></tr>
                  <tr><td className="py-2 pr-4">Vault</td><td>0x5242d8517b60c56F91AdF6FB8a015dFB6Ed8f307</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-base font-sans">Quick start for agents</h3>
            <p className="mt-2 text-muted-foreground">
              Run <code className="rounded bg-muted px-1 py-0.5 text-foreground">curl -s https://delegate.dev/skill.md</code> to
              get the full SDK reference with 15 documented actions, code examples, type definitions,
              and a complete multi-agent workflow example. The skill file is self-contained.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
