import Link from "next/link";
import { RoastForm } from "@/components/roast-form";
import { scoreColor, verdictColor } from "@/components/roast-result";
import { EXAMPLES, JUDGES, roast } from "@/lib/roast";
import { resultPath } from "@/lib/site";

export default function HomePage() {
  const demo = EXAMPLES[0];
  const r = roast(demo.pitch, demo.stage, demo.category);
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:py-10">
      <section className="max-w-3xl">
        <p className="font-mono text-[11px] tracking-[0.28em] text-flame uppercase">Free pitch roast · no login · no AI bill</p>
        <h1 className="mt-3 font-display text-5xl leading-[1.02] tracking-tight sm:text-7xl">Roast your pitch.</h1>
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
    </div>
  );
}
