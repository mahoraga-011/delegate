import { useCurrentFrame, interpolate } from "remotion";
import { COLORS, FONTS } from "../styles";
import { TerminalBlock } from "../components/Terminal";
import { TERMINAL_STEPS } from "../data/terminal-steps";

export const TerminalDemo: React.FC = () => {
  const frame = useCurrentFrame();

  const introOpacity = interpolate(frame, [0, 15, 40, 55], [0, 1, 1, 0], {
    extrapolateRight: "clamp",
  });
  const introY = interpolate(frame, [0, 15], [20, 0], { extrapolateRight: "clamp" });

  const terminalOpacity = interpolate(frame, [50, 70], [0, 1], { extrapolateRight: "clamp" });
  const terminalScale = interpolate(frame, [50, 70], [0.97, 1], { extrapolateRight: "clamp" });

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
        position: "relative",
      }}
    >
      {/* Intro text overlay */}
      {frame < 60 && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 10,
            opacity: introOpacity,
            transform: `translateY(${introY}px)`,
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              fontFamily: FONTS.sans,
              color: COLORS.mutedFg,
              letterSpacing: 3,
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            LIVE DEMO
          </div>
          <div
            style={{
              fontSize: 48,
              fontWeight: 700,
              fontFamily: FONTS.sans,
              color: COLORS.fg,
              marginBottom: 16,
            }}
          >
            Two agents. Full workflow.
          </div>
          <div
            style={{
              fontSize: 22,
              fontFamily: FONTS.sans,
              color: COLORS.mutedFg,
            }}
          >
            Alice & Bob operate autonomously under shared policy.
          </div>
        </div>
      )}

      {/* Terminal — stays dark for readability */}
      <div
        style={{
          opacity: terminalOpacity,
          transform: `scale(${terminalScale})`,
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
        }}
      >
        <TerminalBlock steps={TERMINAL_STEPS} startFrame={60} />
      </div>
    </div>
  );
};
