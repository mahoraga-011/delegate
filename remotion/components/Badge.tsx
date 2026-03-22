import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS, FONTS } from "../styles";

export const Badge: React.FC<{
  type: "allow" | "deny";
  delay?: number;
}> = ({ type, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const adjustedFrame = Math.max(0, frame - delay);
  const scale = spring({ frame: adjustedFrame, fps, config: { damping: 12, stiffness: 200 } });
  const opacity = interpolate(adjustedFrame, [0, 8], [0, 1], { extrapolateRight: "clamp" });

  const bg = type === "allow" ? COLORS.green : COLORS.red;
  const text = type === "allow" ? "ALLOW" : "DENY";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: bg,
        color: COLORS.white,
        fontFamily: FONTS.mono,
        fontSize: 13,
        fontWeight: 700,
        padding: "3px 10px",
        borderRadius: 999,
        letterSpacing: 1.5,
        transform: `scale(${scale})`,
        opacity,
        marginRight: 8,
      }}
    >
      {text}
    </span>
  );
};
