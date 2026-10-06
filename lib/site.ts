export const SITE_NAME = "Pitch Roast";
export const PUBLIC_URL = "https://pitch-roast.vercel.app";

export const SITE_TAGLINE =
  "Paste your startup pitch. Five judges roast it, score it 1 to 10, and give one verdict and the one change that would most improve it.";

export const DISCLAIMER_SHORT = "For fun and practice. Not investment, legal, or business advice.";

export const HONESTY =
  "Scores come from a fixed, transparent rubric in code: no AI model and no real people. The judges are fictional. Your pitch is not stored.";

/** Other free tools by the same maker, shown in the footer. */
export const SIBLING_TOOLS = [
  { href: "https://fund-fix-flee.vercel.app", label: "Founder Scorecard" },
  { href: "https://japan-trip-brain.vercel.app", label: "Japan Trip Brain" },
  { href: "https://hotel-ota-calculator.vercel.app", label: "Hotel OTA Calculator" },
  { href: "https://saas-bill-cutter.vercel.app", label: "SaaS Bill Cutter" },
  { href: "https://ads-risk-check.vercel.app", label: "Ads Risk Check" },
  { href: "https://faceless-yt-risk-check.vercel.app", label: "Faceless YT Reality Check" },
  { href: "https://appgate-pack.vercel.app/check", label: "AppGate Pack" },
  { href: "https://ai-bottleneck-map.vercel.app", label: "AI Bottleneck Map" },
  { href: "https://viral-attention-map.vercel.app", label: "Viral Attention Map" },
] as const;

export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  if (process.env.VERCEL_ENV === "production") return PUBLIC_URL;
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, "")}`;
  return PUBLIC_URL;
}

/** Shareable result path. The pitch lives in the URL, so nothing is stored. */
export function resultPath(pitch: string, stage?: string | null, category?: string | null): string {
  const q = new URLSearchParams({ p: pitch });
  if (stage) q.set("stage", stage);
  if (category) q.set("category", category);
  return `/r?${q.toString()}`;
}

export function ogPath(pitch: string, stage?: string | null, category?: string | null): string {
  return resultPath(pitch, stage, category).replace(/^\/r\?/, "/og?");
}
