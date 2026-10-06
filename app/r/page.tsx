import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { RoastForm } from "@/components/roast-form";
import { RoastResultView } from "@/components/roast-result";
import { ShareBar } from "@/components/share-bar";
import { EXAMPLES, MAX_PITCH_CHARS, normalizePitch, parseCategory, parseStage, roast } from "@/lib/roast";
import { DISCLAIMER_SHORT, PUBLIC_URL, ogPath, resultPath } from "@/lib/site";

type SP = Promise<Record<string, string | string[] | undefined>>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

async function read(searchParams: SP) {
  const sp = await searchParams;
  const pitch = normalizePitch(one(sp.p) || one(sp.pitch)).slice(0, MAX_PITCH_CHARS);
  return { pitch, stage: parseStage(one(sp.stage)), category: parseCategory(one(sp.category)) };
}

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const { pitch, stage, category } = await read(searchParams);
  if (!pitch) return { title: "Roast a pitch" };
  const r = roast(pitch, stage, category);
  const title = `${r.verdict.label}: ${r.total}/50 from five judges`;
  const description = `“${pitch.slice(0, 140)}${pitch.length > 140 ? "…" : ""}” ${r.verdict.line} The one change: ${r.oneChange.title}.`;
  const image = ogPath(pitch, stage, category);
  const isExample = EXAMPLES.some((e) => e.pitch === pitch && e.stage === stage && e.category === category);
  return {
    title,
    description,
    alternates: { canonical: `${PUBLIC_URL}${resultPath(pitch, stage, category)}` },
    robots: isExample ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: { title: `Pitch Roast · ${title}`, description, type: "website", images: [{ url: image, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title: `Pitch Roast · ${title}`, description, images: [image] },
  };
}

export default async function ResultPage({ searchParams }: { searchParams: SP }) {
  const { pitch, stage, category } = await read(searchParams);
  if (!pitch) redirect("/");
  const r = roast(pitch, stage, category);
  const url = `${PUBLIC_URL}${resultPath(pitch, stage, category)}`;
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-10">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl tracking-tight sm:text-4xl">Five judges. One verdict. One change.</h1>
        <Link href="/" className="text-sm text-muted hover:text-foreground">
          ← Roast another
        </Link>
      </div>
      <RoastResultView r={r} />
      <section className="mt-6 rounded-3xl border border-line bg-panel/50 p-5">
        <h2 className="text-sm font-semibold text-foreground">Share this roast</h2>
        <p className="mt-1 text-sm text-muted">The link carries the pitch, so anyone who opens it sees the same scores. Nothing is stored.</p>
        <div className="mt-3">
          <ShareBar url={url} text={`My startup pitch got ${r.total}/50 from five judges: ${r.verdict.label}. Roast yours:`} />
        </div>
      </section>
      <section className="mt-10">
        <h2 className="font-display text-2xl tracking-tight">Edit and roast again</h2>
        <div className="mt-3">
          <RoastForm initial={{ pitch, stage, category }} />
        </div>
      </section>
      <p className="mt-6 text-xs text-muted">{DISCLAIMER_SHORT}</p>
    </div>
  );
}
