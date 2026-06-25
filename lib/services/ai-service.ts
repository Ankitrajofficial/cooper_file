import OpenAI from "openai";
import type { ZodType } from "zod";
import { zodResponseFormat, zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import Review from "@/models/Review";
import Client from "@/models/Client";
import { connectToDatabase } from "@/lib/db";
import { getCategoriesForSector } from "@/lib/services/review-service";
import { REVIEW_CATEGORIES, type BusinessSector } from "@/types";

const GeneratedReviewsSchema = z.object({
  reviews: z
    .array(
      z.object({
        category: z.enum(REVIEW_CATEGORIES),
        text: z.string().min(40).max(320),
      }),
    )
    .min(10)
    .max(50),
});

type ReviewAiProvider = {
  name: "openai" | "grok" | "groq";
  client: OpenAI;
  model: string;
};

// Provider is selected globally via REVIEW_AI_PROVIDER. Grok (xAI) and Groq
// (GroqCloud) both expose an OpenAI-compatible API but only support Chat
// Completions, not the Responses API, so they take a different parse path
// below than the default OpenAI provider.
function getReviewAiProvider(): ReviewAiProvider {
  const provider = (process.env.REVIEW_AI_PROVIDER || "openai").trim().toLowerCase();

  if (provider === "groq" || provider === "groqcloud") {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("Missing GROQ_API_KEY environment variable.");
    }

    return {
      name: "groq",
      client: new OpenAI({
        apiKey: process.env.GROQ_API_KEY,
        baseURL: process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1",
      }),
      // Must be a Groq model that supports JSON-schema structured outputs.
      // (llama-3.3-70b-versatile does NOT; gpt-oss-20b does.)
      model: process.env.GROQ_MODEL || "openai/gpt-oss-20b",
    };
  }

  if (provider === "grok" || provider === "xai") {
    if (!process.env.XAI_API_KEY) {
      throw new Error("Missing XAI_API_KEY environment variable.");
    }

    return {
      name: "grok",
      client: new OpenAI({
        apiKey: process.env.XAI_API_KEY,
        baseURL: process.env.XAI_BASE_URL || "https://api.x.ai/v1",
      }),
      model: process.env.XAI_MODEL || "grok-4-fast",
    };
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY environment variable.");
  }

  return {
    name: "openai",
    client: new OpenAI({ apiKey: process.env.OPENAI_API_KEY }),
    model: process.env.OPENAI_MODEL || "gpt-5.4-mini",
  };
}

async function parseStructuredReviews<T extends ZodType>(
  provider: ReviewAiProvider,
  schema: T,
  schemaName: string,
  systemPrompt: string,
  userPrompt: string,
): Promise<z.infer<T> | null> {
  if (provider.name !== "openai") {
    const completion = await provider.client.chat.completions.parse({
      model: provider.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: zodResponseFormat(schema, schemaName),
    });

    return completion.choices[0]?.message.parsed ?? null;
  }

  const response = await provider.client.responses.parse({
    model: provider.model,
    input: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    text: {
      format: zodTextFormat(schema, schemaName),
    },
  });

  return response.output_parsed ?? null;
}

const CustomerReviewOptionsSchema = z.object({
  reviews: z
    .array(
      z.object({
        // Floor kept low so short, natural one-line reviews are not rejected.
        text: z.string().min(20).max(420),
      }),
    )
    .length(2),
});

