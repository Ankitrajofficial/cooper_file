// Shared "human enhancement" layer for AI-generated reviews.
//
// Two parts work together:
//   1. Prompt guidance (HUMAN_TONE_GUIDANCE + SEO_GUIDANCE) steers the model
//      toward plain, human-sounding, locally-searchable text.
//   2. humanizeReviewText() is a deterministic safety net that rewrites the
//      "heavy"/AI-slop words the model still slips in into everyday words, so
//      the output reads like a real person typed it on their phone.

// Injected into the system prompt of every review generation. Tells the model
// to sound like a normal customer and to stay away from fancy vocabulary.
export const HUMAN_TONE_GUIDANCE = [
  "Write exactly like a real customer quickly typing a Google review on their phone: plain, everyday words, relaxed, and specific.",
  "Use simple language a normal person would actually say out loud. Contractions are good (it's, they're, didn't, I'd).",
  "Vary how each review opens and how long it runs. A little casual or understated is fine and reads as more real.",
  "Never sound like an ad, a brochure, a press release, or AI.",
  "Do NOT use fancy or heavy words. Avoid words like: exceptional, exemplary, impeccable, immaculate, unparalleled, seamless, meticulous, phenomenal, commendable, exquisite, delectable, plethora, myriad, epitome, pristine, superb, sublime, top-notch, world-class, unwavering, nestled, bustling, vibrant, unforgettable, flawless.",
  "Prefer plain swaps like: great, really good, clean, smooth, friendly, helpful, worth it, tasty, lovely, easy.",
].join(" ");

// Injected alongside the tone guidance. Keeps reviews useful for local Google
// Business Profile ranking without keyword stuffing.
export const SEO_GUIDANCE = [
  "To help the business show up in local Google searches, let reviews naturally include the words locals would actually type: the city or area, the type of service or product, and sometimes the business name.",
  "Weave these in the way a real person would mention them, not as a keyword list.",
  "Never keyword-stuff, and never repeat the business name in every review.",
].join(" ");

// Whole-word, case-insensitive swaps applied after generation. Every value is a
// plain word that reads naturally in the same slot as the heavy word, so the
// replacement never needs surrounding grammar changes. Keep this list to safe
// like-for-like swaps (adjective->adjective, adverb->adverb, noun->noun).
const HEAVY_WORD_REPLACEMENTS: Record<string, string> = {
  exceptional: "great",
  exceptionally: "really",
  exemplary: "great",
  impeccable: "spotless",
  impeccably: "perfectly",
  immaculate: "spotless",
  unparalleled: "amazing",
  seamless: "smooth",
  seamlessly: "smoothly",
  meticulous: "careful",
  meticulously: "carefully",
  phenomenal: "amazing",
  commendable: "great",
  exquisite: "lovely",
  delectable: "tasty",
  scrumptious: "tasty",
  plethora: "plenty",
  myriad: "lots",
  pristine: "clean",
  superb: "great",
  sublime: "great",
  "top-notch": "great",
  "top-tier": "great",
  "world-class": "great",
  unwavering: "steady",
  bustling: "busy",
  vibrant: "lively",
  delightful: "lovely",
  unforgettable: "memorable",
  flawless: "perfect",
  flawlessly: "perfectly",
};

const HEAVY_WORD_PATTERN = new RegExp(
  `\\b(${Object.keys(HEAVY_WORD_REPLACEMENTS)
    .map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|")})\\b`,
  "gi",
);

function matchCase(source: string, replacement: string) {
  // Preserve a leading capital (start of sentence / proper-ish usage). Heavy
  // words here are never all-caps in practice, so only the first letter matters.
  const first = source.charAt(0);
  if (first && first === first.toUpperCase() && first !== first.toLowerCase()) {
    return replacement.charAt(0).toUpperCase() + replacement.slice(1);
  }
  return replacement;
}

/**
 * Rewrites heavy / AI-slop words into everyday words and tidies whitespace, so
 * a generated review reads like a real customer wrote it. Deterministic and
 * safe to run on any generated text.
 */
export function humanizeReviewText(text: string) {
  return text
    .replace(HEAVY_WORD_PATTERN, (match) =>
      matchCase(match, HEAVY_WORD_REPLACEMENTS[match.toLowerCase()]),
    )
    .replace(/\s+/g, " ")
    .trim();
}
