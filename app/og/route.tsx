import { ImageResponse } from "next/og";
import { MAX_PITCH_CHARS, normalizePitch, parseCategory, parseStage, roast } from "@/lib/roast";

const color = (n: number) => (n <= 3 ? "#fb7185" : n <= 6 ? "#f0b429" : "#5eead4");
const verdictColor = (t: number) => (t >= 34 ? "#5eead4" : t >= 25 ? "#f0b429" : "#ff6a3d");
const SHORT: Record<string, string> = { vc: "Seed VC", customer: "Customer", cto: "CTO", competitor: "Competitor", growth: "Growth" };

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const pitch = normalizePitch(sp.get("p") ?? sp.get("pitch") ?? "").slice(0, MAX_PITCH_CHARS) || "Uber for dog walkers, but on the blockchain.";
  const r = roast(pitch, parseStage(sp.get("stage")), parseCategory(sp.get("category")));
  const quote = pitch.length > 150 ? `${pitch.slice(0, 147).trimEnd()}…` : pitch;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#0a0806", color: "#f3efe4", padding: "52px 60px", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", fontSize: 24, letterSpacing: "0.24em", textTransform: "uppercase", color: "#ff6a3d" }}>Pitch Roast</div>
          <div style={{ display: "flex", fontSize: 22, color: "#9b9588" }}>5 judges · 1 verdict · 1 change</div>
        </div>
        <div style={{ display: "flex", fontSize: 36, lineHeight: 1.25, color: "#f3efe4", maxWidth: 1080 }}>“{quote}”</div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 84, fontWeight: 800, letterSpacing: "-0.03em", color: verdictColor(r.total), lineHeight: 1 }}>{r.verdict.label}</div>
            <div style={{ display: "flex", fontSize: 26, color: "#9b9588", marginTop: 10 }}>The one change: {r.oneChange.title}</div>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", fontSize: 92, fontWeight: 800 }}>
            {r.total}
            <span style={{ fontSize: 38, color: "#9b9588" }}>/50</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 14 }}>
          {r.judges.map((j) => (
            <div key={j.id} style={{ display: "flex", flex: 1, flexDirection: "column", border: "2px solid #2a2520", borderRadius: 18, padding: "12px 16px", background: "#14100c" }}>
              <div style={{ display: "flex", fontSize: 20, color: "#9b9588" }}>{SHORT[j.id]}</div>
              <div style={{ display: "flex", fontSize: 44, fontWeight: 800, color: color(j.score) }}>
                {j.score}
                <span style={{ fontSize: 22, color: "#9b9588", marginLeft: 4, marginTop: 18 }}>/10</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 20, color: "#6f6a60" }}>
          <span>pitch-roast.vercel.app · free, no login</span>
          <span>For fun and practice. Not investment advice.</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630, headers: { "Cache-Control": "public, max-age=86400, s-maxage=604800, immutable" } },
  );
}
