import { useCurrentFrame, interpolate } from "remotion";
import { COLORS, FONTS } from "../styles";

const PROBLEMS = [
  { text: "AI agents make autonomous decisions" },
  { text: "They transfer funds, access data, execute tools" },
  { text: "Who enforces the rules?" },
  { text: "How do you verify what happened?" },
];

export const ProblemStatement: React.FC = () => {
  const frame = useCurrentFrame();

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const titleY = interpolate(frame, [0, 25], [30, 0], { extrapolateRight: "clamp" });

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
        padding: 100,
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
          opacity: titleOpacity,
          marginBottom: 20,
        }}
      >
        THE PROBLEM
      </div>

      <div
        style={{
          fontSize: 58,
          fontWeight: 700,
          fontFamily: FONTS.sans,
          color: COLORS.fg,
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          textAlign: "center",
          marginBottom: 60,
          lineHeight: 1.2,
          maxWidth: 900,
        }}
      >
        Agents act. But who checks?
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 800 }}>
        {PROBLEMS.map((item, i) => {
          const itemDelay = 40 + i * 35;
          const itemOpacity = interpolate(frame, [itemDelay, itemDelay + 20], [0, 1], {
            extrapolateRight: "clamp",
          });
          const itemX = interpolate(frame, [itemDelay, itemDelay + 20], [30, 0], {
            extrapolateRight: "clamp",
          });
          const isQuestion = i >= 2;

          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                opacity: itemOpacity,
                transform: `translateX(${itemX}px)`,
                paddingLeft: 24,
                borderLeft: `3px solid ${isQuestion ? COLORS.fg : COLORS.border}`,
              }}
            >
              <span
                style={{
                  fontSize: isQuestion ? 28 : 24,
                  fontFamily: FONTS.sans,
                  color: isQuestion ? COLORS.fg : COLORS.mutedFg,
                  fontWeight: isQuestion ? 700 : 400,
                }}
              >
                {item.text}
              </span>
            </div>
          );
        })}
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 80,
          opacity: interpolate(frame, [200, 250], [0, 0.6], { extrapolateRight: "clamp" }),
          fontFamily: FONTS.mono,
          fontSize: 14,
          color: COLORS.mutedFg,
          letterSpacing: 3,
        }}
      >
        TRUST CANNOT BE ASSUMED — IT MUST BE VERIFIED
      </div>
    </div>
  );
};
