"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="min-h-screen flex items-center py-24 border-t">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to delegate?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Define policies, enforce them deterministically, verify everything on-chain.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/dashboard">
              <Button size="lg">Launch Dashboard</Button>
            </Link>
            <a href="/skill.md" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="lg">skill.md</Button>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
