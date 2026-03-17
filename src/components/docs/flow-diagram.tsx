"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    id: 1,
    title: "Define Policy",
    desc: "Agent A creates a set of deterministic rules.",
    active: ["agentA", "policy"],
    arrow: { from: "agentA", to: "policy" },
    detail: 'risk <= 4, tool = "transfer", amount <= 0.1 ETH',
  },
  {
    id: 2,
    title: "Register On-Chain",
    desc: "Policy hash gets stored on the blockchain. Immutable once registered.",
    active: ["policy", "registry"],
    arrow: { from: "policy", to: "registry" },
    detail: "keccak256(policy) → 0x3a4f...b2c1",
  },
  {
    id: 3,
    title: "Agent B Discovers",
    desc: "Agent B looks up the policy hash on-chain and verifies the rules.",
    active: ["agentB", "registry"],
    arrow: { from: "registry", to: "agentB" },
    detail: "getPolicy(hash) → verified rules match",
  },
  {
    id: 4,
    title: "Form Agreement",
    desc: "Both agents sign a bilateral agreement under the shared policy.",
    active: ["agentA", "agentB", "agreement"],
    arrow: { from: "agentA", to: "agreement" },
    arrow2: { from: "agentB", to: "agreement" },
    detail: "Neither party can change the rules after signing",
  },
  {
    id: 5,
    title: "Agent Makes Request",
    desc: "Agent A wants to transfer 0.05 ETH. The request goes to the policy engine.",
    active: ["agentA", "engine"],
    arrow: { from: "agentA", to: "engine" },
    detail: '{ tool: "transfer", amount: 0.05, risk: 2 }',
  },
  {
    id: 6,
    title: "Engine Evaluates",
    desc: "Every rule checked. All pass = ALLOW. Any fail = DENY. Deterministic.",
    active: ["engine"],
    result: "allow",
    detail: "risk 2 <= 4 ✓  |  tool = transfer ✓  |  amount 0.05 <= 0.1 ✓",
  },
  {
    id: 7,
    title: "Attest On-Chain",
    desc: "Decision hashes logged on the blockchain. Permanent, tamper-evident receipt.",
    active: ["engine", "auditlog"],
    arrow: { from: "engine", to: "auditlog" },
    detail: "logDecision(policyHash, requestHash, resultHash)",
  },
  {
    id: 8,
    title: "Vault Enforces Spending",
    desc: "Payment routed through the vault. Contract enforces per-tx and daily limits.",
    active: ["agentA", "vault"],
    arrow: { from: "agentA", to: "vault" },
    result: "allow",
    detail: "0.05 ETH <= 0.1 max/tx ✓  |  0.05 <= 0.5 max/day ✓",
  },
  {
    id: 9,
    title: "Overspend Denied",
    desc: "Agent tries 5 ETH. Vault rejects it on-chain. Agent never held the funds.",
    active: ["agentA", "vault"],
    arrow: { from: "agentA", to: "vault" },
    result: "deny",
    detail: "5 ETH > 0.1 max/tx ✗  DENIED by contract",
  },
  {
    id: 10,
    title: "Anyone Can Verify",
    desc: "Any agent re-evaluates the same request, computes hashes, checks on-chain. Match = authentic.",
    active: ["agentB", "verifier"],
    arrow: { from: "agentB", to: "verifier" },
    detail: "Tamper one field → hashes don't match → NOT FOUND",
  },
];

type NodeId = "agentA" | "agentB" | "policy" | "engine" | "registry" | "auditlog" | "verifier" | "agreement" | "vault";

const NODES: Record<NodeId, { x: number; y: number; w: number; h: number; label: string; sub: string }> = {
  agentA:    { x: 40,  y: 20,  w: 130, h: 56, label: "Agent A",       sub: "creates + operates" },
  agentB:    { x: 290, y: 20,  w: 130, h: 56, label: "Agent B",       sub: "discovers + verifies" },
  policy:    { x: 500, y: 20,  w: 130, h: 56, label: "Policy",        sub: "deterministic rules" },
  engine:    { x: 250, y: 140, w: 160, h: 56, label: "Policy Engine",  sub: "evaluate request" },
  registry:  { x: 30,  y: 270, w: 120, h: 50, label: "Registry",      sub: "policy hashes" },
  auditlog:  { x: 170, y: 270, w: 120, h: 50, label: "AuditLog",      sub: "decisions" },
  verifier:  { x: 310, y: 270, w: 120, h: 50, label: "Verifier",      sub: "proofs" },
  agreement: { x: 450, y: 270, w: 120, h: 50, label: "Agreement",     sub: "bilateral" },
  vault:     { x: 590, y: 270, w: 120, h: 50, label: "Vault",         sub: "escrow" },
};

function center(id: NodeId): { x: number; y: number } {
  const n = NODES[id];
  return { x: n.x + n.w / 2, y: n.y + n.h / 2 };
}

