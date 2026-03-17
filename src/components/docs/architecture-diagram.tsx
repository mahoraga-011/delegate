"use client";

import { motion } from "framer-motion";

function Node({
  x,
  y,
  width,
  height,
  label,
  sublabel,
  delay,
  variant = "default",
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  sublabel?: string;
  delay: number;
  variant?: "default" | "primary" | "accent";
}) {
  const fills = {
    default: { bg: "var(--color-card)", border: "var(--color-border)", text: "var(--color-foreground)" },
    primary: { bg: "var(--color-foreground)", border: "var(--color-foreground)", text: "var(--color-background)" },
    accent: { bg: "var(--color-muted)", border: "var(--color-border)", text: "var(--color-foreground)" },
  };
  const f = fills[variant];

  return (
    <motion.g
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={8}
        fill={f.bg}
        stroke={f.border}
        strokeWidth={1.5}
      />
      <text
        x={x + width / 2}
        y={y + (sublabel ? height / 2 - 6 : height / 2 + 1)}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={f.text}
        fontSize={13}
        fontWeight={600}
        fontFamily="var(--font-sans)"
      >
        {label}
      </text>
      {sublabel && (
        <text
          x={x + width / 2}
          y={y + height / 2 + 12}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="var(--color-muted-foreground)"
          fontSize={10}
          fontFamily="var(--font-sans)"
        >
          {sublabel}
        </text>
      )}
    </motion.g>
  );
}

function AnimatedArrow({
  x1,
  y1,
  x2,
  y2,
  delay,
  label,
  labelOffset = 0,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  delay: number;
  label?: string;
  labelOffset?: number;
}) {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay }}
    >
      <motion.line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="var(--color-border)"
        strokeWidth={1.5}
        strokeDasharray="6 3"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, delay }}
      />
      {/* Arrow head */}
      <motion.circle
        cx={x2}
        cy={y2}
        r={3}
        fill="var(--color-foreground)"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: delay + 0.6 }}
      />
      {/* Flowing dot */}
      <motion.circle
        cx={x1}
        cy={y1}
        r={2.5}
        fill="var(--color-foreground)"
        animate={{
          cx: [x1, x2],
          cy: [y1, y2],
          opacity: [1, 0],
        }}
        transition={{
          duration: 2,
          delay: delay + 1,
          repeat: Infinity,
          repeatDelay: 1,
          ease: "easeInOut",
        }}
      />
      {label && (
        <text
          x={midX + labelOffset}
          y={midY - 8}
          textAnchor="middle"
          fill="var(--color-muted-foreground)"
          fontSize={9}
          fontFamily="var(--font-sans)"
          fontWeight={500}
        >
          {label}
        </text>
      )}
    </motion.g>
  );
}

function PulsingDot({ cx, cy, delay }: { cx: number; cy: number; delay: number }) {
  return (
    <motion.circle
      cx={cx}
      cy={cy}
      r={4}
      fill="var(--color-foreground)"
      initial={{ scale: 0 }}
      animate={{ scale: [1, 1.5, 1] }}
      transition={{ duration: 2, delay, repeat: Infinity }}
      opacity={0.3}
    />
  );
}

export function ArchitectureDiagram() {
  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox="0 0 760 420"
        className="w-full max-w-3xl mx-auto"
        style={{ minWidth: 600 }}
      >
        {/* Background grid */}
        <defs>
          <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="var(--color-border)" strokeWidth={0.3} opacity={0.4} />
          </pattern>
        </defs>
        <rect width="760" height="420" fill="var(--color-background)" rx={12} />
        <rect width="760" height="420" fill="url(#grid)" rx={12} />

        {/* Layer labels */}
        <motion.text
          x={20} y={30}
          fill="var(--color-muted-foreground)"
          fontSize={10}
          fontWeight={600}
          fontFamily="var(--font-sans)"
          letterSpacing={2}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 0.2 }}
        >
          AGENTS
        </motion.text>
        <motion.text
          x={20} y={175}
          fill="var(--color-muted-foreground)"
          fontSize={10}
          fontWeight={600}
          fontFamily="var(--font-sans)"
          letterSpacing={2}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 0.4 }}
        >
          DELEGATE
        </motion.text>
        <motion.text
          x={20} y={335}
          fill="var(--color-muted-foreground)"
          fontSize={10}
          fontWeight={600}
          fontFamily="var(--font-sans)"
          letterSpacing={2}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 0.6 }}
        >
          ON-CHAIN
        </motion.text>

        {/* Divider lines */}
        <motion.line
          x1={15} y1={150} x2={745} y2={150}
          stroke="var(--color-border)"
          strokeWidth={1}
          strokeDasharray="4 4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ delay: 0.3 }}
        />
        <motion.line
          x1={15} y1={310} x2={745} y2={310}
          stroke="var(--color-border)"
          strokeWidth={1}
          strokeDasharray="4 4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ delay: 0.5 }}
        />

        {/* Agent nodes */}
        <Node x={80} y={50} width={140} height={70} label="Agent A" sublabel="HTTP or SDK" delay={0.3} variant="accent" />
        <Node x={300} y={50} width={140} height={70} label="Agent B" sublabel="HTTP or SDK" delay={0.4} variant="accent" />
        <Node x={540} y={50} width={140} height={70} label="Dashboard" sublabel="Human UI" delay={0.5} variant="accent" />

        {/* Delegate layer */}
        <Node x={60} y={190} width={160} height={70} label="API" sublabel="evaluate / hash / verify" delay={0.6} />
        <Node x={290} y={190} width={160} height={70} label="Policy Engine" sublabel="deterministic rules" delay={0.7} variant="primary" />
        <Node x={520} y={190} width={180} height={70} label="SDK" sublabel="attest / register / agree" delay={0.8} />

        {/* On-chain nodes */}
        <Node x={40} y={345} width={110} height={55} label="Registry" sublabel="policies" delay={0.9} />
        <Node x={170} y={345} width={110} height={55} label="AuditLog" sublabel="decisions" delay={1.0} />
        <Node x={300} y={345} width={110} height={55} label="Verifier" sublabel="proofs" delay={1.1} />
        <Node x={430} y={345} width={110} height={55} label="AgentReg" sublabel="identity" delay={1.2} />
        <Node x={560} y={345} width={130} height={55} label="Vault" sublabel="escrow + limits" delay={1.3} />

        {/* Arrows: Agents to Delegate */}
        <AnimatedArrow x1={150} y1={120} x2={140} y2={190} delay={1.4} label="HTTP" />
        <AnimatedArrow x1={370} y1={120} x2={370} y2={190} delay={1.5} label="evaluate" />
        <AnimatedArrow x1={610} y1={120} x2={610} y2={190} delay={1.6} label="SDK" />

        {/* Arrows: API to Engine */}
        <AnimatedArrow x1={220} y1={225} x2={290} y2={225} delay={1.7} />

        {/* Arrows: Delegate to On-Chain */}
        <AnimatedArrow x1={140} y1={260} x2={95} y2={345} delay={1.8} label="read" labelOffset={-15} />
        <AnimatedArrow x1={370} y1={260} x2={355} y2={345} delay={1.9} label="verify" />
        <AnimatedArrow x1={610} y1={260} x2={485} y2={345} delay={2.0} label="write" />
        <AnimatedArrow x1={610} y1={260} x2={625} y2={345} delay={2.1} label="spend" labelOffset={15} />

        {/* Pulsing dots on active components */}
        <PulsingDot cx={370} cy={225} delay={2.5} />
      </svg>
    </div>
  );
}
