import { InputError, str, type Endpoint, type Input } from "./agent-api";
import { CATEGORIES, MAX_PITCH_CHARS, STAGES, parseCategory, parseStage, roast } from "./roast";
import { DISCLAIMER_SHORT, HONESTY, PUBLIC_URL, SITE_NAME, SITE_TAGLINE, ogPath, resultPath } from "./site";

export { PUBLIC_URL };
export const API_DISCLAIMER = `${DISCLAIMER_SHORT} ${HONESTY}`;
export const API_INFO = { title: `${SITE_NAME} API`, description: SITE_TAGLINE };

function readPitch(i: Input): string {
  const pitch = str({ pitch: i.pitch ?? i.p }, "pitch");
  if (pitch.length > MAX_PITCH_CHARS) throw new InputError(`Pitch is too long (${pitch.length} characters). Keep it under ${MAX_PITCH_CHARS}; one to five sentences works best.`);
  if (pitch.split(/\s+/).length < 2) throw new InputError("Pitch is too short. Write at least one sentence.");
  return pitch;
}

function readEnum<T>(i: Input, key: string, parse: (v: unknown) => T | null, allowed: readonly string[]): T | null {
  const raw = Array.isArray(i[key]) ? (i[key] as unknown[])[0] : i[key];
  if (raw === undefined || raw === null || String(raw).trim() === "") return null;
  const v = parse(raw);
  if (v === null) throw new InputError(`Invalid ${key}: "${raw}". Allowed: ${allowed.join(", ")}`);
  return v;
}

export function computeRoast(i: Input) {
  const pitch = readPitch(i);
  const stage = readEnum(i, "stage", parseStage, STAGES);
  const category = readEnum(i, "category", parseCategory, CATEGORIES);
  const r = roast(pitch, stage, category);
  return {
    tool: "pitch-roast",
    input: { pitch: r.pitch, stage, category },
    verdict: r.verdict.label,
    verdictLine: r.verdict.line,
    total: r.total,
    outOf: r.outOf,
    average: r.average,
    judges: r.judges.map((j) => ({ id: j.id, name: j.name, score: j.score, roast: j.roast, wants: j.wants })),
    oneChange: r.oneChange,
    issues: r.issues,
    strengths: r.strengths,
    shareUrl: `${PUBLIC_URL}${resultPath(r.pitch, stage, category)}`,
    ogImage: `${PUBLIC_URL}${ogPath(r.pitch, stage, category)}`,
  };
}

export const ENDPOINTS: Record<"roast", Endpoint> = {
  roast: {
    path: "/api/roast",
    operationId: "roastPitch",
    summary: "Roast a startup pitch: five judges score it 1-10, one verdict, and the one change that would most improve it",
    description:
      "Deterministic, transparent rubric (no AI model). Five fictional judges (Seed VC, Skeptical Customer, CTO, Your Competitor, Growth Lead) score the pitch 1-10 from signals such as a specific customer, a named pain, numbers and traction, a wedge, a distribution channel, an edge, a price, buzzword density, 'X for Y' comparisons, and unexplained blockchain. Returns each judge's roast line, the total out of 50, a verdict (FUND IT, SHARPEN IT, REWRITE IT, ROASTED, BURNT TO A CRISP), the one change worth the most points, the detected issues and strengths, and a shareable result URL with an OG image.",
    params: [
      { name: "pitch", type: "string", required: true, description: `The pitch, one to five sentences (max ${MAX_PITCH_CHARS} characters). Alias: p.` },
      { name: "stage", type: "string", enum: STAGES, description: "Optional company stage. Later stages are judged harder on traction." },
      { name: "category", type: "string", enum: CATEGORIES, description: "Optional category. 'crypto' softens the blockchain penalty." },
    ],
    example: "/api/roast?pitch=Uber%20for%20dog%20walkers%2C%20but%20on%20the%20blockchain.&stage=idea&category=marketplace",
    compute: computeRoast,
  },
};

export const PLUGIN = {
  name: SITE_NAME,
  nameForModel: "pitch_roast",
  descriptionForHuman: "Five judges roast your startup pitch: scores, one verdict, and the one change to make.",
  descriptionForModel:
    "Use when a user wants feedback on a startup pitch, one-liner, or elevator pitch, or wants it roasted. Send the pitch text (one to five sentences); optional stage and category. Returns five judge scores (1-10) with short roast lines, a verdict, the single most valuable change, and a share URL. Deterministic rubric, not an AI opinion. Always relay the disclaimer: for fun and practice, not investment advice.",
  logo: "/icon.svg",
};
