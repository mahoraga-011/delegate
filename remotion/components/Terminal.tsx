import { useCurrentFrame, interpolate } from "remotion";
import { COLORS, FONTS } from "../styles";
import type { TerminalStep, TerminalLine, LineColor } from "../data/terminal-steps";

const COLOR_MAP: Record<LineColor, string> = {
  fg: COLORS.terminalFg,
  dim: COLORS.terminalDim,
  green: COLORS.terminalGreen,
  red: COLORS.terminalRed,
  cyan: COLORS.terminalCyan,
  yellow: COLORS.terminalYellow,
  magenta: COLORS.terminalMagenta,
  white: "#ffffff",
};

const AGENT_COLORS: Record<string, { bg: string; fg: string; label: string }> = {
  alice:  { bg: "#7c3aed", fg: "#ffffff", label: "Alice" },
  bob:    { bg: "#0891b2", fg: "#ffffff", label: "Bob" },
  both:   { bg: "#525252", fg: "#ffffff", label: "Both" },
  system: { bg: "#374151", fg: "#ffffff", label: "System" },
};

const TerminalLineComponent: React.FC<{
  line: TerminalLine;
  visible: boolean;
  revealProgress: number;
}> = ({ line, visible, revealProgress }) => {
  if (!visible) return null;
  if (line.text === "") return <div style={{ height: 6 }} />;

  const opacity = interpolate(revealProgress, [0, 0.3], [0, 1], { extrapolateRight: "clamp" });
  const indent = (line.indent || 0) * 16;
  const color = COLOR_MAP[line.color];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        paddingLeft: indent,
        opacity,
        fontFamily: FONTS.mono,
        fontSize: 14,
        lineHeight: 1.65,
        color,
        fontWeight: line.bold ? 700 : 400,
      }}
    >
      {line.icon === "check" && <span style={{ color: COLORS.terminalGreen }}>✓</span>}
      {line.icon === "cross" && <span style={{ color: COLORS.terminalRed }}>✗</span>}
      {line.badge && (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: line.badge === "allow" ? COLORS.terminalGreen : COLORS.terminalRed,
            color: "#000000",
            fontWeight: 700,
            padding: "1px 8px",
            borderRadius: 3,
            fontSize: 12,
            letterSpacing: 1,
            marginRight: 4,
          }}
        >
          {line.badge === "allow" ? "ALLOW" : "DENY "}
        </span>
      )}
      <span>{line.text}</span>
    </div>
  );
};

const AgentIndicator: React.FC<{
  agent: string;
  active: boolean;
  side: "left" | "right";
}> = ({ agent, active, side }) => {
  const info = AGENT_COLORS[agent] || AGENT_COLORS.system;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 14px",
        borderRadius: 8,
        backgroundColor: active ? info.bg : "#252525",
        opacity: active ? 1 : 0.4,
        transition: "all 0.2s",
      }}
    >
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: active ? "#4ade80" : "#525252",
          boxShadow: active ? "0 0 6px #4ade80" : "none",
        }}
      />
      <span
        style={{
          fontFamily: FONTS.mono,
          fontSize: 13,
          fontWeight: 600,
          color: active ? info.fg : COLORS.terminalDim,
        }}
      >
        {info.label}
      </span>
    </div>
  );
};

