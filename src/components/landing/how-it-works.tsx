"use client";

import { motion } from "framer-motion";
import { FileText, Shield, LinkIcon } from "lucide-react";

const steps = [
  {
    icon: FileText,
    title: "Define",
    description: "Create deterministic policy rules. Risk limits, tool restrictions, target allowlists. Plain logic, no AI.",
  },
  {
    icon: Shield,
    title: "Enforce",
    description: "Agent requests are evaluated against your rules automatically. All pass = allow. Any fail = deny. Same input, same output, every time.",
  },
  {
    icon: LinkIcon,
    title: "Verify",
    description: "Every decision is hashed and logged on-chain. Anyone can re-evaluate and verify. Change one field, verification fails.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 border-t">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">How it works</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Three steps. No ambiguity.</h2>
        </motion.div>

        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="space-y-4"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-card">
                <step.icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
