import type { RoastResult } from "@/lib/roast";
import { CATEGORY_LABELS, STAGE_LABELS } from "@/lib/roast";

export function scoreColor(n: number): string {
  if (n <= 3) return "text-rose-300";
  if (n <= 6) return "text-amber";
  return "text-teal-300";
}
function barColor(n: number): string {
  if (n <= 3) return "bg-rose-400";
  if (n <= 6) return "bg-amber";
  return "bg-teal-300";
}
export function verdictColor(total: number): string {
  if (total >= 34) return "text-teal-300";
  if (total >= 25) return "text-amber";
  return "text-flame";
}

const INITIALS: Record<string, string> = { vc: "VC", customer: "CU", cto: "CTO", competitor: "RIV", growth: "GRO" };

export function RoastResultView({ r }: { r: RoastResult }) {
  const meta = [r.stage ? STAGE_LABELS[r.stage] : null, r.category ? CATEGORY_LABELS[r.category] : null].filter(Boolean).join(" · ");
  return (
    <div className="space-y-6" data-testid="roast-result">
      <section className="rounded-3xl border border-line bg-panel/70 p-5 sm:p-7">
        <p className="font-mono text-[11px] tracking-[0.28em] text-muted uppercase">The pitch{meta ? ` · ${meta}` : ""}</p>
        <blockquote className="mt-3 border-l-2 border-flame/60 pl-4 text-lg leading-relaxed text-foreground sm:text-xl">“{r.pitch}”</blockquote>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[11px] tracking-[0.28em] text-muted uppercase">Verdict</p>
            <p data-testid="verdict" className={`mt-1 font-display text-5xl leading-none tracking-tight sm:text-7xl ${verdictColor(r.total)}`}>
              {r.verdict.label}
            </p>
            <p className="mt-2 text-muted">{r.verdict.line}</p>
          </div>
          <p className="font-mono text-4xl text-foreground sm:text-5xl">
            {r.total}
            <span className="text-xl text-muted">/50</span>
          </p>
        </div>
      </section>

      <section aria-label="Judges" className="grid gap-3">
        {r.judges.map((j) => (
          <article key={j.id} className="grid grid-cols-[auto_1fr_auto] items-start gap-4 rounded-3xl border border-line bg-panel/60 p-4 sm:p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-line bg-black/40 font-mono text-[11px] font-bold text-muted">
              {INITIALS[j.id]}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground">
                {j.name} <span className="text-xs font-normal text-muted">· {j.tagline}</span>
              </h3>
              <p className="mt-1 text-base leading-snug text-foreground/90">{j.roast}</p>
              <div className="mt-3 h-1.5 w-full max-w-sm overflow-hidden rounded-full bg-white/10">
                <div className={`h-full ${barColor(j.score)}`} style={{ width: `${j.score * 10}%` }} />
              </div>
            </div>
            <p className={`font-mono text-3xl font-bold ${scoreColor(j.score)}`}>
              {j.score}
              <span className="text-sm text-muted">/10</span>
            </p>
          </article>
        ))}
      </section>

      <section className="rounded-3xl border border-flame/40 bg-[#1b0f0a] p-5 sm:p-7" data-testid="one-change">
        <p className="font-mono text-[11px] tracking-[0.28em] text-flame uppercase">The one change</p>
        <h2 className="mt-2 font-display text-3xl tracking-tight sm:text-4xl">{r.oneChange.title}</h2>
        <p className="mt-2 text-base leading-relaxed text-foreground/90">{r.oneChange.fix}</p>
        <p className="mt-3 text-sm text-muted">
          {r.oneChange.pointsGained > 0
            ? `Worth about +${r.oneChange.pointsGained} points on its own (${r.total} → ${r.oneChange.totalAfter}/50). Biggest single gain in the rubric.`
            : "This is the heaviest penalty on this pitch. Fix it first, then roast it again to find the next one."}
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-line bg-panel/50 p-5">
          <h3 className="text-sm font-semibold text-foreground">What the judges liked</h3>
          <ul className="mt-2 space-y-1 text-sm text-muted">
            {r.strengths.length ? r.strengths.map((s) => <li key={s.id + s.label}>✓ {s.label}</li>) : <li>Nothing yet. That&apos;s what the one change is for.</li>}
          </ul>
        </div>
        <div className="rounded-3xl border border-line bg-panel/50 p-5">
          <h3 className="text-sm font-semibold text-foreground">What cost you points</h3>
          <ul className="mt-2 space-y-1 text-sm text-muted">
            {r.issues.length ? r.issues.map((s) => <li key={s.id}>✗ {s.label}</li>) : <li>No penalties. Annoying, honestly.</li>}
          </ul>
        </div>
      </section>
    </div>
  );
}