export async function generateReviewsForClient(options: {
  clientId: string;
  businessName: string;
  city: string;
  sector: BusinessSector;
  industry: string;
  businessDescription?: string;
  count?: number;
}) {
  const provider = getReviewAiProvider();

  await connectToDatabase();

  const targetCount = Math.max(10, Math.min(options.count ?? 40, 50));
  const categories = getCategoriesForSector(options.sector);
  const businessDescription = options.businessDescription?.trim();

  const parsed = await parseStructuredReviews(
    provider,
    GeneratedReviewsSchema,
    "generated_reviews",
    "You write polished Google Business Profile review scripts for real customers. Keep the tone natural, helpful, believable, and SEO aware. Avoid repetition, avoid exaggerated claims, and make every review distinct enough that repeated visitors do not see near-duplicates.",
    `Generate ${targetCount} unique review scripts for ${options.businessName}, a ${options.industry} business in ${options.city}. The broad business sector is ${options.sector}. Niche guidance: ${getNicheGuidance(
      options.sector,
      options.industry,
    )} Split the reviews across these categories only: ${categories.join(
      ", ",
    )}. Most reviews should feel human, be 2-4 sentences, sound different from the others, and naturally include high-value local SEO phrases tied to ${options.city}, ${options.industry}, and ${options.sector}. The exception is the "One-liner" category: every review in that category must be exactly one short, punchy sentence (roughly 5-15 words) that still reads like a genuine customer. Prioritize keywords a real Google Business Profile review could naturally contain, without keyword stuffing. Reflect the real business context, audience, strengths, and experience based on this description when it is useful: ${businessDescription || "No extra description was provided, so infer sensible specifics from the business name, city, sector, and industry."} Focus on believable details, not generic praise. Do not use quotation marks, emojis, numbered lists, placeholders, or repeated opening sentences.`,
  );

  if (!parsed) {
    throw new Error("The review AI provider did not return structured reviews.");
  }

  await Review.deleteMany({ clientId: options.clientId });

  await Review.insertMany(
    parsed.reviews.map((review) => ({
      clientId: options.clientId,
      category: review.category,
      text: review.text.trim(),
    })),
  );

  await Client.findByIdAndUpdate(options.clientId, {
    sector: options.sector,
    industry: options.industry,
    businessDescription: businessDescription || "",
  });

  return parsed.reviews.length;
}

// Niche-specific cues so the model writes the concrete details a real customer
// of THIS kind of business would naturally mention, instead of generic praise.
const NICHE_GUIDANCE: Record<BusinessSector, string> = {
  Hotel:
    "Draw on what hotel guests notice: room cleanliness and comfort, quality of beds and linen, smooth check-in/check-out, helpful and courteous staff, location and accessibility, breakfast or food, and overall value for the stay.",
  Hostel:
    "Draw on what hostel residents notice: affordability and value, safety and security, a calm study/work-friendly environment, cleanliness of rooms and shared spaces, mess/food quality, and the sense of community and location.",
  Restaurant:
    "Draw on what diners notice: taste and freshness of the food, menu variety, portion sizes, presentation, speed and warmth of service, ambience and seating, hygiene, and value for money.",
  Cafe:
    "Draw on what cafe visitors notice: quality of coffee and beverages, snacks and desserts, a cozy ambience to relax or work, wifi and seating, music, and friendly baristas.",
  "Doctor Clinic":
    "Draw on what patients notice: the doctor's attentiveness, clear explanations, caring and reassuring approach, accuracy and thoroughness of the consultation, clinic cleanliness, and feeling well looked after. Never criticise the doctor or the treatment.",
  Education:
    "Draw on what students and parents notice: teaching quality, supportive and knowledgeable faculty, a focused study environment, visible improvement or results, facilities, and value for the fees.",
  "Fitness Gym":
    "Draw on what gym members notice: quality and variety of equipment, knowledgeable trainers and personal coaching, cleanliness and hygiene, a motivating atmosphere, flexible timings, and membership value.",
  "Salon Spa":
    "Draw on what salon/spa clients notice: the skill of the stylist or therapist, the results of the treatment, hygiene and cleanliness, a relaxing ambience, the products used, and value for the service.",
  "Retail Shop":
    "Draw on what shoppers notice: product range and quality, fair pricing and value, helpful and non-pushy staff, easy store layout, stock availability, and a smooth billing experience.",
  "Real Estate":
    "Draw on what clients notice: the agent's market knowledge and transparency, range of property options, a smooth and well-guided process, honest advice, responsiveness, and trustworthiness.",
  NGO:
    "Draw on what supporters, volunteers, and beneficiaries notice: the genuine impact and outcomes of the work, transparency and honest use of funds, the dedication and warmth of the team and volunteers, how welcoming and organised the programs are, and the trust the organisation has earned in the community.",
  "General Business":
    "Draw on what customers notice: professionalism, reliability, quality of service, clear communication, responsiveness, and overall value.",
};

function getNicheGuidance(sector: BusinessSector, industry: string) {
  return `${NICHE_GUIDANCE[sector] ?? NICHE_GUIDANCE["General Business"]} Tailor every review to a "${industry}" specifically, weaving in details a genuine ${industry} customer would mention. Do not use details that would not fit this niche.`;
}

