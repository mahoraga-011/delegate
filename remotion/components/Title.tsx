import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS, FONTS } from "../styles";

export const Title: React.FC<{
  text: string;
  subtitle?: string;
  align?: "left" | "center";
}> = ({ text, subtitle, align = "center" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const titleY = spring({ frame, fps, config: { damping: 20, stiffness: 100 } }) * 40 - 40;
  const subtitleOpacity = interpolate(frame, [15, 35], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: align === "center" ? "center" : "flex-start",
        gap: 16,
      }}
    >
      <div
        style={{
          fontSize: 56,
          fontWeight: 700,
          fontFamily: FONTS.sans,
          color: COLORS.fg,
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          textAlign: align,
          lineHeight: 1.2,
        }}
      >
        {text}
      </div>
      {subtitle && (
        <div
          style={{
            fontSize: 28,
            fontFamily: FONTS.sans,
            color: COLORS.muted,
            opacity: subtitleOpacity,
            textAlign: align,
            lineHeight: 1.5,
            maxWidth: 900,
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
};
