import type { Metadata } from "next";
import Link from "next/link";
import { FaqSection, type FaqItem } from "@/components/faq-section";
import { RoastForm } from "@/components/roast-form";
import { scoreColor, verdictColor } from "@/components/roast-result";
import { EXAMPLES, JUDGES, MAX_PITCH_CHARS, PENALTY_DECAY, VERDICTS, roast } from "@/lib/roast";
import { RATE_LIMIT } from "@/lib/agent-api";
import { DISCLAIMER_SHORT, PUBLIC_URL, SITE_NAME, resultPath } from "@/lib/site";

const title = "Roast my startup pitch, free: five judges, one verdict, one change";
const description =
  "Free tool to roast your startup pitch. Paste it and five judges (a seed VC, a skeptical customer, a CTO, your competitor, and a growth lead) score it 1 to 10, give a verdict, and name the one change worth the most points. No login, no AI model.";

export const metadata: Metadata = {
  title: { absolute: `${title} · ${SITE_NAME}` },
  description,
  alternates: { canonical: `${PUBLIC_URL}/` },
  openGraph: {
    title,
    description,
    type: "website",
    url: `${PUBLIC_URL}/`,
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", title, description, images: ["/opengraph-image"] },
};

const appJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: SITE_NAME,
  url: `${PUBLIC_URL}/`,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Any (web browser)",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  description,
};

const judgeList = JUDGES.map((j) => `${j.name} (wants: ${j.wants[0].toLowerCase()}${j.wants.slice(1).replace(/\.$/, "")})`).join("; ");
const verdictList = VERDICTS.map((v, i) => {
  const next = VERDICTS[i - 1];
  const range = v.min === 0 ? `under ${VERDICTS[i - 1].min}` : next ? `${v.min}-${next.min - 1}` : `${v.min}-50`;
  return `${v.label} (${range}): ${v.line}`;
}).join(" ");
const classic = EXAMPLES[0];
const classicUrl = `${PUBLIC_URL}${resultPath(classic.pitch, classic.stage, classic.category)}`;
const apiExample = `${PUBLIC_URL}/api/roast?pitch=${encodeURIComponent(classic.pitch)}&stage=${classic.stage}&category=${classic.category}`;

const faq: FaqItem[] = [
  {
    q: "Is there a free tool to roast my startup pitch?",
    a: "Yes. Pitch Roast is free, with no login, no signup, and no AI bill. Paste your pitch (one to five sentences) and optionally pick a stage and a category. Five judges each score it 1 to 10 with a one-line roast, the scores add up to a total out of 50 with a verdict, and you get the one change that would most improve it. The same pitch always gets the same result.",
  },
  {
    q: "How do the five judges score my pitch?",
    a: `The judges are fictional: ${judgeList}. Each starts at 5. Signals a judge cares about add points and problems subtract them. Penalties stack with diminishing weight (${PENALTY_DECAY.slice(0, 4).join(", ")}...), so ten small problems don't count ten times. Scores are rounded and kept between 1 and 10, and each judge's line is about the problem that cost them the most. It is a fixed rubric in code, not an AI model or real people.`,
  },
  {
    q: "What does the verdict mean?",
    a: `The verdict comes from the total of the five scores, out of 50. ${verdictList}`,
  },
  {
    q: "What is \"the one change\"?",
    a: "It is the single fix that raises your total the most when applied on its own, for example \"Drop the comparison\", \"Name exactly who pays\", or \"Show proof someone wants it\". Ties go to the heaviest penalty in the rubric. If nothing is wrong, it suggests the missing strength worth the most. When it adds points, the result shows about how many and what your new total would be.",
  },
  {
    q: "What makes a startup pitch score higher?",
    a: "Points for: a specific customer you can find in one search, a pain or payoff (extra if it has a number), real numbers and proof (paying customers and revenue count most; users, pilots, LOIs, and waitlists count as early proof), a wedge, a distribution channel you control, an edge that is hard to copy, a concrete mechanism, a price, a why-now, and founder fit. Points off for: \"X for Y\" comparisons, blockchain without a reason (softened in the crypto category), buzzwords, vague audiences like \"everyone\" or \"businesses\", all-in-one scope, AI hand-waving, hedging, shouting, and length (under 8 words, or over 5 sentences or 90 words). Later stages are judged harder on traction.",
  },
  {
    q: "What happens to my pitch text?",
    a: "There is no database, login, or tracking. Your pitch is scored when the result page loads and is not stored. Share links carry the pitch inside the URL, so anyone you send a link to can read it. Don't paste anything confidential.",
  },
  {
    q: "Can I share my roast?",
    a: `Yes. Every result has its own link (a /r page) with a Copy share link button and a Share on X button. The link carries the pitch, so anyone who opens it sees the same scores, and it shows a preview card with the verdict and total. Example: ${classicUrl}`,
  },
  {
    q: "Is there an API to roast a pitch?",
    a: `Yes, free and keyless, with CORS open. GET ${apiExample} or POST ${PUBLIC_URL}/api/roast with a JSON body like {"pitch": "...", "stage": "seed", "category": "b2b-saas"}. It returns the five judge scores and lines, the total, the verdict, the one change, issues, strengths, and a share URL, plus a disclaimer field. Pitches can be up to ${MAX_PITCH_CHARS} characters. Fair use is about ${RATE_LIMIT} requests per minute per IP. The OpenAPI spec is at ${PUBLIC_URL}/openapi.json.`,
  },
  {
    q: "Can my AI assistant roast a pitch through MCP?",
    a: "Yes. The tool roast_pitch is on the free remote MCP server at https://free-agent-tools.vercel.app/mcp (streamable HTTP, no auth), together with the maker's other free tools. Add that URL to Claude, Cursor, ChatGPT, or another MCP client and ask it to roast your pitch.",
  },
  {
    q: "Is a high score investment advice?",
    a: `No. ${DISCLAIMER_SHORT} A score does not predict whether anyone will fund, buy, or use your product: a high score does not mean a business is good, and a low score does not mean it is bad. The judges do not represent any real person, firm, or fund.`,
  },
];

