import type { Metadata } from "next";
import Link from "next/link";
import { EXAMPLES, JUDGES, PENALTY_DECAY, VERDICTS, roast } from "@/lib/roast";
import { PUBLIC_URL, resultPath } from "@/lib/site";

export const metadata: Metadata = {
  title: "How the roast works: the full rubric",
  description: "Pitch Roast scores pitches with a fixed, transparent rubric: specific customer, pain, numbers, traction, wedge, distribution, edge, price, buzzwords, X-for-Y, and blockchain checks. No AI model.",
};

const SIGNALS: [string, string][] = [
  ["Specific customer", "A buyer you can find in one search (dentists, Shopify merchants, landlords) or a named pilot. \"Everyone\", \"people\", \"businesses\", and \"Gen Z\" don't count."],
  ["Pain or payoff", "Words like lose, waste, manual, no-shows, fees, slow, or the payoff: save, cut, faster. Extra credit when the same sentence has a number."],
  ["Numbers and traction", "Any real number helps. Paying customers, revenue, pre-orders, and \"N customers pay $X\" count as revenue-grade proof. Users, pilots, LOIs, and waitlists count as early proof. Later stages are judged harder when proof is missing."],
  ["Wedge", "Where you start: one city, one niche, one workflow (\"starting with\", \"in Ohio\", \"focused on\")."],
  ["Distribution", "A channel you control: a partner, an association, a marketplace listing, SEO, a community, a newsletter. \"Word of mouth\" and \"viral\" alone are treated as hope."],
  ["Edge", "Why you can't be copied: data, network effects, exclusivity, integrations, or a clear comparison (\"10x faster than\", \"instead of\")."],
  ["Mechanism", "What the user touches: an app, SMS, an integration, a plugin, a dashboard, or a concrete action (drafts, predicts, schedules)."],
  ["Price", "Who pays and how much (\"$199/month per clinic\", \"per seat\", \"commission\")."],
  ["Why now and founder fit", "A recent change that makes it possible, and why you're the one to build it."],
];
const PENALTIES: [string, string][] = [
  ["\"X for Y\"", "Uber for, Airbnb for, Cursor for, Tinder meets LinkedIn... It tells judges what you copied, not what you do. Your competitor loves it."],
  ["Blockchain without a reason", "Blockchain, web3, NFT, tokens, decentralized. Heavy CTO penalty. Softened when the category is crypto."],
  ["Buzzwords", "Revolutionary, seamless, AI-powered, platform, ecosystem, unlock, empower, all-in-one, and about 60 more. Each one costs more, up to four."],
  ["Too broad", "All-in-one, end-to-end, everything, super app, for all industries."],
  ["AI hand-waving", "Mentions AI but no mechanism and no numbers."],
  ["Hedging and shouting", "Hopefully, maybe, we plan to; ALL CAPS and stacked exclamation points."],
  ["Length", "Under 8 words is too short to judge. Over 5 sentences or 90 words is too long."],
];

export default function HowItWorks() {
  const ex = EXAMPLES[3];
  const exR = roast(ex.pitch, ex.stage, ex.category);
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-10">
      <p className="font-mono text-[11px] tracking-[0.28em] text-flame uppercase">No black box</p>
      <h1 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight sm:text-6xl">How the roast works</h1>
      <p className="mt-4 text-lg text-muted">
        Every score comes from a fixed rubric in code. No AI model, no random numbers: the same pitch always gets the same scores,
        lines, verdict, and change. The source is on{" "}
        <a className="text-flame hover:underline" href="https://github.com/sean0007/pitch-roast" target="_blank" rel="noopener noreferrer">GitHub</a>.
      </p>

      <section className="mt-10">
        <h2 className="font-display text-3xl tracking-tight">The five judges</h2>
        <ul className="mt-3 space-y-2 text-sm text-muted sm:text-base">
          {JUDGES.map((j) => (
            <li key={j.id}><span className="text-foreground">{j.name}</span>: {j.wants}</li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-muted">
          Each judge starts at 5. Signals they care about add points; problems they care about subtract points. Penalties stack with
          diminishing weight ({PENALTY_DECAY.slice(0, 4).join(", ")}…), so ten small problems don&apos;t count ten times. Scores are rounded
          and kept between 1 and 10. Each judge&apos;s line is about the problem that cost them the most.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-3xl tracking-tight">What earns points</h2>
        <dl className="mt-3 space-y-3 text-sm leading-relaxed sm:text-base">
          {SIGNALS.map(([k, v]) => (
            <div key={k}><dt className="text-foreground">{k}</dt><dd className="text-muted">{v}</dd></div>
          ))}
        </dl>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-3xl tracking-tight">What costs points</h2>
        <dl className="mt-3 space-y-3 text-sm leading-relaxed sm:text-base">
          {PENALTIES.map(([k, v]) => (
            <div key={k}><dt className="text-foreground">{k}</dt><dd className="text-muted">{v}</dd></div>
          ))}
        </dl>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-3xl tracking-tight">Verdict and the one change</h2>
        <ul className="mt-3 space-y-1 text-sm text-muted sm:text-base">
          {VERDICTS.map((v) => (
            <li key={v.label}><span className="font-mono text-foreground">{v.label}</span> ({v.min}+ of 50): {v.line}</li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-muted sm:text-base">
          The one change is the fix that raises the total the most when applied on its own, with ties going to the heaviest penalty.
          When nothing is wrong, it suggests the missing strength worth the most.
        </p>
        <p className="mt-3 text-sm text-muted sm:text-base">
          Example: <Link className="text-flame hover:underline" href={resultPath(ex.pitch, ex.stage, ex.category)}>a pitch that scores {exR.total}/50</Link>, and{" "}
          <Link className="text-flame hover:underline" href={resultPath(EXAMPLES[0].pitch, EXAMPLES[0].stage, EXAMPLES[0].category)}>one that doesn&apos;t</Link>.
        </p>
      </section>

      <section id="api" className="mt-10 rounded-3xl border border-line bg-panel/50 p-5">
        <h2 className="font-display text-3xl tracking-tight">Free API for AI agents</h2>
        <p className="mt-2 text-sm text-muted">No key, no signup, CORS open. GET query parameters or a POST JSON body. Every response includes a disclaimer.</p>
        <pre className="mt-3 overflow-x-auto rounded-2xl bg-black/50 p-4 text-xs text-foreground">{`curl "${PUBLIC_URL}/api/roast?pitch=Uber%20for%20dog%20walkers%2C%20but%20on%20the%20blockchain.&stage=idea"

curl -X POST ${PUBLIC_URL}/api/roast \\
  -H "Content-Type: application/json" \\
  -d '{"pitch":"Dental clinics lose $4,000 a month to no-shows...","stage":"seed"}'`}</pre>
        <p className="mt-3 text-sm text-muted">
          <a className="text-flame hover:underline" href="/openapi.json">OpenAPI 3.1</a> ·{" "}
          <a className="text-flame hover:underline" href="/.well-known/ai-plugin.json">ai-plugin.json</a> ·{" "}
          <a className="text-flame hover:underline" href="/llms.txt">llms.txt</a> · MCP tool <code>roast_pitch</code> at{" "}
          <a className="text-flame hover:underline" href="https://free-agent-tools.vercel.app">free-agent-tools.vercel.app/mcp</a>
        </p>
      </section>
    </div>
  );
}
