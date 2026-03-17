"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    id: 1,
    title: "Define Policy",
    desc: "Agent A creates a set of deterministic rules.",
    active: ["agentA", "policy"],
    arrows: [{ from: "agentA", to: "policy" }],
    detail: 'risk <= 4, tool = "transfer", amount <= 0.1 ETH',
  },
  {
    id: 2,
    title: "Register On-Chain",
    desc: "Policy hash gets stored on the blockchain. Immutable once registered.",
    active: ["policy", "registry"],
    arrows: [{ from: "policy", to: "registry" }],
    detail: "keccak256(policy) → 0x3a4f...b2c1",
  },
  {
    id: 3,
    title: "Agent B Discovers",
    desc: "Agent B looks up the policy hash on-chain and verifies the rules.",
    active: ["agentB", "registry"],
    arrows: [{ from: "registry", to: "agentB" }],
    detail: "getPolicy(hash) → verified rules match",
  },
  {
    id: 4,
    title: "Form Agreement",
    desc: "Both agents sign a bilateral agreement under the shared policy.",
    active: ["agentA", "agentB", "agreement"],
    arrows: [{ from: "agentA", to: "agreement" }, { from: "agentB", to: "agreement" }],
    detail: "Neither party can change the rules after signing",
  },
  {
    id: 5,
    title: "Agent Makes Request",
    desc: "Agent A wants to transfer 0.05 ETH. The request goes to the policy engine.",
    active: ["agentA", "engine"],
    arrows: [{ from: "agentA", to: "engine" }],
    detail: '{ tool: "transfer", amount: 0.05, risk: 2 }',
  },
  {
    id: 6,
    title: "Engine Evaluates",
    desc: "Every rule checked. All pass = ALLOW. Any fail = DENY. Deterministic.",
    active: ["engine"],
    arrows: [],
    result: "allow",
    detail: "risk 2 <= 4 ✓  |  tool = transfer ✓  |  amount 0.05 <= 0.1 ✓",
  },
  {
    id: 7,
    title: "Attest On-Chain",
    desc: "Decision hashes logged on the blockchain. Permanent, tamper-evident receipt.",
    active: ["engine", "auditlog"],
    arrows: [{ from: "engine", to: "auditlog" }],
    detail: "logDecision(policyHash, requestHash, resultHash)",
  },
  {
    id: 8,
    title: "Vault Enforces Spending",
    desc: "Payment routed through the vault. Contract enforces per-tx and daily limits.",
    active: ["agentA", "vault"],
    arrows: [{ from: "agentA", to: "vault" }],
    result: "allow",
    detail: "0.05 ETH <= 0.1 max/tx ✓  |  0.05 <= 0.5 max/day ✓",
  },
  {
    id: 9,
    title: "Overspend Denied",
    desc: "Agent tries 5 ETH. Vault rejects it on-chain. Agent never held the funds.",
    active: ["agentA", "vault"],
    arrows: [{ from: "agentA", to: "vault" }],
    result: "deny",
    detail: "5 ETH > 0.1 max/tx ✗  DENIED by contract",
  },
  {
    id: 10,
    title: "Anyone Can Verify",
    desc: "Any agent re-evaluates the same request, computes hashes, checks on-chain. Match = authentic.",
    active: ["agentB", "verifier"],
    arrows: [{ from: "agentB", to: "verifier" }],
    detail: "Tamper one field → hashes don't match → NOT FOUND",
  },
];

type NodeId = "agentA" | "agentB" | "policy" | "engine" | "registry" | "auditlog" | "verifier" | "agreement" | "vault";

// Layout: spread out to avoid line overlaps
// Row 1: Agent A (left), Policy (center), Agent B (right)
// Row 2: Engine (center-left)
// Row 3: Registry, AuditLog, Verifier, Agreement, Vault
const NODES: Record<NodeId, { x: number; y: number; w: number; h: number; label: string; sub: string }> = {
  agentA:    { x: 30,  y: 20,  w: 140, h: 56, label: "Agent A",       sub: "creates + operates" },
  policy:    { x: 300, y: 20,  w: 140, h: 56, label: "Policy",        sub: "deterministic rules" },
  agentB:    { x: 570, y: 20,  w: 140, h: 56, label: "Agent B",       sub: "discovers + verifies" },
  engine:    { x: 30,  y: 145, w: 170, h: 56, label: "Policy Engine",  sub: "evaluate request" },
  registry:  { x: 30,  y: 275, w: 120, h: 50, label: "Registry",      sub: "policy hashes" },
  auditlog:  { x: 170, y: 275, w: 120, h: 50, label: "AuditLog",      sub: "decisions" },
  verifier:  { x: 310, y: 275, w: 120, h: 50, label: "Verifier",      sub: "proofs" },
  agreement: { x: 450, y: 275, w: 130, h: 50, label: "Agreement",     sub: "bilateral" },
  vault:     { x: 600, y: 275, w: 120, h: 50, label: "Vault",         sub: "escrow" },
};

function cx(id: NodeId) { return NODES[id].x + NODES[id].w / 2; }
function cy(id: NodeId) { return NODES[id].y + NODES[id].h / 2; }
function bottom(id: NodeId) { return NODES[id].y + NODES[id].h; }
function top(id: NodeId) { return NODES[id].y; }
function right(id: NodeId) { return NODES[id].x + NODES[id].w; }
function left(id: NodeId) { return NODES[id].x; }

