// Pitch Roast engine. Pure, deterministic, no network, no LLM.
// Same input always gives the same five scores, lines, verdict, and one change.

export const STAGES = ["idea", "pre-seed", "seed", "series-a", "growth"] as const;
export const CATEGORIES = ["b2b-saas", "consumer", "marketplace", "devtools", "ai", "fintech", "health", "hardware", "climate", "crypto", "other"] as const;
export type Stage = (typeof STAGES)[number];
export type Category = (typeof CATEGORIES)[number];

export const STAGE_LABELS: Record<Stage, string> = { idea: "Idea", "pre-seed": "Pre-seed", seed: "Seed", "series-a": "Series A", growth: "Growth" };
export const CATEGORY_LABELS: Record<Category, string> = {
  "b2b-saas": "B2B SaaS", consumer: "Consumer", marketplace: "Marketplace", devtools: "Dev tools", ai: "AI", fintech: "Fintech",
  health: "Health", hardware: "Hardware", climate: "Climate", crypto: "Crypto / web3", other: "Other",
};

export const MAX_PITCH_CHARS = 1000;

export type JudgeId = "vc" | "customer" | "cto" | "competitor" | "growth";
export const JUDGES: { id: JudgeId; name: string; tagline: string; wants: string }[] = [
  { id: "vc", name: "The Seed VC", tagline: "Has seen 4,000 decks this year.", wants: "Proof, a wedge, and a reason this wins big." },
  { id: "customer", name: "The Skeptical Customer", tagline: "Would rather keep the spreadsheet.", wants: "My problem, in my words, with a price." },
  { id: "cto", name: "The CTO", tagline: "Has to actually build it.", wants: "A narrow scope and a mechanism that works." },
  { id: "competitor", name: "Your Competitor", tagline: "Already copying your landing page.", wants: "Something they can't clone by Friday." },
  { id: "growth", name: "The Growth Lead", tagline: "Asks where user #100 comes from.", wants: "A findable buyer and a real channel." },
];

type Weights = Partial<Record<JudgeId, number>>;

/* ---------------- detection ---------------- */

const COMPS =
  "uber|airbnb|tinder|netflix|spotify|amazon|linkedin|stripe|notion|figma|slack|shopify|cursor|chatgpt|tiktok|instagram|duolingo|robinhood|peloton|doordash|zillow|canva|salesforce|github|youtube|facebook|google|grammarly|calendly|zoom|discord|reddit|pinterest|etsy|venmo|paypal|substack|airtable|zapier|openai|lyft|instacart|wework|hubspot|squarespace|wix|bumble|yelp|carta|deel|gusto|rippling|ramp|brex|plaid|coinbase|strava|patreon|kickstarter|uber eats|onlyfans|twitch|vercel|superhuman|loom|miro|asana|trello|dropbox|ebay|craigslist|groupon|fiverr|upwork|turbotax|quickbooks|masterclass|clubhouse";
const X_FOR_Y = new RegExp(`\\b(?:the\\s+)?(${COMPS})\\s+(?:for|of)\\s+([a-z][\\w'-]*(?:\\s+(?!but\\b|on\\b|with\\b|and\\b|that\\b|in\\b)[a-z][\\w'-]*){0,2})`, "i");

const BLOCKCHAIN = /\b(on the blockchain|on-?chain|blockchains?|web ?3|nfts?|tokeni[sz](?:ed|ation|e)|token-gated|governance tokens?|crypto(?:currency|currencies)?|daos?|metaverse|smart contracts?|decentrali[sz]ed|dapps?|ledger)\b/gi;

const BUZZWORDS = [
  "synergy", "synergies", "revolutionary", "revolutionize", "revolutionizing", "disrupt", "disrupting", "disruptive", "paradigm", "paradigm shift",
  "leverage", "leveraging", "next-gen", "next generation", "cutting-edge", "cutting edge", "world-class", "best-in-class", "seamless", "seamlessly",
  "game-changing", "game changer", "game-changer", "innovative", "holistic", "robust", "scalable", "ai-powered", "ai powered", "ai-driven", "ai-first",
  "ai-native", "empower", "empowering", "unlock", "unlocking", "supercharge", "hyper-personalized", "frictionless", "democratize", "democratizing",
  "reimagine", "reimagining", "all-in-one", "end-to-end", "one-stop", "cloud-native", "quantum", "ecosystem", "solution", "solutions", "platform",
  "omnichannel", "turnkey", "mission-critical", "state-of-the-art", "groundbreaking", "transformative", "streamline", "optimize", "magic",
  "agentic", "super app", "super-app", "growth hacking", "visionary", "bleeding-edge", "future of",
];
const BUZZ_RE = new RegExp(`(?<![\\w-])(${BUZZWORDS.map((b) => b.replace(/[-\s]/g, "[-\\s]?")).join("|")})(?![\\w-])`, "gi");

const VAGUE_AUDIENCE = /\b(small businesses|smbs|businesses|startups|everyone|everybody|anyone|anybody|all businesses|any business|businesses of all sizes|people|the world|consumers|millennials|gen z|humanity|the masses|individuals|companies|enterprises|organizations|users)\b/gi;

const PERSONAS =
  "dentists?|dental (?:clinics?|practices|offices)|clinics?|plumbers?|electricians?|contractors?|roofers?|hvac (?:techs|companies)|landlords?|property managers?|realtors?|real estate agents?|restaurants?|caf[eé]s?|bakeries|bars|hotels?|ryokan|hostels?|salons?|barbers?|barbershops?|gyms?|yoga studios?|fitness studios?|nurses?|doctors?|physicians?|therapists?|vets?|veterinar(?:y clinics?|ians?)|pharmac(?:ies|ists?)|lawyers?|law firms?|attorneys?|accountants?|cpas?|bookkeepers?|recruiters?|hr teams?|sales teams?|sdrs?|cfos?|ctos?|founders?|freelancers?|designers?|developers?|engineers?|devops|data teams?|teachers?|tutors?|schools?|universities|students?|parents?|nannies|daycares?|dog owners?|pet owners?|farmers?|truckers?|truck drivers?|fleet managers?|warehouses?|manufacturers?|factories|retailers?|shopify (?:stores?|merchants?|sellers?)|etsy sellers?|amazon sellers?|e-?commerce (?:brands?|stores?)|dtc brands?|creators?|youtubers?|podcasters?|streamers?|musicians?|photographers?|wedding planners?|event planners?|churches|nonprofits?|insurers?|insurance agents?|mortgage brokers?|brokers?|credit unions?|hospitals?|caregivers?|seniors?|retirees?|construction (?:firms?|companies)|architects?|interior designers?|auto (?:shops?|dealers?)|mechanics?|car dealers(?:hips)?|cleaners?|cleaning companies|movers?|florists?|breweries|wineries|coffee shops?|food trucks?|chefs?|translators?|researchers?|labs?|clinicians?|radiologists?|coaches?|consultants?|agencies|marketing agencies|nurseries|pilots|airlines|travel agents?|tour operators?|logistics (?:teams?|companies)|procurement teams?|finance teams?|support teams?|customer support teams?|ops teams?|product managers?|marketers?|copywriters?|game studios?|indie (?:hackers|devs|developers)|homeowners?|renters?|tenants?|commuters?|runners?|cyclists?|gamers?|new moms?|new parents?|hikers?|travell?ers|expats|immigrants";
