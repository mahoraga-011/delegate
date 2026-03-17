"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function LandingHero() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Policy checks before agents act.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            Deterministic policy enforcement for AI agents, verified on-chain.
            Define rules, evaluate requests, and prove every decision with
            tamper-evident on-chain receipts.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-10 flex gap-4"
        >
          <Link href="/dashboard">
            <Button size="lg">Launch App</Button>
          </Link>
          <Link href="/docs">
            <Button variant="outline" size="lg">Read the docs</Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