export function FlowDiagram() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const current = STEPS[step];

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));
  const reset = () => { setStep(0); setPlaying(false); };

  const startAutoPlay = () => {
    setPlaying(true);
    setStep(0);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      if (i >= STEPS.length) {
        clearInterval(interval);
        setPlaying(false);
        return;
      }
      setStep(i);
    }, 3000);
  };

  const isActive = (id: NodeId) => current.active.includes(id);

  return (
    <div className="space-y-4">
      {/* Diagram */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <svg viewBox="0 0 740 340" className="w-full" style={{ minWidth: 500 }}>
          <defs>
            <pattern id="flowgrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--color-border)" strokeWidth={0.2} opacity={0.5} />
            </pattern>
          </defs>
          <rect width="740" height="340" fill="var(--color-card)" />
          <rect width="740" height="340" fill="url(#flowgrid)" />

          {/* Nodes */}
          {(Object.entries(NODES) as [NodeId, typeof NODES[NodeId]][]).map(([id, n]) => {
            const active = isActive(id);
            return (
              <g key={id}>
                {/* Glow */}
                {active && (
                  <motion.rect
                    x={n.x - 3}
                    y={n.y - 3}
                    width={n.w + 6}
                    height={n.h + 6}
                    rx={10}
                    fill="none"
                    stroke="var(--color-foreground)"
                    strokeWidth={2}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
                <rect
                  x={n.x}
                  y={n.y}
                  width={n.w}
                  height={n.h}
                  rx={8}
                  fill={active ? "var(--color-foreground)" : "var(--color-background)"}
                  stroke="var(--color-border)"
                  strokeWidth={1}
                  opacity={active ? 1 : 0.5}
                />
                <text
                  x={n.x + n.w / 2}
                  y={n.y + n.h / 2 - 6}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={active ? "var(--color-background)" : "var(--color-foreground)"}
                  fontSize={12}
                  fontWeight={600}
                  fontFamily="var(--font-sans)"
                  opacity={active ? 1 : 0.5}
                >
                  {n.label}
                </text>
                <text
                  x={n.x + n.w / 2}
                  y={n.y + n.h / 2 + 10}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="var(--color-muted-foreground)"
                  fontSize={9}
                  fontFamily="var(--font-sans)"
                  opacity={active ? 0.8 : 0.3}
                >
                  {n.sub}
                </text>
              </g>
            );
          })}

          {/* Arrow */}
          {current.arrow && (
            <motion.g key={`arrow-${step}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <line
                x1={center(current.arrow.from as NodeId).x}
                y1={center(current.arrow.from as NodeId).y}
                x2={center(current.arrow.to as NodeId).x}
                y2={center(current.arrow.to as NodeId).y}
                stroke="var(--color-foreground)"
                strokeWidth={1.5}
                strokeDasharray="5 3"
                opacity={0.6}
              />
              <motion.circle
                r={4}
                fill="var(--color-foreground)"
                animate={{
                  cx: [center(current.arrow.from as NodeId).x, center(current.arrow.to as NodeId).x],
                  cy: [center(current.arrow.from as NodeId).y, center(current.arrow.to as NodeId).y],
                }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.g>
          )}

          {/* Second arrow (for agreement step) */}
          {"arrow2" in current && current.arrow2 && (
            <motion.g key={`arrow2-${step}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.2 }}>
              <line
                x1={center((current.arrow2 as {from: string; to: string}).from as NodeId).x}
                y1={center((current.arrow2 as {from: string; to: string}).from as NodeId).y}
                x2={center((current.arrow2 as {from: string; to: string}).to as NodeId).x}
                y2={center((current.arrow2 as {from: string; to: string}).to as NodeId).y}
                stroke="var(--color-foreground)"
                strokeWidth={1.5}
                strokeDasharray="5 3"
                opacity={0.6}
              />
              <motion.circle
                r={4}
                fill="var(--color-foreground)"
                animate={{
                  cx: [center((current.arrow2 as {from: string; to: string}).from as NodeId).x, center((current.arrow2 as {from: string; to: string}).to as NodeId).x],
                  cy: [center((current.arrow2 as {from: string; to: string}).from as NodeId).y, center((current.arrow2 as {from: string; to: string}).to as NodeId).y],
                }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              />
            </motion.g>
          )}

          {/* Result badge */}
          {current.result && (
            <motion.g
              key={`result-${step}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <rect
                x={330}
                y={148}
                width={60}
                height={24}
                rx={12}
                fill={current.result === "allow" ? "#22c55e" : "#ef4444"}
              />
              <text
                x={360}
                y={161}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize={10}
                fontWeight={700}
                fontFamily="var(--font-sans)"
                letterSpacing={1}
              >
                {current.result.toUpperCase()}
              </text>
            </motion.g>
          )}
        </svg>
      </div>

      {/* Step info */}
      <div className="rounded-lg border p-5 bg-card">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-background text-xs font-bold">
                {current.id}
              </span>
              <h4 className="font-semibold">{current.title}</h4>
            </div>
            <p className="text-sm text-muted-foreground">{current.desc}</p>
            <p className="mt-2 font-mono text-xs text-muted-foreground bg-muted/50 rounded px-3 py-2">
              {current.detail}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={prev} disabled={step === 0 || playing}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground tabular-nums w-16 text-center">
            {step + 1} / {STEPS.length}
          </span>
          <Button variant="outline" size="sm" onClick={next} disabled={step === STEPS.length - 1 || playing}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={reset} disabled={step === 0}>
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            Reset
          </Button>
          <Button size="sm" onClick={startAutoPlay} disabled={playing}>
            <Play className="h-3.5 w-3.5 mr-1" />
            {playing ? "Playing..." : "Auto-play"}
          </Button>
        </div>
      </div>
    </div>
  );
}
