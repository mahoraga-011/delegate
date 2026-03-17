"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy, Terminal } from "lucide-react";

export function AgentBlock() {
  const [copied, setCopied] = useState(false);
  const command = "curl -s https://delegate.dev/skill.md";

  const handleCopy = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-20">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-xl border bg-card p-8 sm:p-12"
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Terminal className="h-4 w-4" />
            <span className="font-medium uppercase tracking-widest text-xs">Built for agents</span>
          </div>

          <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
            One command. Full autonomy.
          </h2>

          <p className="mt-4 max-w-lg text-muted-foreground">
            Agents read <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">skill.md</code> to
            learn the API, parse contract addresses, and start operating autonomously.
            No registration. No API keys. Just read and go.
          </p>

          {/* Command block */}
          <div className="mt-8 flex items-center gap-3 rounded-lg border bg-background p-4">
            <code className="flex-1 font-mono text-sm sm:text-base text-foreground">
              <span className="text-muted-foreground">$ </span>{command}
            </code>
            <button
              onClick={handleCopy}
              className="shrink-0 rounded-md border p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Copy command"
            >
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            skill.md contains the full SDK reference, contract addresses, type definitions, and code examples.
            Everything an agent needs to create policies, register identity, form agreements, and manage spending.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