// Business policy mirrors the template rules in review-service.ts: every rating
// produces a POSITIVE review. For Doctor Clinic the doctor is never criticised,
// and any soft 3-star note is pointed at the front desk / wait time only.
function getRatingInstruction(rating: number, sector: BusinessSector) {
  const isDoctor = sector === "Doctor Clinic";

  if (rating >= 4) {
    return isDoctor
      ? "The customer selected a high rating. Write two warm, confident reviews praising the doctor as attentive, professional, and thorough, and recommend the clinic. Do not criticise the doctor or the clinic."
      : "The customer selected a high rating. Write two warm, confident reviews that sound genuinely happy with the service and recommend the business strongly.";
  }

  if (rating === 3) {
    return isDoctor
      ? "The customer selected 3 stars, but keep BOTH reviews positive overall and protect the doctor's reputation. Praise the doctor's care as excellent and reassuring. You may add ONE small, polite note ONLY about the front desk or wait time — never about the doctor or the treatment — and end on a positive, recommending tone."
      : "The customer selected 3 stars, but keep BOTH reviews positive overall. Praise the core service as great and professional. You may add ONE small, polite note ONLY about the front desk or wait time — never about the core service — and end on a positive, recommending tone.";
  }

  // 1-2 stars: still kept positive per business policy.
  return isDoctor
    ? "The customer selected a low rating, but business policy is to keep the review positive, reassuring, and never critical of the doctor. Write two genuinely positive reviews describing attentive, caring, professional treatment that the customer would be happy to post. Do not mention any negatives."
    : "The customer selected a low rating, but business policy is to keep the review positive and reassuring. Write two genuinely positive reviews describing a professional, dependable, worthwhile experience that the customer would be happy to post. Do not mention any negatives.";
}

export async function generateCustomerReviewOptions(options: {
  businessName: string;
  city: string;
  sector: BusinessSector;
  industry: string;
  businessDescription?: string;
  rating: number;
}) {
  const provider = getReviewAiProvider();
  const businessDescription = options.businessDescription?.trim();
  // A throwaway seed nudges the model to produce different wording on every
  // click, so re-selecting the same rating never repeats the same reviews.
  const variationSeed = Math.random().toString(36).slice(2, 10);
  // Randomise the length mix each click so the two options feel natural:
  // sometimes both short, sometimes mixed, sometimes both fuller. Mixed is
  // weighted highest because that reads most like real Google reviews.
  const LENGTH_STYLES = [
    "Make BOTH options a single short, natural sentence of about 8-15 words.",
    "Make the FIRST option a single short, natural sentence of about 8-15 words, and the SECOND a fuller 2-3 sentence review.",
    "Make the FIRST option a fuller 2-3 sentence review, and the SECOND a single short, natural sentence of about 8-15 words.",
    "Make the FIRST option a single short, natural sentence of about 8-15 words, and the SECOND a fuller 2-3 sentence review.",
    "Make BOTH options natural 2-4 sentence reviews.",
  ];
  const lengthStyle =
    LENGTH_STYLES[Math.floor(Math.random() * LENGTH_STYLES.length)];

  const parsed = await parseStructuredReviews(
    provider,
    CustomerReviewOptionsSchema,
    "customer_review_options",
    "You write Google Business Profile review text for a real customer. Follow the tone instruction exactly. Keep it natural, specific, paste-ready, and believable, and make every generation fresh with clearly different wording, structure, and opening from any other. Do not invent exact facts, names, prices, dates, discounts, medical outcomes, guarantees, or claims that were not provided. Do not use emojis, quotation marks, hashtags, numbered lists, or placeholders.",
    `${getRatingInstruction(options.rating, options.sector)}

Business name: ${options.businessName}
City: ${options.city}
Business sector: ${options.sector}
Specific industry: ${options.industry}
Niche guidance: ${getNicheGuidance(options.sector, options.industry)}
Business context: ${businessDescription || "No extra context was provided. Infer only broad, sensible details from the business name, city, sector, and industry."}

Return exactly 2 different review options. ${lengthStyle} Keep them easy for a customer to paste into Google, and naturally include the business name or city only when it sounds human. A short option must still read like a real customer, not a slogan. Vary the phrasing and length on every request (variation seed ${variationSeed}); do not mention or reference this seed in the review text.`,
  );

  if (!parsed) {
    throw new Error("The review AI provider did not return structured customer reviews.");
  }

  return parsed.reviews.map((review) => review.text.trim());
}