export default function HomePage() {
  const demo = EXAMPLES[0];
  const r = roast(demo.pitch, demo.stage, demo.category);
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:py-10">
      <section className="max-w-3xl">
        <p className="font-mono text-[11px] tracking-[0.28em] text-flame uppercase">Free startup pitch roast · no login · no AI bill</p>
        <h1 className="mt-3 font-display text-5xl leading-[1.02] tracking-tight sm:text-7xl">Roast your startup pitch.</h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          Five judges, one verdict, one change. Paste your startup pitch and a seed VC, a skeptical customer, a CTO, your
          competitor, and a growth lead each score it 1 to 10 with a line you&apos;ll remember. Then you get the single change
          worth the most points.
        </p>
      </section>

      <section className="mt-8">
        <RoastForm />
      </section>

      <section className="mt-12 grid gap-4 md:grid-cols-[1.1fr_1fr]">
        <Link href={resultPath(demo.pitch, demo.stage, demo.category)} className="group rounded-3xl border border-line bg-panel/60 p-5 hover:border-flame/50">
          <p className="font-mono text-[11px] tracking-[0.28em] text-muted uppercase">Example roast</p>
          <p className="mt-2 text-lg text-foreground">“{demo.pitch}”</p>
          <p className={`mt-3 font-display text-4xl ${verdictColor(r.total)}`}>
            {r.verdict.label} <span className="font-mono text-2xl text-foreground">{r.total}/50</span>
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            {r.judges.slice(0, 3).map((j) => (
              <li key={j.id} className="flex gap-3">
                <span className={`w-6 shrink-0 font-mono font-bold ${scoreColor(j.score)}`}>{j.score}</span>
                <span className="text-muted">
                  <span className="text-foreground">{j.name}:</span> {j.roast}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-flame group-hover:underline">See the full roast →</p>
        </Link>
        <div className="rounded-3xl border border-line bg-panel/40 p-5">
          <p className="font-mono text-[11px] tracking-[0.28em] text-muted uppercase">The judges</p>
          <ul className="mt-3 space-y-3">
            {JUDGES.map((j) => (
              <li key={j.id}>
                <p className="font-semibold text-foreground">{j.name}</p>
                <p className="text-sm text-muted">Wants: {j.wants}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-16 max-w-3xl">
        <h2 className="font-display text-3xl tracking-tight sm:text-4xl">What gets you points</h2>
        <div className="mt-4 grid gap-3 text-sm leading-relaxed text-muted sm:grid-cols-2 sm:text-base">
          <p><span className="text-foreground">A specific customer.</span> &quot;Dental clinics in Ohio&quot;, not &quot;businesses&quot;.</p>
          <p><span className="text-foreground">A pain with a number.</span> &quot;Lose $4,000 a month to no-shows.&quot;</p>
          <p><span className="text-foreground">Proof.</span> Paying customers, pilots, pre-orders, or a waitlist count.</p>
          <p><span className="text-foreground">A channel.</span> How the first 100 customers find you.</p>
          <p><span className="text-foreground">How it works.</span> An app, a text, an integration. Something a user touches.</p>
          <p><span className="text-foreground">An edge and a price.</span> Why you can&apos;t be copied, and what it costs.</p>
        </div>
        <p className="mt-4 text-sm text-muted">
          What costs you: buzzwords, &quot;Uber for X&quot;, blockchain without a reason, &quot;for everyone&quot;, all-in-one scope,
          and maybes. <Link className="text-flame hover:underline" href="/how-it-works">See the full rubric</Link>.
        </p>
      </section>

      <FaqSection items={faq} heading="Pitch roast questions" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd).replace(/</g, "\\u003c") }}
      />
    </div>
  );
}