// Generate a curved path that avoids going through other nodes
function curvePath(fromId: NodeId, toId: NodeId): string {
  const fx = cx(fromId), fy = cy(fromId);
  const tx = cx(toId), ty = cy(toId);

  // Same row: use a slight curve
  if (Math.abs(fy - ty) < 30) {
    const midY = fy - 30;
    return `M ${fx} ${fy} Q ${(fx + tx) / 2} ${midY} ${tx} ${ty}`;
  }

  // Top to bottom: curve outward to avoid center nodes
  const midX = (fx + tx) / 2;
  const midY = (fy + ty) / 2;

  // If going from far left to far right (or vice versa), arc wider
  if (Math.abs(fx - tx) > 300) {
    const arcX = fx < tx ? midX + 40 : midX - 40;
    return `M ${fx} ${bottom(fromId)} C ${fx} ${midY}, ${arcX} ${midY}, ${tx} ${top(toId)}`;
  }

  // Default: gentle S-curve
  return `M ${fx} ${bottom(fromId)} C ${fx} ${midY}, ${tx} ${midY}, ${tx} ${top(toId)}`;
}

export function FlowDiagram() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [hasAutoPlayed, setHasAutoPlayed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const current = STEPS[step];

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));
  const reset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setStep(0);
    setPlaying(false);
  };

  const startAutoPlay = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setPlaying(true);
    setStep(0);
    let i = 0;
    intervalRef.current = setInterval(() => {
      i++;
      if (i >= STEPS.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        setPlaying(false);
        return;
      }
      setStep(i);
    }, 3000);
  }, []);

  // Auto-play when diagram scrolls into view
  useEffect(() => {
    if (hasAutoPlayed) return;
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAutoPlayed(true);
          startAutoPlay();
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasAutoPlayed, startAutoPlay]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const isActive = (id: NodeId) => current.active.includes(id);

  return (
    <div ref={containerRef} className="space-y-4">
      <div className="rounded-xl border bg-card overflow-hidden">
        <svg viewBox="0 0 750 350" className="w-full" style={{ minWidth: 500 }}>
          <defs>
            <pattern id="flowgrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--color-border)" strokeWidth={0.3} opacity={0.4} />
            </pattern>
          </defs>
          <rect width="750" height="350" fill="var(--color-card)" />
          <rect width="750" height="350" fill="url(#flowgrid)" />

          {/* Arrows (behind nodes) */}
          {current.arrows.map((arrow, i) => {
            const path = curvePath(arrow.from as NodeId, arrow.to as NodeId);
            return (
              <motion.g key={`arrow-${step}-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: i * 0.15 }}>
                <motion.path
                  d={path}
                  fill="none"
                  stroke="var(--color-foreground)"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  opacity={0.5}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8, delay: i * 0.15 }}
                />
                <motion.circle
                  r={5}
                  fill="var(--color-foreground)"
                  opacity={0.9}
                >
                  <animateMotion
                    dur="2s"
                    repeatCount="indefinite"
                    path={path}
                    begin={`${i * 0.3}s`}
                  />
                </motion.circle>
              </motion.g>
            );
          })}

          {/* Nodes */}
          {(Object.entries(NODES) as [NodeId, typeof NODES[NodeId]][]).map(([id, n]) => {
            const active = isActive(id);
            return (
              <g key={id}>
                {active && (
                  <motion.rect
                    x={n.x - 4}
                    y={n.y - 4}
                    width={n.w + 8}
                    height={n.h + 8}
                    rx={12}
                    fill="none"
                    stroke="var(--color-foreground)"
                    strokeWidth={2}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.2, 0.6, 0.2] }}
                    transition={{ duration: 2, repeat: Infinity }}
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
                  strokeWidth={1.5}
                  opacity={active ? 1 : 0.6}
                />
                <text
                  x={n.x + n.w / 2}
                  y={n.y + n.h / 2 - 7}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={active ? "var(--color-background)" : "var(--color-foreground)"}
                  fontSize={13}
                  fontWeight={700}
                  fontFamily="var(--font-sans)"
                  opacity={active ? 1 : 0.7}
                >
                  {n.label}
                </text>
                <text
                  x={n.x + n.w / 2}
                  y={n.y + n.h / 2 + 10}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={active ? "var(--color-muted-foreground)" : "var(--color-muted-foreground)"}
                  fontSize={10}
                  fontWeight={500}
                  fontFamily="var(--font-sans)"
                  opacity={active ? 0.9 : 0.4}
                >
                  {n.sub}
                </text>
              </g>
            );
          })}

          {/* Result badge */}
          {current.result && (() => {
            const targetId = current.arrows.length > 0 ? current.arrows[0].to as NodeId : "engine";
            const badgeX = cx(targetId);
            const badgeY = top(targetId) - 32;
            return (
              <motion.g
                key={`result-${step}`}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
              >
                <rect
                  x={badgeX - 35}
                  y={badgeY}
                  width={70}
                  height={26}
                  rx={13}
                  fill={current.result === "allow" ? "#22c55e" : "#ef4444"}
                />
                <text
                  x={badgeX}
                  y={badgeY + 13}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize={11}
                  fontWeight={700}
                  fontFamily="var(--font-sans)"
                  letterSpacing={1.5}
                >
                  {current.result.toUpperCase()}
                </text>
              </motion.g>
            );
          })()}
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
            <p className="mt-2 font-mono text-xs text-foreground/80 bg-muted rounded px-3 py-2">
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