export const TerminalBlock: React.FC<{
  steps: TerminalStep[];
  startFrame?: number;
}> = ({ steps, startFrame = 0 }) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;

  // Find current active step
  let accumulatedFrames = 0;
  let activeStepIndex = 0;
  for (let i = 0; i < steps.length; i++) {
    if (localFrame >= accumulatedFrames) activeStepIndex = i;
    accumulatedFrames += steps[i].duration;
  }
  const activeAgent = steps[activeStepIndex]?.agent || "system";

  // Calculate visible content for auto-scroll
  let totalVisibleLines = 0;
  accumulatedFrames = 0;
  const visibleSteps: { step: TerminalStep; stepStartFrame: number }[] = [];

  for (const step of steps) {
    visibleSteps.push({ step, stepStartFrame: accumulatedFrames });
    accumulatedFrames += step.duration;
  }

  for (const { step, stepStartFrame } of visibleSteps) {
    if (localFrame < stepStartFrame) break;
    totalVisibleLines += 2;
    const stepProgress = localFrame - stepStartFrame;
    const framesPerLine = step.duration / (step.lines.length + 1.5);
    for (let i = 0; i < step.lines.length; i++) {
      if (stepProgress > (i + 1.5) * framesPerLine) {
        totalVisibleLines++;
      }
    }
    totalVisibleLines += 1;
  }

  const lineHeight = 24;
  const visibleArea = 730;
  const totalHeight = totalVisibleLines * lineHeight;
  const scrollY = Math.max(0, totalHeight - visibleArea + 30);

  const aliceActive = activeAgent === "alice" || activeAgent === "both";
  const bobActive = activeAgent === "bob" || activeAgent === "both";

  return (
    <div
      style={{
        width: 1720,
        height: 920,
        display: "flex",
        flexDirection: "column",
        gap: 0,
        borderRadius: 16,
        overflow: "hidden",
        border: `1px solid #333`,
        backgroundColor: COLORS.terminalBg,
      }}
    >
      {/* Top bar with agent indicators */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 20px",
          backgroundColor: "#161b22",
          borderBottom: "1px solid #333",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: "#f85149" }} />
          <div style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: "#d29922" }} />
          <div style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: "#3fb950" }} />
          <span style={{ marginLeft: 12, fontFamily: FONTS.mono, fontSize: 12, color: COLORS.terminalDim }}>
            delegate-demo
          </span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <AgentIndicator agent="alice" active={aliceActive} side="left" />
          <AgentIndicator agent="bob" active={bobActive} side="right" />
        </div>
      </div>

      {/* Terminal content */}
      <div style={{ flex: 1, padding: "16px 28px", overflow: "hidden", position: "relative" }}>
        <div style={{ transform: `translateY(${-scrollY}px)` }}>
          {visibleSteps.map(({ step, stepStartFrame }, stepIndex) => {
            if (localFrame < stepStartFrame) return null;

            const stepProgress = localFrame - stepStartFrame;
            const headerOpacity = interpolate(stepProgress, [0, 6], [0, 1], { extrapolateRight: "clamp" });
            const framesPerLine = step.duration / (step.lines.length + 1.5);
            const agentInfo = AGENT_COLORS[step.agent];

            return (
              <div key={stepIndex} style={{ marginBottom: 12 }}>
                {/* Step header with agent tag */}
                <div style={{ opacity: headerOpacity, display: "flex", alignItems: "center", gap: 10, marginBottom: 3 }}>
                  <span
                    style={{
                      fontFamily: FONTS.mono,
                      fontSize: 11,
                      fontWeight: 700,
                      color: agentInfo.fg,
                      backgroundColor: agentInfo.bg,
                      padding: "1px 8px",
                      borderRadius: 4,
                      letterSpacing: 0.5,
                    }}
                  >
                    {step.stepNumber}
                  </span>
                  <span style={{ fontFamily: FONTS.mono, fontSize: 14, fontWeight: 700, color: "#ffffff" }}>
                    {step.title}
                  </span>
                </div>

                {/* Lines */}
                {step.lines.map((line, lineIndex) => {
                  const lineFrame = (lineIndex + 1.5) * framesPerLine;
                  const lineVisible = stepProgress > lineFrame;
                  const lineProgress = lineVisible
                    ? interpolate(stepProgress - lineFrame, [0, framesPerLine * 0.5], [0, 1], { extrapolateRight: "clamp" })
                    : 0;

                  return (
                    <TerminalLineComponent
                      key={lineIndex}
                      line={line}
                      visible={lineVisible}
                      revealProgress={lineProgress}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
