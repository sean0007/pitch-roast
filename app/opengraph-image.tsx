import { ImageResponse } from "next/og";

export const alt = "Pitch Roast: five judges, one verdict, one change";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  const judges = ["Seed VC", "Skeptical Customer", "CTO", "Your Competitor", "Growth Lead"];
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#0a0806", color: "#f3efe4", padding: "64px", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", fontSize: 24, letterSpacing: "0.26em", textTransform: "uppercase", color: "#ff6a3d" }}>Free pitch roast</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", fontSize: 84, lineHeight: 1.02, letterSpacing: "-0.03em", fontWeight: 800 }}>Five judges. One verdict. One change.</div>
          <div style={{ display: "flex", fontSize: 30, color: "#9b9588", maxWidth: 980, lineHeight: 1.35 }}>Paste your startup pitch. Get scored 1 to 10 by five judges and the one change that would most improve it.</div>
        </div>
        <div style={{ display: "flex", gap: 12, fontSize: 22 }}>
          {judges.map((j) => (
            <span key={j} style={{ display: "flex", border: "2px solid #2a2520", borderRadius: 999, padding: "8px 16px", color: "#f3efe4" }}>{j}</span>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