const PERSONA_RE = new RegExp(`\\b(${PERSONAS})\\b`, "i");
const GROUP_SUFFIX_RE = /\bfor\s+(?:[a-z-]+\s+){0,3}(teams|owners|managers|shops|clinics|firms|agencies|stores|studios|practices|operators|sellers|merchants|buyers|admins)\b/i;
const NAMED_LOGO_RE = /\b(?:pilots?|customers?|clients?|partners?|used by|working with|signed|LOIs? (?:from|with)|contract with|deployed at|live at|live in)\s+(?:with\s+|at\s+|from\s+|include\s+|including\s+)?([A-Z][\w&.'-]+)/;

const PAIN_RE = /\b(waste[sd]?|wasting|lose|loses|losing|lost|spend(?:s|ing)? (?:hours|days|weeks|\$)|manual(?:ly)?|spreadsheets?|excel|costs? them|costly|late|missed|miss(?:es)?|churn|fines?|penalt(?:y|ies)|expensive|painful|pain|slow|errors?|mistakes?|no-?shows?|chargebacks?|fraud|denied|denials|backlog|hate|struggle|struggling|frustrat\w*|headaches?|burn(?:ed)? out|burnout|overwhelmed|can'?t|cannot|stuck|delays?|downtime|unpaid|overdue|leak(?:s|ing)?|risk of|turnover|lonely|anxious|tedious|chase|chasing|paperwork|commissions?|fees|overpay\w*|save[sd]?|saving|cuts?|reduc\w+|fewer|faster|cheaper|quicker|less time)\b/i;
const NUMBER_RE = /(?:[$€£¥]\s?\d[\d,.]*\s?(?:k|m|b|bn|million|billion)?|\b\d[\d,.]*\s?(?:%|k\b|m\b|x\b|hours?|hrs?|minutes?|mins?|days?|weeks?|months?|years?)?)/gi;
const TRACTION_STRONG_RE = /\b(\d[\d,.]*\s?(?:k|m)?\+?\s+(?:[a-z-]+\s+){0,2}pay(?:s|ing)?\s+(?:us\s+)?[$€£¥]?\d|\d[\d,.]*\s?(?:k|m)?\+?\s+pre-?orders?|\d[\d,.]*\s?(?:k|m)?\+?\s+(?:paying|paid)\s+\w+|(?:mrr|arr|revenue|gmv|sales)\b[^.]{0,30}\d|[$€£¥]\s?\d[\d,.]*\s?(?:k|m)?\s+(?:in\s+)?(?:mrr|arr|revenue|gmv|sales|bookings)|profitable|paying customers|(?:customers|clients) pay(?:ing)?)/i;
const TRACTION_RE = /\b(\d[\d,.]*\s?(?:k|m)?\+?\s+(?:active\s+|monthly\s+|weekly\s+|daily\s+|beta\s+)?(?:customers|users|clients|teams|companies|businesses|stores|merchants|restaurants|clinics|practices|pilots|lois|signups|sign-ups|downloads|installs|subscribers|members|accounts|schools|hospitals|brands|sellers|creators|orders|bookings|people on (?:the|our) waitlist|on (?:the|our) waitlist|hotels|gyms|salons|farms|landlords|agencies)|\d[\d,.]*\s?(?:k|m)?\+?\s+(?:[a-z-]+\s+){0,3}on (?:the|our|a) wait-?list|wait-?list of \d|\d+\s?(?:%|percent)\s+(?:month[- ]over[- ]month|week[- ]over[- ]week|mom|wow)|pilots? (?:with|at)\s+[A-Z]|lois?\b|letters of intent|pre-?orders?)/i;
const WEDGE_RE = /\b(starting with|start with|we start|first (?:with|in|for|we)|beachhead|only for|just for|focused on|focus on|niche|one (?:city|state|country|vertical|niche|workflow)|in (?:tokyo|osaka|kyoto|japan|texas|ohio|california|florida|london|berlin|paris|nyc|new york|sf|austin|chicago|seattle|boston|toronto|sydney|singapore|india|brazil|mexico|germany|the uk|the us|europe)|single|specifically)\b/i;
const DISTRIBUTION_RE = /\b(channel|partnerships?|partners? with|partner|resellers?|distributors?|associations?|vendor list|marketplace listing|app store|play store|chrome web store|seo|search traffic|referrals?|referral program|viral|word of mouth|community|newsletter|audience|followers|subscribers|integrations? marketplace|shopify app|plugin directory|sales team|outbound|inbound|plg|product-led|free tool|freemium|content|youtube channel|tiktok|podcast|affiliates?|ambassadors?|sells? through|sold through|selling through|distribut\w+ through|via (?:their|our|the)|bundled with|embedded in|white-?label|trade shows?|conferences?|cold email|ads|kickstarter|indiegogo|product hunt|retail partners?|wholesale|listed (?:on|in|through))\b/i;
const WEAK_CHANNEL_RE = /^(viral|word of mouth|community|content|ads|audience)$/i;
const MOAT_RE = /\b(patents?|patented|proprietary|exclusive|network effects?|switching costs?|lock-?in|unique data|our data|data moat|dataset|years of data|only (?:we|company|one)|first to|hard to copy|regulatory approval|fda|licensed|certified|integrations? with|\d+x (?:faster|cheaper|better)|faster than|cheaper than|unlike|instead of|replaces?|vs\.?|versus)\b/i;
const MECHANISM_RE = /\b(integrat\w*|api|apis|sms|text messages?|texts|whatsapp|line app|emails?|chrome extension|browser extension|extension|plugin|plug-in|plugs? into|slack bot|bot|ios|android|mobile app|app|dashboard|sensors?|device|camera|ocr|scrap\w*|syncs?|syncing|automat\w*|webhooks?|csv|calendar|pos|quickbooks|xero|stripe|salesforce|hubspot|epic|ehr|emr|crm|erp|booking (?:software|system)|voice agent|phone line|kiosk|qr codes?|widget|cli|sdk|open[- ]source|self-hosted|model trained on|fine-tuned|classifier|computer vision|matching|marketplace|subscription box|hardware|wearable|printer|spreadsheet add-?on|google sheets|excel add-?in|drafts?|predicts?|transcrib\w+|summari[sz]\w+|reminders?|tracks?|scans?|detects?|flags?|schedul\w+|translat\w+|generates?|answers? (?:the )?(?:phone|calls))\b/gi;
const BIZ_MODEL_RE = /([$€£¥]\s?\d[\d,.]*\s?(?:k|m)?\s?(?:\/|per|a|each)\s?(?:mo|month|year|yr|seat|user|location|order|booking|clinic|store|site|team|unit|visit|scan|call|transaction|lesson|class|box|week)\b|[$€£¥]\s?\d[\d,.]*\s?(?:k|m)?\s+(?:each|one-time|upfront)\b|\b(?:subscriptions?|per seat|per user|per month|\/mo|commissions?|take rate|transaction fees?|fee per|we charge|charges?|charging|pricing|priced at|licen[cs]e fees?|saas fee|retainer|one-time fee|rev(?:enue)? share)\b)/i;
const WHY_NOW_RE = /\b(new (?:law|regulation|rule|mandate)|regulations?|mandat\w+|since 20\d\d|now that|just (?:launched|changed|became)|deadline|starting (?:in )?20\d\d|from 20\d\d|by 20\d\d|recently|this year|finally possible|costs? (?:have )?dropped)\b/i;
const FOUNDER_FIT_RE = /\b(ex-[a-z]+|former|we(?:'ve| have) (?:built|sold|run|worked|spent)|i (?:ran|built|sold|worked|spent|was a|used to)|years (?:as|at|in|of)|phd|my (?:mom|dad|family|parents|wife|husband|sister|brother)|our team (?:built|ran|has)|founders? (?:who|with|from)|after \d+ years)\b/i;
const HEDGE_RE = /\b(hopefully|maybe|we think|we believe|we hope|try to|trying to|aim to|aiming to|plan to|planning to|someday|eventually|could potentially|potentially|might|would like to|want to|we'll see)\b/gi;
const BROAD_RE = /\b(all-in-one|all in one|everything|end-to-end|one-stop|super ?app|any industry|every industry|all industries|every business|for all|operating system for|os for|platform for everyone|complete suite|full suite|one platform)\b/i;
const AI_RE = /\b(ai|a\.i\.|gpt|llms?|machine learning|artificial intelligence|agentic|ai agents?|chatbot|generative)\b/i;
const OPENER_RE = /^\s*(imagine|what if|picture this|in a world)\b/i;
const ACRONYMS = new Set(["AI", "API", "APIS", "SMS", "B2B", "B2C", "SAAS", "MRR", "ARR", "CRM", "ERP", "POS", "USA", "NYC", "LOI", "LOIS", "CFO", "CTO", "CEO", "COO", "HR", "SEO", "GMV", "DTC", "SMB", "SMBS", "OCR", "EHR", "EMR", "FDA", "HIPAA", "GDPR", "HVAC", "UK", "US", "EU", "IOS", "SDK", "CLI", "QR", "LLM", "LLMS", "GPT", "PLG", "IT", "OK", "CPA", "CPAS", "SDR", "SDRS", "AWS", "GCP", "NFT", "NFTS", "DAO", "KPI", "ROI", "ESG", "EV", "EVS", "IOT", "AR", "VR", "XR", "JST", "PDF", "CSV", "UX", "UI"]);

const BRAND_CASE: Record<string, string> = {
  linkedin: "LinkedIn", tiktok: "TikTok", chatgpt: "ChatGPT", github: "GitHub", youtube: "YouTube", doordash: "DoorDash", paypal: "PayPal", openai: "OpenAI",
  hubspot: "HubSpot", wework: "WeWork", quickbooks: "QuickBooks", turbotax: "TurboTax", masterclass: "MasterClass", onlyfans: "OnlyFans", ebay: "eBay", "uber eats": "Uber Eats",
};
const brand = (raw: string) => BRAND_CASE[raw.toLowerCase()] ?? raw[0].toUpperCase() + raw.slice(1).toLowerCase();

export type Signals = {
  words: number;
  sentences: number;
  comp: string | null;
  blockchain: string[];
  buzzwords: string[];
  vagueAudience: string[];
  persona: string | null;
  namedLogo: string | null;
  pain: string | null;
  quantifiedPain: boolean;
  numbers: string[];
  traction: "strong" | "some" | "none";
  tractionText: string | null;
  wedge: string | null;
  distribution: string | null;
  moat: string | null;
  mechanisms: string[];
  businessModel: string | null;
  whyNow: string | null;
  founderFit: string | null;
  hedges: string[];
  broad: string | null;
  ai: boolean;
  shouting: number;
  exclamations: number;
  opener: string | null;
};

const uniqLower = (xs: string[]) => [...new Set(xs.map((x) => x.toLowerCase().replace(/\s+/g, " ").trim()))];
const first = (re: RegExp, s: string) => s.match(re)?.[0]?.trim() ?? null;

export function normalizePitch(raw: string): string {
  return raw.replace(/\s+/g, " ").trim().slice(0, MAX_PITCH_CHARS);
}

export function splitSentences(text: string): string[] {
  return text
    .replace(/\b(e\.g|i\.e|vs|etc|inc|mr|mrs|dr|st)\./gi, "$1")
    .replace(/(\d)\.(\d)/g, "$1,$2")
    .split(/[.!?]+(?:\s+|$)/)
    .map((s) => s.trim())
    .filter((s) => /[a-z0-9]/i.test(s));
}

export function detect(pitch: string): Signals {
  const text = normalizePitch(pitch);
  const lower = text.toLowerCase();
  const words = text.split(/\s+/).filter((w) => /[a-z0-9]/i.test(w)).length;
  const sentences = splitSentences(text);
  const compMatch = text.match(X_FOR_Y);
  const comp = compMatch ? `${brand(compMatch[1])} for ${compMatch[2].toLowerCase()}` : null;
  // Do not count the comparison's object ("Uber for dog walkers") as a named customer.
  const withoutComp = compMatch ? text.replace(compMatch[0], " ") : text;
  const blockchain = uniqLower(lower.match(BLOCKCHAIN) ?? []);
  const buzzwords = uniqLower(text.match(BUZZ_RE) ?? []);
  const vagueAudience = uniqLower(lower.match(VAGUE_AUDIENCE) ?? []);
  const persona = first(PERSONA_RE, withoutComp) ?? withoutComp.match(GROUP_SUFFIX_RE)?.[0]?.replace(/^for\s+/i, "") ?? null;
  const namedLogo = text.match(NAMED_LOGO_RE)?.[1] ?? null;
  const numbers = uniqLower(text.match(NUMBER_RE) ?? []).filter((n) => /\d/.test(n));
  const painSentence = sentences.find((s) => PAIN_RE.test(s));
  const pain = first(PAIN_RE, text);
  const quantifiedPain = !!painSentence && /\d/.test(painSentence);
  const strong = first(TRACTION_STRONG_RE, text);
  const some = first(TRACTION_RE, text);
  const mechanisms = uniqLower(text.match(MECHANISM_RE) ?? []);
  const shouting = (text.match(/\b[A-Z]{4,}\b/g) ?? []).filter((w) => !ACRONYMS.has(w)).length;
  return {
    words,
    sentences: sentences.length,
    comp,
    blockchain,
    buzzwords,
    vagueAudience,
    persona: persona ? persona.toLowerCase() : null,
    namedLogo,
    pain,
    quantifiedPain,
    numbers,
    traction: strong ? "strong" : some || namedLogo ? "some" : "none",
    tractionText: strong ?? some ?? (namedLogo ? `used by ${namedLogo}` : null),
    wedge: first(WEDGE_RE, text),
    distribution: first(DISTRIBUTION_RE, text),
    moat: first(MOAT_RE, text),
    mechanisms,
    businessModel: [...text.matchAll(new RegExp(BIZ_MODEL_RE.source, "gi"))].map((m) => m[0].trim()).pop() ?? null,
    whyNow: first(WHY_NOW_RE, text),
    founderFit: first(FOUNDER_FIT_RE, text),
    hedges: uniqLower(lower.match(HEDGE_RE) ?? []),
    broad: first(BROAD_RE, text),
    ai: AI_RE.test(text),
    shouting,
    exclamations: (text.match(/!/g) ?? []).length,
    opener: first(OPENER_RE, text),
  };
}

/* ---------------- rubric ---------------- */

export type IssueId =
  | "too_short" | "too_long" | "x_for_y" | "blockchain" | "buzzwords" | "vague_customer" | "no_pain" | "no_numbers" | "no_traction"
  | "no_distribution" | "weak_channel" | "no_moat" | "too_broad" | "ai_handwave" | "no_mechanism" | "hedging" | "hype" | "no_business_model";

export type StrengthId =
  | "specific_customer" | "named_logo" | "pain" | "quantified_pain" | "traction" | "distribution" | "moat" | "wedge" | "mechanism"
  | "business_model" | "why_now" | "founder_fit" | "plain_words";

type Issue = { id: IssueId; label: string; penalties: Weights };
type Strength = { id: StrengthId; label: string; bonus: Weights };

const TRACTION_BY_STAGE: Record<Stage | "none", number> = { idea: 0.5, "pre-seed": 1, seed: 2.5, "series-a": 3.5, growth: 4, none: 1.5 };

function issuesFor(s: Signals, stage: Stage | null, category: Category | null): Issue[] {
  const out: Issue[] = [];
  const add = (id: IssueId, label: string, penalties: Weights, factor = 1) =>
    out.push({ id, label, penalties: Object.fromEntries(Object.entries(penalties).map(([k, v]) => [k, (v as number) * factor])) as Weights });

  if (s.words < 8) add("too_short", "Too short to judge", { vc: 2, customer: 2, cto: 1, competitor: 1, growth: 1.5 });
  if (s.sentences > 5 || s.words > 90) add("too_long", "Too long", { vc: 2, customer: 2, cto: 0.5, growth: 2 });
  if (s.comp) add("x_for_y", `"${s.comp}" comparison`, { vc: 2, customer: 1, cto: 1, competitor: 2.5, growth: 1 });
  if (s.blockchain.length) add("blockchain", "Blockchain without a reason", { vc: 2, customer: 2, cto: 3, competitor: 1, growth: 1 }, category === "crypto" ? 0.3 : 1);
  if (s.buzzwords.length) add("buzzwords", `Buzzwords: ${s.buzzwords.slice(0, 4).join(", ")}`, { vc: 1.5, customer: 2, cto: 1.5, competitor: 0.5, growth: 1 }, Math.min(s.buzzwords.length, 4) * 0.5);
  if (!s.persona && !s.namedLogo) add("vague_customer", "No specific customer", { vc: 2, customer: 2.5, cto: 1, competitor: 1, growth: 3 });
  if (!s.pain) add("no_pain", "No pain or payoff named", { vc: 1.5, customer: 3, cto: 0.5, competitor: 0.5, growth: 1 });
  if (!s.numbers.length) add("no_numbers", "No numbers", { vc: 2, customer: 1, cto: 1, competitor: 0.5, growth: 1 });
  if (s.traction === "none") add("no_traction", "No traction or proof", { vc: TRACTION_BY_STAGE[stage ?? "none"], competitor: 0.5, growth: 0.5 });
  if (!s.distribution) add("no_distribution", "No distribution channel", { vc: 1.5, competitor: 1, growth: 3 });
  else if (WEAK_CHANNEL_RE.test(s.distribution)) add("weak_channel", `Hope is the channel ("${s.distribution.toLowerCase()}")`, { vc: 1, competitor: 0.5, growth: 2.5 });
  if (!s.moat && !s.namedLogo && s.traction !== "strong") add("no_moat", "Nothing hard to copy", { vc: 1, cto: 0.5, competitor: 2.5 });
  if (s.broad) add("too_broad", `Too broad ("${s.broad.toLowerCase()}")`, { vc: 1.5, customer: 1, cto: 2, competitor: 1.5, growth: 1.5 });
  if (s.ai && !s.mechanisms.length && !s.numbers.length) add("ai_handwave", "AI hand-waving", { vc: 1, customer: 1, cto: 2, competitor: 1.5 });
  if (!s.mechanisms.length && !(s.ai && !s.numbers.length) && !s.blockchain.length) add("no_mechanism", "Unclear how it works", { customer: 0.5, cto: 1.5 });
  if (s.hedges.length) add("hedging", `Hedging ("${s.hedges[0]}")`, { vc: 1.5, customer: 1, cto: 0.5, competitor: 0.5, growth: 0.5 }, Math.min(s.hedges.length, 2) * 0.75);
  if (s.shouting > 0 || s.exclamations > 1) add("hype", "Shouting", { vc: 1, customer: 1, cto: 0.5 });
  if (!s.businessModel && s.traction !== "strong") add("no_business_model", "No price or business model", { vc: 1, customer: 0.5, growth: 0.5 });
  return out;
}

function strengthsFor(s: Signals): Strength[] {
  const out: Strength[] = [];
  if (s.persona) out.push({ id: "specific_customer", label: `Specific customer: ${s.persona}`, bonus: { vc: 1, customer: 1.5, cto: 0.5, competitor: 0.5, growth: 1.5 } });
  if (s.namedLogo) out.push({ id: "named_logo", label: `Named customer or pilot: ${s.namedLogo}`, bonus: { vc: 1.5, customer: 1, competitor: 1, growth: 0.5 } });
  if (s.pain) out.push({ id: "pain", label: `Pain or payoff named ("${s.pain.toLowerCase()}")`, bonus: { vc: 0.5, customer: 1, growth: 0.5 } });
  if (s.quantifiedPain) out.push({ id: "quantified_pain", label: "Pain or payoff has a number on it", bonus: { vc: 1, customer: 1.5, cto: 0.5, competitor: 0.5, growth: 0.5 } });
  if (s.traction === "strong") out.push({ id: "traction", label: `Revenue-grade proof ("${s.tractionText}")`, bonus: { vc: 2.5, customer: 1, cto: 0.5, competitor: 1.5, growth: 1.5 } });
  if (s.traction === "some") out.push({ id: "traction", label: `Early proof ("${s.tractionText}")`, bonus: { vc: 1.5, customer: 0.5, competitor: 1, growth: 1 } });
  if (s.distribution && !WEAK_CHANNEL_RE.test(s.distribution)) out.push({ id: "distribution", label: `Distribution ("${s.distribution.toLowerCase()}")`, bonus: { vc: 1, competitor: 0.5, growth: 2 } });
  if (s.moat) out.push({ id: "moat", label: `Edge ("${s.moat.toLowerCase()}")`, bonus: { vc: 1, cto: 0.5, competitor: 2 } });
  if (s.wedge) out.push({ id: "wedge", label: `Wedge ("${s.wedge.toLowerCase()}")`, bonus: { vc: 1, customer: 0.5, cto: 1, competitor: 0.5, growth: 1 } });
  if (s.mechanisms.length) out.push({ id: "mechanism", label: `Concrete mechanism (${s.mechanisms.slice(0, 3).join(", ")})`, bonus: { customer: 0.5, cto: s.mechanisms.length > 1 ? 2.5 : 2, competitor: 0.5 } });
  if (s.businessModel) out.push({ id: "business_model", label: `Price or model ("${s.businessModel}")`, bonus: { vc: 1, customer: 0.5, growth: 0.5 } });
  if (s.whyNow) out.push({ id: "why_now", label: `Why now ("${s.whyNow.toLowerCase()}")`, bonus: { vc: 1, competitor: 0.5 } });
  if (s.founderFit) out.push({ id: "founder_fit", label: `Founder fit ("${s.founderFit.toLowerCase()}")`, bonus: { vc: 1, cto: 0.5, competitor: 0.5 } });
  if (!s.buzzwords.length && s.words >= 12 && s.words <= 70) out.push({ id: "plain_words", label: "Plain words, right length", bonus: { customer: 0.5, cto: 0.5, growth: 0.5 } });
  return out;
}

/* ---------------- lines ---------------- */

type Lines = Partial<Record<IssueId | "good", string[]>>;
const LINES: Record<JudgeId, Lines> = {
  vc: {
    too_short: ["That's a tweet, not a pitch. Give me who, what, and one number.", "I've read longer fortune cookies. Who's it for and what's the proof?"],
    too_long: ["I stopped at sentence three, and so will every partner. One line on who pays, one on proof.", "This is a memo. Cut it to the customer, the pain, and the number."],
    x_for_y: ["\"{comp}\" tells me what you copied, not what you do. What changes for the customer?", "Every \"{comp}\" deck has the same slide two: no customers. Prove me wrong."],
    blockchain: ["What is the blockchain doing here that a database can't? I'm passing on the token.", "Blockchain in this pitch is a red flag in a green font. Cut it unless it is the product."],
    buzzwords: ["\"{buzz}\" is not a business model. Say what it does in words a customer uses.", "I counted the buzzwords before I found the customer. The buzzwords won."],
    vague_customer: ["Built for \"{audience}\" means built for no one in particular. Pick one buyer with a budget.", "Who writes the check? \"{audience}\" doesn't have a corporate card."],
    no_pain: ["Nice feature. What's on fire for the customer that makes this urgent?", "I can't find the pain. No pain, no budget, no round."],
    no_numbers: ["Not one number. Give me users, revenue, pilots, or hours saved. Anything I can underline.", "Zero digits in the whole pitch. My spreadsheet is crying."],
    no_traction: ["Love the vision. Come back when ten strangers have paid for it.", "Where's the proof anyone wants this? A waitlist, a pilot, a pre-order. Anything."],
    weak_channel: ["\"{channel}\" is a hope, not a channel. How do the first 100 customers actually hear about you?"],
    no_distribution: ["Great product, invisible company. How do the first 100 customers hear about you?", "Product sounds fine. Distribution is a shrug. That's the round killer."],
    too_broad: ["An all-in-one for everyone is a nothing-in-particular for no one. What's the wedge?", "\"{broad}\" is a Series D slide. At this stage, win one workflow."],
    hedging: ["\"{hedge}\" isn't a plan. Tell me what you did, not what you hope.", "Too many maybes. I fund \"we did\", not \"we might\"."],
    no_moat: ["What stops someone with $10M from shipping this in a quarter?", "Fine idea. Why you, and why can't the next team copy it?"],
    hype: ["The exclamation points are working harder than the business model.", "Volume isn't traction. Lower the caps, raise the proof."],
    ai_handwave: ["\"AI-powered\" is table stakes now. What does the AI do that someone pays for?", "Every deck says AI. Which step does it do, and how much better?"],
    no_business_model: ["Who pays, how much, and how often? Right now it reads like a hobby.", "No price anywhere. Free is a strategy, not a default."],
    no_mechanism: ["I get the dream. I don't get the product. What does a user actually touch?"],
    good: ["Annoyingly fundable. Send the deck before another fund sees it.", "Specific buyer, real proof, clear channel. I'd take this meeting."],
  },
  customer: {
    too_short: ["I read it twice and still don't know if it's for me.", "That's it? I don't know what it does or what it costs."],
    too_long: ["You lost me at sentence two. I have a business to run.", "Too many words. Tell me what it fixes for me, then stop."],
    x_for_y: ["I don't need an \"{comp}\". I need my problem fixed. Which problem is it?", "Cool comparison. I still don't know what I'd pay you for."],
    blockchain: ["Do I need a wallet for this? Then no.", "I just want it to work. The word blockchain makes me think it won't."],
    buzzwords: ["\"{buzz}\"? Say it the way you'd say it to me at the counter.", "I understood every word and none of the sentence."],
    vague_customer: ["Is this for me? You said \"{audience}\", so I'll assume no.", "When it's for everybody, I figure it's not for me."],
    no_pain: ["What problem does this fix for me this week? I'm not seeing it.", "I don't hate my current way enough to switch. Tell me why I should."],
    no_numbers: ["How much time or money does this save me? Give me a number.", "Better how? Faster how? Put a number on it and I'll listen."],
    too_broad: ["I need one thing done well, not twelve things done okay.", "\"{broad}\" sounds like a long setup call. Pass."],
    hedging: ["\"Might\" and \"hopefully\" don't make me pull out my card.", "You don't sound sure it works. Why should I be?"],
    hype: ["The shouting feels like a late-night ad. Calm down and tell me the price.", "All caps makes me check my wallet is still there."],
    no_business_model: ["What does it cost? If you won't say, I assume too much.", "Free trial, then what? Tell me the price before I fall in love."],
    ai_handwave: ["\"AI\" doesn't help me. What does it do for me at 9 a.m. on Monday?", "I don't care what's under the hood. What gets done for me?"],
    no_mechanism: ["Sounds nice. Is it an app, a text, a person? How do I even use it?"],
    good: ["Okay, that's my exact problem. Where do I sign up?", "Fine. You described my Tuesday. Take my money."],
  },
  cto: {
    too_short: ["Not enough here to know what to build. Even the spec is a stub.", "I can't estimate a sentence fragment. What does v1 actually do?"],
    too_long: ["This pitch has more scope creep than my backlog.", "I count four products in this paragraph. Which one ships first?"],
    x_for_y: ["\"{comp}\" took thousands of engineers. Which tiny slice are you building first?", "Cloning \"{comp}\" means cloning the hard parts too. Which part is yours?"],
    blockchain: ["You've added a distributed ledger where one database table would do. Use Postgres and ship this week.", "Every blockchain feature here is a database row with gas fees."],
    buzzwords: ["\"{buzz}\" isn't an architecture. What actually runs, and where?", "Strip the adjectives and I'm not sure there's a system left."],
    vague_customer: ["Can't design for \"{audience}\". Who's the user and what screen do they open first?", "No user, no requirements. Who am I building for?"],
    no_pain: ["I can build it. I just can't tell what it fixes, so I can't tell when it's done.", "No problem statement means no definition of done."],
    no_numbers: ["No numbers means no requirements. How many users, how fast, how accurate?", "Give me one metric to build against, or I'll gold-plate everything."],
    too_broad: ["\"{broad}\" means I'm building twelve products with one team. Pick one workflow.", "End-to-end everything is how a 3-month build becomes 3 years."],
    ai_handwave: ["Which model, doing which step, on what data? \"AI-powered\" compiles to nothing.", "Wrapping a model is a weekend. Say what's actually hard to build here."],
    no_mechanism: ["Sounds nice. How does it work: an app, an integration, a text message?", "I can't find the product in the pitch. What's the first screen or the first API call?"],
    hedging: ["\"We plan to\" is not a commit. What's actually shipped?", "Roadmap tense everywhere. What runs in production today?"],
    hype: ["Caps lock is not a feature flag.", "Less shouting, more spec."],
    good: ["Narrow scope, clear mechanism. I could ship a v1 in a sprint. Annoying.", "Boring tech, clear job. That's a compliment."],
  },
  competitor: {
    too_short: ["I can't even tell what to copy. Honestly, respect.", "So vague I can't steal it. Customers can't buy it either."],
    x_for_y: ["Thanks. I'm building \"{comp}\" too, but with a better font.", "If your pitch is a comparison, my pitch is the same comparison, cheaper."],
    no_moat: ["Nothing here I can't clone by Friday. Thanks for the roadmap.", "No data, no network, no lock-in. See you on Product Hunt next week."],
    vague_customer: ["Go chase \"{audience}\". I'll take the one niche you ignored and own it.", "You're aiming at everyone, so I'll pick off your best segment."],
    too_broad: ["While you build the all-in-one, I'll win the one feature people pay for.", "You're building a suite. I'm building the part they actually use."],
    blockchain: ["Keep the token. I'll ship the same thing without one and win on price.", "The chain is your moat? My database says hi."],
    ai_handwave: ["We all use the same models. Your AI is my AI with a different logo.", "Same API, same prompts, same pitch. What's yours alone?"],
    weak_channel: ["Enjoy waiting for \"{channel}\". I'm buying the keywords tomorrow."],
    no_distribution: ["Nice product. I have the better channel, so I win anyway.", "You'll build it, I'll sell it. Guess who gets the customer."],
    buzzwords: ["Love the buzzwords. Customers can't tell us apart, and I have more budget.", "Your copy sounds like mine. That's bad news for the smaller one."],
    no_traction: ["No customers yet? Perfect, the market's still open for me.", "No proof means no head start. We're both at zero."],
    too_long: ["Thanks for the detailed plan. I'll start on step one tonight."],
    hedging: ["You \"might\". I already did.", "While you plan to, I'm shipping."],
    good: ["Ugh. Real customers and a channel I can't easily buy. I'm worried.", "Fine, this one's hard to copy. I'll go bother someone else."],
  },
  growth: {
    too_short: ["Short is good. Empty is not. Add who it's for and why they'd share it.", "There's no hook here yet. Who stops scrolling for this?"],
    too_long: ["If it doesn't fit in a tweet, it won't fit in an ad. Cut it in half.", "Nobody reads paragraph pitches on a phone. One line."],
    x_for_y: ["\"{comp}\" is a deck shortcut, not a hook. Nobody searches for that.", "Customers don't type \"{comp}\" into Google. What do they type?"],
    blockchain: ["\"Blockchain\" halves your audience and doubles your support tickets.", "Every crypto word costs you a normal customer."],
    buzzwords: ["Nobody types \"{buzz}\" into a search bar. Use the words customers use.", "Buzzwords have a 0% click-through rate. Say the outcome."],
    vague_customer: ["You can't buy ads for \"{audience}\". Name a group I can find in one search.", "Who do I target? \"{audience}\" has a CPM of infinity."],
    no_pain: ["No pain means no hook. What would make someone stop scrolling?", "I can't write a headline without a problem to put in it."],
    no_numbers: ["Give me a number for the headline. \"38% fewer no-shows\" sells. \"Better\" doesn't.", "No stat, no screenshot, no share. Find one number."],
    no_traction: ["Even a waitlist number helps. Start collecting emails today.", "No proof to show. Get ten users and quote them."],
    weak_channel: ["\"{channel}\" is what you say when there's no plan. Name a channel you control.", "\"{channel}\" starts after customer #10 talks. Who brings customers #1 to #10?"],
    no_distribution: ["Where does user #100 come from? Word of mouth doesn't count until user #10 talks.", "No channel in sight. Build the audience or the partnership before the app."],
    too_broad: ["One-stop shop means a one-line ad that says nothing. Lead with one job.", "I can't market everything. Give me the one thing to shout about."],
    hedging: ["\"{hedge}\" is not a launch plan.", "Pick a channel and commit. Maybes don't convert."],
    no_business_model: ["No price means I can't plan the funnel. What does a customer pay?"],
    good: ["Clear buyer, clear channel. I know exactly where to spend the first $500.", "I can already see the landing page headline. Good sign."],
  },
};

/* ---------------- one change ---------------- */

type Change = { title: string; fix: (s: Signals) => string };
const CHANGES: Record<IssueId | StrengthId, Change> = {
  too_short: { title: "Say more: who, pain, proof", fix: () => "Write two sentences: who it's for and the pain they have, then one proof point (a number, a pilot, a waitlist)." },
  too_long: { title: "Cut it to two sentences", fix: () => "Keep only the customer, the pain with a number, and one proof point. Everything else goes to the follow-up." },
  x_for_y: { title: "Drop the comparison", fix: (s) => `Delete "${s.comp}". Say what it does in plain words: who it's for, what job it does, and what changes for them.` },
  blockchain: { title: "Cut the blockchain", fix: () => "Remove the blockchain unless the customer can't get the result without it. Pitch the outcome, not the stack." },
  buzzwords: { title: "Delete the buzzwords", fix: (s) => `Cut ${s.buzzwords.slice(0, 4).map((b) => `"${b}"`).join(", ")} and replace each with what the product actually does.` },
  vague_customer: { title: "Name exactly who pays", fix: () => "Replace the broad audience with one buyer: \"independent dental clinics in Ohio\" beats \"businesses\". Narrow is a feature." },
  no_pain: { title: "Name the pain, with a cost", fix: () => "Say the pain in the customer's words and put a cost on it, e.g. \"clinics lose $4,000 a month to no-shows\"." },
  no_numbers: { title: "Add one real number", fix: () => "Add a single true number: paying users, revenue, pilots, a waitlist, hours saved, or money lost to the problem." },
  no_traction: { title: "Show proof someone wants it", fix: () => "Add one proof point, even a small one: a waitlist count, a pilot, a pre-order, or a paying customer." },
  weak_channel: { title: "Replace hope with a channel", fix: (s) => `"${s.distribution}" is not a plan. Name one channel you control: a partner, an association, a marketplace listing, SEO, or a free tool.` },
  no_distribution: { title: "Say how the first 100 find you", fix: () => "Name one channel you can own: a partner, an association, a marketplace listing, a community, SEO, or a free tool." },
  no_moat: { title: "Say why you can't be copied", fix: () => "Add one line on your edge: unique data, a network effect, an exclusive partner, founder insight, or a hard integration." },
  too_broad: { title: "Pick one wedge", fix: (s) => `Replace "${s.broad}" with one customer, one job, and one channel. Expand after you win that.` },
  ai_handwave: { title: "Say what the AI actually does", fix: () => "Name the step the AI does and how much better it is, e.g. \"drafts the insurance appeal in 2 minutes instead of 40\"." },
  no_mechanism: { title: "Say how it works", fix: () => "Name the thing a user touches: an app, a text message, an integration with the tool they already use." },
  hedging: { title: "Cut the maybes", fix: (s) => `Replace "${s.hedges[0] ?? "maybe"}" with what you have already done. Past tense beats future tense.` },
  hype: { title: "Lower the volume", fix: () => "Drop the caps and exclamation points. Let one hard number do the shouting." },
  no_business_model: { title: "Put a price on it", fix: () => "Say who pays and how much, e.g. \"$199 a month per clinic\". A price makes the whole pitch more believable." },
  specific_customer: { title: "Name exactly who pays", fix: () => "Name one buyer you can find in a single search." },
  named_logo: { title: "Name a real customer or pilot", fix: () => "If a real company is piloting or paying, name it (with permission). One logo beats ten adjectives." },
  pain: { title: "Name the pain", fix: () => "Say what hurts for the customer today, in their words." },
  quantified_pain: { title: "Put a number on the pain", fix: () => "Add what the problem costs: hours a week, money a month, or customers lost." },
  traction: { title: "Show proof someone wants it", fix: () => "Add your best proof point: paying customers, revenue, pilots, or a waitlist." },
  distribution: { title: "Say how the first 100 find you", fix: () => "Name the one channel that brings customers in." },
  moat: { title: "Say why you can't be copied", fix: () => "Add one line on what a funded competitor couldn't copy in a quarter: data, network, partner, or insight." },
  wedge: { title: "Name your first wedge", fix: () => "Say where you start: one city, one niche, or one workflow." },
  mechanism: { title: "Say how it works", fix: () => "Name what the user touches: an app, a text, an integration." },
  business_model: { title: "Put a price on it", fix: () => "Say who pays and how much." },
  why_now: { title: "Add a why-now", fix: () => "Say what changed recently (a law, a cost drop, a new platform) that makes this possible or urgent now." },
  founder_fit: { title: "Say why you", fix: () => "Add one line on why you're the one to build it: years in the industry, a past build, or a personal story." },
  plain_words: { title: "Say it plainly", fix: () => "Rewrite in the words a customer would use." },
};

/* ---------------- verdict ---------------- */

export const VERDICTS = [
  { min: 42, label: "FUND IT", line: "Take the meeting. Annoyingly fundable." },
  { min: 34, label: "SHARPEN IT", line: "Close. One change away from a real meeting." },
  { min: 25, label: "REWRITE IT", line: "A coffee chat, not a term sheet." },
  { min: 15, label: "ROASTED", line: "Well done. Not in the good way." },
  { min: 0, label: "BURNT TO A CRISP", line: "Start over from the customer's pain." },
] as const;

export function verdictFor(total: number) {
  return VERDICTS.find((v) => total >= v.min) ?? VERDICTS[VERDICTS.length - 1];
}

/* ---------------- main ---------------- */

export type JudgeResult = { id: JudgeId; name: string; tagline: string; score: number; roast: string; wants: string };
export type RoastResult = {
  pitch: string;
  stage: Stage | null;
  category: Category | null;
  judges: JudgeResult[];
  total: number;
  outOf: 50;
  average: number;
  verdict: { label: string; line: string };
  oneChange: { id: IssueId | StrengthId; title: string; fix: string; pointsGained: number; totalAfter: number; rubricWeight: number };
  issues: { id: IssueId; label: string }[];
  strengths: { id: StrengthId; label: string }[];
  signals: Signals;
};

export function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

const JUDGE_IDS: JudgeId[] = ["vc", "customer", "cto", "competitor", "growth"];
const PRIORITY: (IssueId | StrengthId)[] = [
  "too_short", "x_for_y", "blockchain", "vague_customer", "no_pain", "too_broad", "no_traction", "no_numbers", "buzzwords", "ai_handwave",
  "no_distribution", "weak_channel", "too_long", "hedging", "no_moat", "no_mechanism", "no_business_model", "hype",
  "quantified_pain", "traction", "named_logo", "moat", "distribution", "wedge", "why_now", "founder_fit", "business_model", "mechanism",
  "specific_customer", "pain", "plain_words",
];
const rank = (id: string) => PRIORITY.indexOf(id as IssueId);
const clampScore = (n: number) => Math.max(1, Math.min(10, Math.round(n)));
const BASE = 5;

/** Penalties stack with diminishing weight, so ten small problems don't count ten times. */
export const PENALTY_DECAY = [1, 0.7, 0.5, 0.35, 0.25, 0.2, 0.15, 0.1];

function judgeScores(issues: Issue[], strengths: Strength[]): Record<JudgeId, number> {
  const out = {} as Record<JudgeId, number>;
  for (const j of JUDGE_IDS) {
    const plus = strengths.reduce((a, s) => a + (s.bonus[j] ?? 0), 0);
    const minus = issues
      .map((i) => i.penalties[j] ?? 0)
      .sort((a, b) => b - a)
      .reduce((a, p, k) => a + p * (PENALTY_DECAY[k] ?? 0.1), 0);
    out[j] = clampScore(BASE + plus - minus);
  }
  return out;
}

const GENERIC_NO_BUYER = "No buyer named. Who exactly is this for, and where do I find ten of them?";

function fill(line: string, s: Signals): string {
  return line
    .replace(/\{comp\}/g, s.comp ?? "X for Y")
    .replace(/\{buzz\}/g, s.buzzwords[0] ?? "synergy")
    .replace(/\{audience\}/g, s.vagueAudience[0] ?? "everyone")
    .replace(/\{hedge\}/g, s.hedges[0] ? s.hedges[0][0].toUpperCase() + s.hedges[0].slice(1) : "Maybe")
    .replace(/\{channel\}/g, s.distribution ? s.distribution[0].toUpperCase() + s.distribution.slice(1).toLowerCase() : "Word of mouth")
    .replace(/\{broad\}/g, s.broad ? s.broad.toLowerCase() : "all-in-one");
}

export function parseStage(v: unknown): Stage | null {
  const s = typeof v === "string" ? v.trim().toLowerCase().replace(/\s+/g, "-") : "";
  return (STAGES as readonly string[]).includes(s) ? (s as Stage) : null;
}
export function parseCategory(v: unknown): Category | null {
  const s = typeof v === "string" ? v.trim().toLowerCase().replace(/\s+/g, "-") : "";
  return (CATEGORIES as readonly string[]).includes(s) ? (s as Category) : null;
}

export function roast(rawPitch: string, stage: Stage | null = null, category: Category | null = null): RoastResult {
  const pitch = normalizePitch(rawPitch);
  const s = detect(pitch);
  const issues = issuesFor(s, stage, category);
  const strengths = strengthsFor(s);
  const scores = judgeScores(issues, strengths);
  const h = hash(pitch.toLowerCase());

  const judges: JudgeResult[] = JUDGES.map((j, idx) => {
    const lines = LINES[j.id];
    const score = scores[j.id];
    let key: IssueId | "good" = "good";
    if (score < 8) {
      const ranked = issues
        .filter((i) => lines[i.id] && (i.penalties[j.id] ?? 0) > 0)
        .sort((a, b) => (b.penalties[j.id] ?? 0) - (a.penalties[j.id] ?? 0) || rank(a.id) - rank(b.id));
      if (ranked[0]) key = ranked[0].id;
    }
    // A judge with no complaints but a middling score still says something useful.
    if (key === "good" && score < 8) {
      const missing: IssueId = !s.moat ? "no_moat" : s.traction === "none" ? "no_traction" : !s.distribution ? "no_distribution" : "no_numbers";
      key = lines[missing] ? missing : "good";
    }
    let pool = lines[key] ?? lines.good!;
    if (!s.vagueAudience.length) pool = pool.filter((l) => !l.includes("{audience}"));
    if (!pool.length) pool = [GENERIC_NO_BUYER];
    return { id: j.id, name: j.name, tagline: j.tagline, wants: j.wants, score, roast: fill(pool[(h >>> idx) % pool.length], s) };
  });

  const total = judges.reduce((a, j) => a + j.score, 0);

  // ONE change: the fix that would add the most points across all five judges.
  type Cand = { id: IssueId | StrengthId; after: number; weight: number };
  const sumW = (w: Weights) => JUDGE_IDS.reduce((a, j) => a + (w[j] ?? 0), 0);
  const cands: Cand[] = issues.map((i) => {
    const after = judgeScores(issues.filter((x) => x.id !== i.id), strengths);
    return { id: i.id, after: JUDGE_IDS.reduce((a, j) => a + after[j], 0), weight: sumW(i.penalties) };
  });
  if (!cands.length) {
    const have = new Set(strengths.map((x) => x.id));
    const hypothetical: Strength[] = [
      { id: "moat", label: "", bonus: { vc: 1, cto: 0.5, competitor: 2 } },
      { id: "traction", label: "", bonus: { vc: 2.5, customer: 1, cto: 0.5, competitor: 1.5, growth: 1.5 } },
      { id: "distribution", label: "", bonus: { vc: 1, competitor: 0.5, growth: 2 } },
      { id: "quantified_pain", label: "", bonus: { vc: 1, customer: 1.5, cto: 0.5, competitor: 0.5, growth: 0.5 } },
      { id: "named_logo", label: "", bonus: { vc: 1.5, customer: 1, competitor: 1, growth: 0.5 } },
      { id: "why_now", label: "", bonus: { vc: 1, competitor: 0.5 } },
      { id: "founder_fit", label: "", bonus: { vc: 1, cto: 0.5, competitor: 0.5 } },
      { id: "wedge", label: "", bonus: { vc: 1, customer: 0.5, cto: 1, competitor: 0.5, growth: 1 } },
    ].filter((x) => !have.has(x.id as StrengthId)) as Strength[];
    for (const x of hypothetical) {
      const after = judgeScores(issues, [...strengths, x]);
      cands.push({ id: x.id, after: JUDGE_IDS.reduce((a, j) => a + after[j], 0), weight: sumW(x.bonus) });
    }
  }
  // Most visible points first, then the heaviest rubric weight, then a fixed priority order.
  cands.sort((a, b) => b.after - a.after || b.weight - a.weight || rank(a.id) - rank(b.id));
  const best = cands[0] ?? { id: "why_now" as const, after: total, weight: 0 };
  const change = CHANGES[best.id];

  return {
    pitch,
    stage,
    category,
    judges,
    total,
    outOf: 50,
    average: Math.round((total / 5) * 10) / 10,
    verdict: { label: verdictFor(total).label, line: verdictFor(total).line },
    oneChange: { id: best.id, title: change.title, fix: change.fix(s), pointsGained: Math.max(0, best.after - total), totalAfter: Math.max(total, best.after), rubricWeight: Math.round(best.weight * 2) / 2 },
    issues: issues.map(({ id, label }) => ({ id, label })),
    strengths: strengths.map(({ id, label }) => ({ id, label })),
    signals: s,
  };
}

export const EXAMPLES = [
  { label: "The classic", pitch: "Uber for dog walkers, but on the blockchain.", stage: "idea" as Stage, category: "marketplace" as Category },
  { label: "Buzzword soup", pitch: "We are building a revolutionary AI-powered platform that empowers everyone to seamlessly unlock their potential. It is an all-in-one ecosystem.", stage: "pre-seed" as Stage, category: "ai" as Category },
  { label: "Getting there", pitch: "Restaurants waste food every night. We built an app that predicts how much to prep. We plan to grow through word of mouth.", stage: "pre-seed" as Stage, category: "b2b-saas" as Category },
  { label: "Fundable", pitch: "Dental clinics in Ohio lose about $4,000 a month to no-shows. Our SMS reminder bot plugs into their booking software and cut no-shows 38% across 12 paying clinics at $199/month. We sell through the state dental association's vendor list.", stage: "seed" as Stage, category: "b2b-saas" as Category },
];
