import { useCurrentFrame, interpolate } from "remotion";
import { COLORS, FONTS } from "../styles";

const PILLARS = [
  {
    number: "01",
    title: "Deterministic Policies",
    desc: "Same input → same output. No AI in the evaluation loop. Pure logic.",
  },
  {
    number: "02",
    title: "On-Chain Verification",
    desc: "Every decision hashed and stored immutably. Anyone can re-verify.",
  },
  {
    number: "03",
    title: "Bilateral Agreements",
    desc: "Agents commit to shared rules. Neither party can change them after signing.",
  },
];

export const SolutionOverview: React.FC = () => {
  const frame = useCurrentFrame();

  const logoOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const logoY = interpolate(frame, [0, 20], [20, 0], { extrapolateRight: "clamp" });
  const subtitleOpacity = interpolate(frame, [20, 40], [0, 1], { extrapolateRight: "clamp" });

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
          opacity: logoOpacity,
          transform: `translateY(${logoY}px)`,
          marginBottom: 12,
        }}
      >
        <span
          style={{
            fontSize: 72,
            fontWeight: 800,
            fontFamily: FONTS.sans,
            color: COLORS.fg,
          }}
        >
          Delegate.
        </span>
      </div>

      <div
        style={{
          fontSize: 22,
          fontFamily: FONTS.sans,
          color: COLORS.mutedFg,
          opacity: subtitleOpacity,
          marginBottom: 70,
        }}
      >
        Policy checks before agents act.
      </div>

      <div style={{ display: "flex", gap: 48, maxWidth: 1400 }}>
        {PILLARS.map((pillar, i) => {
          const pillarDelay = 50 + i * 30;
          const pillarOpacity = interpolate(frame, [pillarDelay, pillarDelay + 25], [0, 1], {
            extrapolateRight: "clamp",
          });
          const pillarY = interpolate(frame, [pillarDelay, pillarDelay + 25], [24, 0], {
            extrapolateRight: "clamp",
          });

          return (
            <div
              key={i}
              style={{
                flex: 1,
                opacity: pillarOpacity,
                transform: `translateY(${pillarY}px)`,
                borderRadius: 12,
                border: `1px solid ${COLORS.border}`,
                padding: 32,
                backgroundColor: COLORS.card,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontFamily: FONTS.mono,
                  color: COLORS.mutedFg,
                  marginBottom: 12,
                  letterSpacing: 2,
                }}
              >
                {pillar.number}
              </div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  fontFamily: FONTS.sans,
                  color: COLORS.fg,
                  marginBottom: 12,
                  lineHeight: 1.3,
                }}
              >
                {pillar.title}
              </div>
              <div
                style={{
                  fontSize: 17,
                  fontFamily: FONTS.sans,
                  color: COLORS.mutedFg,
                  lineHeight: 1.6,
                }}
              >
                {pillar.desc}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
