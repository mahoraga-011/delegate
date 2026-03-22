import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS, FONTS } from "../styles";

function DiagramNode({
  x, y, width, height, label, sublabel, delay, variant = "default",
}: {
  x: number; y: number; width: number; height: number;
  label: string; sublabel?: string; delay: number;
  variant?: "default" | "primary" | "accent";
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 20 } });
  const opacity = interpolate(frame, [delay, delay + 15], [0, 1], { extrapolateRight: "clamp" });
  const offsetY = (1 - progress) * 10;

  const fills = {
    default: { bg: COLORS.card, border: COLORS.border, text: COLORS.fg },
    primary: { bg: COLORS.fg, border: COLORS.fg, text: COLORS.bg },
    accent: { bg: COLORS.secondary, border: COLORS.border, text: COLORS.fg },
  };
  const f = fills[variant];

  return (
    <g opacity={opacity} transform={`translate(0, ${offsetY})`}>
      <rect x={x} y={y} width={width} height={height} rx={8} fill={f.bg} stroke={f.border} strokeWidth={1.5} />
      <text x={x + width / 2} y={y + (sublabel ? height / 2 - 6 : height / 2 + 1)} textAnchor="middle" dominantBaseline="middle" fill={f.text} fontSize={13} fontWeight={600} fontFamily={FONTS.sans}>
        {label}
      </text>
      {sublabel && (
        <text x={x + width / 2} y={y + height / 2 + 12} textAnchor="middle" dominantBaseline="middle" fill={COLORS.mutedFg} fontSize={10} fontFamily={FONTS.sans}>
          {sublabel}
        </text>
      )}
    </g>
  );
}

function DiagramArrow({
  x1, y1, x2, y2, delay, label, labelOffset = 0,
}: {
  x1: number; y1: number; x2: number; y2: number;
  delay: number; label?: string; labelOffset?: number;
}) {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [delay, delay + 12], [0, 1], { extrapolateRight: "clamp" });
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  const dotCycle = ((frame - delay) % 60) / 60;
  const dotX = x1 + (x2 - x1) * dotCycle;
  const dotY = y1 + (y2 - y1) * dotCycle;
  const dotOpacity = frame > delay + 20 ? interpolate(dotCycle, [0, 0.8, 1], [1, 1, 0]) : 0;

  return (
    <g opacity={opacity}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={COLORS.border} strokeWidth={1.5} strokeDasharray="6 3" />
      <circle cx={x2} cy={y2} r={3} fill={COLORS.fg} />
      <circle cx={dotX} cy={dotY} r={2.5} fill={COLORS.fg} opacity={dotOpacity} />
      {label && (
        <text x={midX + labelOffset} y={midY - 8} textAnchor="middle" fill={COLORS.mutedFg} fontSize={9} fontFamily={FONTS.sans} fontWeight={500}>
          {label}
        </text>
      )}
    </g>
  );
}

