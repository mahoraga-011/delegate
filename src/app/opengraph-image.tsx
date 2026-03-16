import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Delegate — Policy enforcement for autonomous agents, verified on-chain";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  const geistBold = await fetch(
    new URL("https://cdn.jsdelivr.net/fontsource/fonts/geist-sans@latest/latin-700-normal.woff")
  ).then((res) => res.arrayBuffer());

  const geistRegular = await fetch(
    new URL("https://cdn.jsdelivr.net/fontsource/fonts/geist-sans@latest/latin-400-normal.woff")
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#ffffff",
          fontFamily: "Geist Sans",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            opacity: 0.04,
            backgroundImage:
              "linear-gradient(rgba(0,0,0,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "linear-gradient(90deg, #000 0%, #999 50%, #000 100%)",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            marginBottom: "24px",
          }}
        >
          <span
            style={{
              fontSize: "80px",
              fontWeight: 700,
              color: "#0a0a0a",
              letterSpacing: "-2px",
            }}
          >
            Delegate
          </span>
          <span
            style={{
              fontSize: "80px",
              fontWeight: 700,
              color: "#aaaaaa",
            }}
          >
            .
          </span>
        </div>

        <div
          style={{
            fontSize: "28px",
            fontWeight: 400,
            color: "#666666",
            textAlign: "center",
            maxWidth: "700px",
            lineHeight: 1.4,
          }}
        >
          Policy enforcement for autonomous agents, verified on-chain
        </div>

        <div
          style={{
            display: "flex",
            gap: "16px",
            marginTop: "40px",
          }}
        >
          {["Trust", "Cooperate", "Pay", "Verify"].map((theme) => (
            <div
              key={theme}
              style={{
                padding: "8px 20px",
                borderRadius: "6px",
                border: "1px solid #ddd",
                color: "#333",
                fontSize: "16px",
                fontWeight: 400,
                letterSpacing: "1px",
                textTransform: "uppercase" as const,
              }}
            >
              {theme}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Geist Sans", data: geistBold, weight: 700, style: "normal" },
        { name: "Geist Sans", data: geistRegular, weight: 400, style: "normal" },
      ],
    }
  );
}
