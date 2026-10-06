import assert from "node:assert/strict";
import test from "node:test";
import { CATEGORIES, EXAMPLES, STAGES, detect, roast, splitSentences, verdictFor } from "./roast";

const CLASSIC = "Uber for dog walkers, but on the blockchain.";
const GOOD = EXAMPLES[3].pitch;

test("same input gives exactly the same result (deterministic)", () => {
  for (const e of EXAMPLES) assert.deepEqual(roast(e.pitch, e.stage, e.category), roast(e.pitch, e.stage, e.category));
});

test("whitespace differences do not change the result", () => {
  assert.deepEqual(roast(`  ${CLASSIC.replace(/ /g, "   ")}\n`), roast(CLASSIC));
});

test("five distinct judges, scores are integers from 1 to 10, lines are non-empty", () => {
  for (const e of EXAMPLES) {
    const r = roast(e.pitch, e.stage, e.category);
    assert.equal(r.judges.length, 5);
    assert.equal(new Set(r.judges.map((j) => j.id)).size, 5);
    for (const j of r.judges) {
      assert.ok(Number.isInteger(j.score) && j.score >= 1 && j.score <= 10, `${j.id}=${j.score}`);
      assert.ok(j.roast.length > 10 && !/\{\w+\}/.test(j.roast), j.roast);
    }
    assert.equal(r.total, r.judges.reduce((a, j) => a + j.score, 0));
  }
});

test("the classic bad pitch gets roasted and detects X-for-Y and blockchain", () => {
  const r = roast(CLASSIC, "idea", "marketplace");
  assert.ok(r.total < 15, `total ${r.total}`);
  assert.equal(r.verdict.label, "BURNT TO A CRISP");
  const ids = r.issues.map((i) => i.id);
  assert.ok(ids.includes("x_for_y"));
  assert.ok(ids.includes("blockchain"));
  assert.match(r.signals.comp ?? "", /^Uber for dog walkers$/);
  assert.ok(r.judges.some((j) => j.roast.includes("Uber for dog walkers")));
  assert.ok(["blockchain", "x_for_y"].includes(r.oneChange.id));
  assert.ok(r.oneChange.pointsGained > 0);
});

test("a specific, proven pitch scores high", () => {
  const r = roast(GOOD, "seed", "b2b-saas");
  assert.ok(r.total >= 42, `total ${r.total}`);
  assert.equal(r.verdict.label, "FUND IT");
  const s = r.strengths.map((x) => x.id);
  for (const id of ["specific_customer", "quantified_pain", "traction", "distribution", "business_model"]) assert.ok(s.includes(id as never), id);
});

test("better pitch beats worse pitch on every example ladder", () => {
  const totals = EXAMPLES.map((e) => roast(e.pitch, e.stage, e.category).total);
  assert.ok(totals[3] > totals[2] && totals[2] > totals[0], totals.join(","));
});

test("buzzwords are detected and penalized", () => {
  const s = detect("We are a revolutionary AI-powered platform that seamlessly empowers everyone.");
  assert.ok(s.buzzwords.length >= 4, s.buzzwords.join(","));
  const plain = roast("Landlords in Texas spend 6 hours a month chasing rent. Our app texts tenants and collects rent by card.");
  const buzz = roast("Landlords in Texas spend 6 hours a month chasing rent. Our revolutionary AI-powered platform seamlessly empowers tenants.");
  assert.ok(buzz.total < plain.total, `${buzz.total} vs ${plain.total}`);
});

test("X-for-Y detection covers common comps and keeps brand casing", () => {
  assert.equal(detect("It's the Airbnb of parking spaces.").comp, "Airbnb for parking spaces");
  assert.equal(detect("LinkedIn for gen z").comp, "LinkedIn for gen z");
  assert.equal(detect("Dentists lose money to no-shows.").comp, null);
});

test("blockchain penalty is softened for the crypto category", () => {
  const p = "A wallet for freelancers in Brazil to get paid in stablecoins on-chain. 300 freelancers use it.";
  assert.ok(roast(p, null, "crypto").total > roast(p, null, null).total);
});

test("later stages are judged harder when traction is missing", () => {
  const p = "Plumbers waste hours on paperwork. Our app turns a voice note into an invoice in a minute.";
  const vcIdea = roast(p, "idea").judges.find((j) => j.id === "vc")!.score;
  const vcA = roast(p, "series-a").judges.find((j) => j.id === "vc")!.score;
  assert.ok(vcIdea > vcA, `${vcIdea} vs ${vcA}`);
});

test("too short and too long are flagged", () => {
  assert.ok(roast("AI for everything.").issues.some((i) => i.id === "too_short"));
  const long = Array.from({ length: 7 }, (_, i) => `Sentence number ${i + 1} explains another feature of the product.`).join(" ");
  assert.ok(roast(long).issues.some((i) => i.id === "too_long"));
});

test("word of mouth alone is treated as hope, not a channel", () => {
  const r = roast(EXAMPLES[2].pitch, EXAMPLES[2].stage, EXAMPLES[2].category);
  assert.ok(r.issues.some((i) => i.id === "weak_channel"));
});

test("one change always exists and its gain matches a recomputation", () => {
  for (const e of [...EXAMPLES, { pitch: "AI agents for everything.", stage: null, category: null }]) {
    const r = roast(e.pitch, e.stage, e.category);
    assert.ok(r.oneChange.title && r.oneChange.fix);
    assert.equal(r.oneChange.totalAfter, r.total + r.oneChange.pointsGained);
  }
});

test("sentence splitting ignores decimals and abbreviations", () => {
  assert.equal(splitSentences("We grew 3.5x vs. last year. Next is Ohio!").length, 2);
});

test("verdict bands", () => {
  assert.equal(verdictFor(50).label, "FUND IT");
  assert.equal(verdictFor(34).label, "SHARPEN IT");
  assert.equal(verdictFor(25).label, "REWRITE IT");
  assert.equal(verdictFor(15).label, "ROASTED");
  assert.equal(verdictFor(5).label, "BURNT TO A CRISP");
});

test("every stage and category is accepted", () => {
  for (const s of STAGES) for (const c of CATEGORIES) assert.equal(roast(GOOD, s, c).judges.length, 5);
});
