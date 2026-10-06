import type { Metadata } from "next";
import { DISCLAIMER_SHORT, HONESTY } from "@/lib/site";

export const metadata: Metadata = { title: "Disclaimer", description: DISCLAIMER_SHORT };

export default function DisclaimerPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-10">
      <p className="font-mono text-[11px] tracking-[0.28em] text-flame uppercase">Read this</p>
      <h1 className="mt-3 font-display text-4xl leading-[1.05] tracking-tight sm:text-6xl">Disclaimer</h1>
      <p className="mt-4 text-lg text-foreground">{DISCLAIMER_SHORT}</p>
      <p className="mt-2 text-muted">{HONESTY}</p>
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted">
        <section>
          <h2 className="text-base font-semibold text-foreground">What this is</h2>
          <p className="mt-2">
            A practice tool. A fixed set of rules looks for common pitch strengths (a specific customer, a named pain, numbers,
            a channel) and common problems (buzzwords, vague audiences, &quot;X for Y&quot; comparisons) and turns them into scores
            and joke lines from five fictional judges.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">What it is not</h2>
          <p className="mt-2">
            It is not investment, legal, financial, or business advice, and it is not a prediction of whether anyone will fund,
            buy, or use your product. A high score does not mean a business is good, and a low score does not mean it is bad.
            Real investors and customers judge things this tool cannot see. The judges do not represent any real person, firm, or fund.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">Your data</h2>
          <p className="mt-2">
            There is no database, login, or tracking. Your pitch is scored on the page you request and is not stored. Share links
            carry the pitch inside the URL, so anyone you send a link to can read the pitch. Don&apos;t paste anything confidential.
          </p>
        </section>
      </div>
    </div>
  );
}
