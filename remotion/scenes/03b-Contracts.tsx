import { useCurrentFrame, interpolate } from "remotion";
import { COLORS, FONTS } from "../styles";

const CONTRACTS = [
  {
    name: "PolicyRegistry",
    desc: "Stores policy hashes immutably on-chain",
    address: "0x3a45...E15",
  },
  {
    name: "AuditLog",
    desc: "Append-only decision log — no updates, no deletes",
    address: "0x23b7...688",
  },
  {
    name: "Verifier",
    desc: "Read-only verification of on-chain decisions",
    address: "0xa20D...c6A",
  },
  {
    name: "AgentRegistry",
    desc: "Agent identity registration & policy commitments",
    address: "0xf78B...985",
  },
  {
    name: "Agreement",
    desc: "Bilateral agreements under shared policy hashes",
    address: "0x2a8B...601",
  },
  {
    name: "Vault",
    desc: "Escrow with per-tx and daily spending limits",
    address: "0x5242...307",
  },
];

export const Contracts: React.FC = () => {
  const frame = useCurrentFrame();

  const titleOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const titleY = interpolate(frame, [0, 20], [20, 0], { extrapolateRight: "clamp" });
  const chainBadgeOpacity = interpolate(frame, [10, 25], [0, 1], { extrapolateRight: "clamp" });

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
      {/* Header */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 50 }}>
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
          ON-CHAIN
        </div>
        <div
          style={{
            fontSize: 42,
            fontWeight: 700,
            fontFamily: FONTS.sans,
            color: COLORS.fg,
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
            marginBottom: 16,
          }}
        >
          6 contracts deployed on Base
        </div>
        {/* Chain badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            opacity: chainBadgeOpacity,
            backgroundColor: COLORS.secondary,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 999,
            padding: "6px 20px",
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: "#3b82f6",
            }}
          />
          <span
            style={{
              fontFamily: FONTS.mono,
              fontSize: 14,
              color: COLORS.fg,
              fontWeight: 500,
            }}
          >
            Base Sepolia · Chain ID 84532
          </span>
        </div>
      </div>

      {/* Contract grid — 3x2 */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 20,
          maxWidth: 1400,
          justifyContent: "center",
        }}
      >
        {CONTRACTS.map((contract, i) => {
          const delay = 30 + i * 18;
          const cardOpacity = interpolate(frame, [delay, delay + 18], [0, 1], {
            extrapolateRight: "clamp",
          });
          const cardY = interpolate(frame, [delay, delay + 18], [20, 0], {
            extrapolateRight: "clamp",
          });

          return (
            <div
              key={i}
              style={{
                width: 430,
                opacity: cardOpacity,
                transform: `translateY(${cardY}px)`,
                borderRadius: 12,
                border: `1px solid ${COLORS.border}`,
                padding: "24px 28px",
                backgroundColor: COLORS.card,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    fontFamily: FONTS.sans,
                    color: COLORS.fg,
                  }}
                >
                  {contract.name}
                </span>
                <span
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: 12,
                    color: COLORS.mutedFg,
                    backgroundColor: COLORS.secondary,
                    padding: "2px 10px",
                    borderRadius: 4,
                  }}
                >
                  {contract.address}
                </span>
              </div>
              <span
                style={{
                  fontSize: 16,
                  fontFamily: FONTS.sans,
                  color: COLORS.mutedFg,
                  lineHeight: 1.5,
                }}
              >
                {contract.desc}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
