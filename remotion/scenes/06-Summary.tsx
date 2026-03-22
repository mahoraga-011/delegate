import { useCurrentFrame, interpolate } from "remotion";
import { COLORS, FONTS } from "../styles";

const FEATURES = [
  "Agent identity registration on-chain",
  "Deterministic policy definition & registration",
  "Public policy commitment",
  "On-chain agent discovery & verification",
  "Bilateral agreement (propose → sign → finalize)",
  "Policy evaluation — ALLOW (safe query)",
  "Policy evaluation — DENY (dangerous operation)",
  "On-chain decision attestation",
  "Vault deposit & spending limit enforcement",
  "Vault spend — within limits (ALLOW)",
  "Vault spend — exceeds limit (DENY)",
  "Vault spend — unauthorized recipient (DENY)",
  "Cross-agent on-chain verification",
  "Tamper detection (single-field change caught)",
];

export const Summary: React.FC = () => {
  const frame = useCurrentFrame();

  const titleOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const titleY = interpolate(frame, [0, 20], [20, 0], { extrapolateRight: "clamp" });
  const taglineOpacity = interpolate(frame, [180, 210], [0, 1], { extrapolateRight: "clamp" });

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
        COMPLETE
      </div>

      <div
        style={{
          fontSize: 48,
          fontWeight: 700,
          fontFamily: FONTS.sans,
          color: COLORS.fg,
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          marginBottom: 40,
        }}
      >
        14 features. One demo.
      </div>

      {/* Feature checklist — two columns */}
      <div style={{ display: "flex", gap: 50, maxWidth: 1400 }}>
        {[0, 1].map((col) => (
          <div key={col} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
            {FEATURES.slice(col * 7, (col + 1) * 7).map((feature, i) => {
              const globalIndex = col * 7 + i;
              const itemDelay = 20 + globalIndex * 8;
              const itemOpacity = interpolate(frame, [itemDelay, itemDelay + 12], [0, 1], {
                extrapolateRight: "clamp",
              });
              const checkScale = interpolate(frame, [itemDelay + 5, itemDelay + 15], [0, 1], {
                extrapolateRight: "clamp",
              });

              return (
                <div
                  key={globalIndex}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    opacity: itemOpacity,
                    padding: "6px 0",
                  }}
                >
                  <span
                    style={{
                      fontSize: 18,
                      color: COLORS.green,
                      transform: `scale(${checkScale})`,
                      display: "inline-block",
                      fontWeight: 700,
                    }}
                  >
                    ✓
                  </span>
                  <span
                    style={{
                      fontSize: 16,
                      fontFamily: FONTS.sans,
                      color: COLORS.fg,
                    }}
                  >
                    {feature}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Tagline */}
      <div
        style={{
          marginTop: 50,
          opacity: taglineOpacity,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            fontFamily: FONTS.sans,
            color: COLORS.fg,
          }}
        >
          Same input. Same output. Verified on-chain.
        </div>
        <div
          style={{
            fontSize: 42,
            fontWeight: 800,
            fontFamily: FONTS.sans,
            color: COLORS.fg,
          }}
        >
          Delegate.
        </div>
      </div>
    </div>
  );
};