export const ArchitectureDiagram: React.FC = () => {
  const frame = useCurrentFrame();

  const titleOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const titleY = interpolate(frame, [0, 20], [20, 0], { extrapolateRight: "clamp" });

  const labelOpacity = (delay: number) =>
    interpolate(frame, [delay, delay + 10], [0, 0.5], { extrapolateRight: "clamp" });
  const dividerOpacity = (delay: number) =>
    interpolate(frame, [delay, delay + 10], [0, 0.3], { extrapolateRight: "clamp" });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: COLORS.bg,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: 80,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 40 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            fontFamily: FONTS.sans,
            color: COLORS.mutedFg,
            letterSpacing: 3,
            textTransform: "uppercase",
            opacity: titleOpacity,
            marginBottom: 12,
          }}
        >
          ARCHITECTURE
        </div>
        <div
          style={{
            fontSize: 42,
            fontWeight: 700,
            fontFamily: FONTS.sans,
            color: COLORS.fg,
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
          }}
        >
          Three layers. Full stack.
        </div>
      </div>

      <div
        style={{
          borderRadius: 16,
          border: `1px solid ${COLORS.border}`,
          overflow: "hidden",
          backgroundColor: COLORS.card,
        }}
      >
        <svg viewBox="0 0 760 420" width={1200} height={660}>
          <defs>
            <pattern id="archgrid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke={COLORS.border} strokeWidth={0.3} opacity={0.5} />
            </pattern>
          </defs>
          <rect width="760" height="420" fill={COLORS.bg} rx={0} />
          <rect width="760" height="420" fill="url(#archgrid)" rx={0} />

          <text x={20} y={30} fill={COLORS.mutedFg} fontSize={10} fontWeight={600} fontFamily={FONTS.sans} letterSpacing={2} opacity={labelOpacity(6)}>AGENTS</text>
          <text x={20} y={175} fill={COLORS.mutedFg} fontSize={10} fontWeight={600} fontFamily={FONTS.sans} letterSpacing={2} opacity={labelOpacity(12)}>DELEGATE</text>
          <text x={20} y={335} fill={COLORS.mutedFg} fontSize={10} fontWeight={600} fontFamily={FONTS.sans} letterSpacing={2} opacity={labelOpacity(18)}>ON-CHAIN</text>

          <line x1={15} y1={150} x2={745} y2={150} stroke={COLORS.border} strokeWidth={1} strokeDasharray="4 4" opacity={dividerOpacity(9)} />
          <line x1={15} y1={310} x2={745} y2={310} stroke={COLORS.border} strokeWidth={1} strokeDasharray="4 4" opacity={dividerOpacity(15)} />

          <DiagramNode x={80} y={50} width={140} height={70} label="Agent A" sublabel="HTTP or SDK" delay={9} variant="accent" />
          <DiagramNode x={300} y={50} width={140} height={70} label="Agent B" sublabel="HTTP or SDK" delay={12} variant="accent" />
          <DiagramNode x={540} y={50} width={140} height={70} label="Dashboard" sublabel="Human UI" delay={15} variant="accent" />

          <DiagramNode x={60} y={190} width={160} height={70} label="API" sublabel="evaluate / hash / verify" delay={18} />
          <DiagramNode x={290} y={190} width={160} height={70} label="Policy Engine" sublabel="deterministic rules" delay={21} variant="primary" />
          <DiagramNode x={520} y={190} width={180} height={70} label="SDK" sublabel="attest / register / agree" delay={24} />

          <DiagramNode x={40} y={345} width={110} height={55} label="Registry" sublabel="policies" delay={27} />
          <DiagramNode x={170} y={345} width={110} height={55} label="AuditLog" sublabel="decisions" delay={30} />
          <DiagramNode x={300} y={345} width={110} height={55} label="Verifier" sublabel="proofs" delay={33} />
          <DiagramNode x={430} y={345} width={110} height={55} label="AgentReg" sublabel="identity" delay={36} />
          <DiagramNode x={560} y={345} width={130} height={55} label="Vault" sublabel="escrow + limits" delay={39} />

          <DiagramArrow x1={150} y1={120} x2={140} y2={190} delay={42} label="HTTP" />
          <DiagramArrow x1={370} y1={120} x2={370} y2={190} delay={45} label="evaluate" />
          <DiagramArrow x1={610} y1={120} x2={610} y2={190} delay={48} label="SDK" />
          <DiagramArrow x1={220} y1={225} x2={290} y2={225} delay={51} />
          <DiagramArrow x1={140} y1={260} x2={95} y2={345} delay={54} label="read" labelOffset={-15} />
          <DiagramArrow x1={370} y1={260} x2={355} y2={345} delay={57} label="verify" />
          <DiagramArrow x1={610} y1={260} x2={485} y2={345} delay={60} label="write" />
          <DiagramArrow x1={610} y1={260} x2={625} y2={345} delay={63} label="spend" labelOffset={15} />
        </svg>
      </div>
    </div>
  );
};
