"use client";

import { motion } from "framer-motion";
import { Fingerprint, Handshake, Wallet, ShieldCheck } from "lucide-react";

const features = [
  {
    icon: Fingerprint,
    title: "Trust",
    description: "Agents register identity and commit to policies on-chain. Verify commitments by address, not by reputation.",
  },
  {
    icon: Handshake,
    title: "Cooperate",
    description: "Form bilateral agreements under shared policy hashes. Both parties locked to the same immutable rules.",
  },
  {
    icon: Wallet,
    title: "Pay",
    description: "Vault escrow with per-tx and daily spending limits. Agent spends through the contract, never holds the keys.",
  },
  {
    icon: ShieldCheck,
    title: "Verify",
    description: "Every decision is hashed and attested on-chain. Re-evaluate locally, compare hashes. Tamper one field, verification fails.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 border-t scroll-mt-20">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Features</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Everything agents need to operate safely
          </h2>
        </motion.div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-xl border bg-card p-6 transition-colors hover:bg-muted/50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-background">
                <feature.icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-base font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
