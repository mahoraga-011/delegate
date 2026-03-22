import { useCurrentFrame, interpolate } from "remotion";
import { COLORS, FONTS } from "../styles";
import { FLOW_STEPS, NODES, cx, top, curvePath, type NodeId } from "../data/flow-steps";

const FRAMES_PER_STEP = 55;

export const FlowDiagram: React.FC = () => {
  const frame = useCurrentFrame();

  const titleOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const titleY = interpolate(frame, [0, 20], [20, 0], { extrapolateRight: "clamp" });

  const diagramFrame = Math.max(0, frame - 30);
  const stepIndex = Math.min(
    Math.floor(diagramFrame / FRAMES_PER_STEP),
    FLOW_STEPS.length - 1
  );
  const current = FLOW_STEPS[stepIndex];
  const stepLocalFrame = diagramFrame - stepIndex * FRAMES_PER_STEP;

  const isActive = (id: NodeId) => current.active.includes(id);
  const infoOpacity = interpolate(stepLocalFrame, [0, 10], [0, 1], { extrapolateRight: "clamp" });

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
        padding: 60,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 30 }}>
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
          WORKFLOW
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
          Step-by-Step Flow
        </div>
      </div>

      <div style={{ display: "flex", gap: 36, alignItems: "flex-start", width: 1600 }}>
        {/* SVG diagram */}
        <div
          style={{
            flex: 1,
            backgroundColor: COLORS.card,
            borderRadius: 16,
            border: `1px solid ${COLORS.border}`,
            overflow: "hidden",
          }}
        >
          <svg viewBox="0 0 750 350" width={1050} height={490}>
            <defs>
              <pattern id="flowgrid2" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke={COLORS.border} strokeWidth={0.3} opacity={0.5} />
              </pattern>
            </defs>
            <rect width="750" height="350" fill={COLORS.bg} />
            <rect width="750" height="350" fill="url(#flowgrid2)" />

            {/* Arrows */}
            {current.arrows.map((arrow, i) => {
              const path = curvePath(arrow.from, arrow.to);
              const arrowOpacity = interpolate(stepLocalFrame, [5, 15], [0, 0.4], { extrapolateRight: "clamp" });
              return (
                <g key={`arrow-${stepIndex}-${i}`} opacity={arrowOpacity}>
                  <path d={path} fill="none" stroke={COLORS.fg} strokeWidth={2} strokeDasharray="6 4" />
                </g>
              );
            })}

            {/* Nodes */}
            {(Object.entries(NODES) as [NodeId, (typeof NODES)[NodeId]][]).map(([id, n]) => {
              const active = isActive(id);
              return (
                <g key={id}>
                  {active && (
                    <rect
                      x={n.x - 4}
                      y={n.y - 4}
                      width={n.w + 8}
                      height={n.h + 8}
                      rx={12}
                      fill="none"
                      stroke={COLORS.fg}
                      strokeWidth={2}
                      opacity={0.2 + 0.15 * Math.sin(stepLocalFrame * 0.15)}
                    />
                  )}
                  <rect
                    x={n.x}
                    y={n.y}
                    width={n.w}
                    height={n.h}
                    rx={8}
                    fill={active ? COLORS.fg : COLORS.secondary}
                    stroke={COLORS.border}
                    strokeWidth={1.5}
                    opacity={active ? 1 : 0.6}
                  />
                  <text
                    x={n.x + n.w / 2}
                    y={n.y + n.h / 2 - 7}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={active ? COLORS.bg : COLORS.fg}
                    fontSize={13}
                    fontWeight={700}
                    fontFamily={FONTS.sans}
                    opacity={active ? 1 : 0.6}
                  >
                    {n.label}
                  </text>
                  <text
                    x={n.x + n.w / 2}
                    y={n.y + n.h / 2 + 10}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={active ? COLORS.ring : COLORS.mutedFg}
                    fontSize={10}
                    fontWeight={500}
                    fontFamily={FONTS.sans}
                    opacity={active ? 0.8 : 0.3}
                  >
                    {n.sub}
                  </text>
                </g>
              );
            })}

            {/* Result badge */}
            {current.result && (() => {
              const targetId = current.arrows.length > 0 ? current.arrows[0].to : "engine";
              const badgeX = cx(targetId);
              const badgeY = top(targetId) - 32;
              const badgeScale = interpolate(stepLocalFrame, [10, 20], [0.5, 1], { extrapolateRight: "clamp" });
              const badgeOpacity = interpolate(stepLocalFrame, [10, 18], [0, 1], { extrapolateRight: "clamp" });

              return (
                <g opacity={badgeOpacity} transform={`translate(${badgeX}, ${badgeY + 13}) scale(${badgeScale}) translate(${-badgeX}, ${-badgeY - 13})`}>
                  <rect x={badgeX - 35} y={badgeY} width={70} height={26} rx={13} fill={current.result === "allow" ? COLORS.green : COLORS.red} />
                  <text x={badgeX} y={badgeY + 13} textAnchor="middle" dominantBaseline="middle" fill={COLORS.white} fontSize={11} fontWeight={700} fontFamily={FONTS.sans} letterSpacing={1.5}>
                    {current.result.toUpperCase()}
                  </text>
                </g>
              );
            })()}
          </svg>
        </div>

        {/* Info panel */}
        <div
          style={{
            width: 480,
            backgroundColor: COLORS.card,
            borderRadius: 16,
            border: `1px solid ${COLORS.border}`,
            padding: 36,
            opacity: infoOpacity,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: COLORS.fg,
                color: COLORS.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                fontWeight: 700,
                fontFamily: FONTS.sans,
              }}
            >
              {current.id}
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, fontFamily: FONTS.sans, color: COLORS.fg }}>
              {current.title}
            </div>
          </div>

          <div style={{ fontSize: 17, fontFamily: FONTS.sans, color: COLORS.mutedFg, lineHeight: 1.6, marginBottom: 20 }}>
            {current.desc}
          </div>

          <div
            style={{
              fontFamily: FONTS.mono,
              fontSize: 14,
              color: COLORS.fg,
              backgroundColor: COLORS.secondary,
              borderRadius: 8,
              padding: "12px 16px",
              lineHeight: 1.5,
            }}
          >
            {current.detail}
          </div>

          {/* Step dots */}
          <div style={{ display: "flex", gap: 6, marginTop: 24, justifyContent: "center" }}>
            {FLOW_STEPS.map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === stepIndex ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: i === stepIndex ? COLORS.fg : COLORS.border,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
