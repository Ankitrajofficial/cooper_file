import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
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
        text: z.string().min(60).max(320),
      }),
    )
    .min(20)
    .max(50),
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
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY environment variable.");
  }

  await connectToDatabase();

  const targetCount = Math.max(20, Math.min(options.count ?? 40, 50));
  const model = process.env.OPENAI_MODEL || "gpt-5.4-mini";
  const categories = getCategoriesForSector(options.sector);
  const businessDescription = options.businessDescription?.trim();
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const response = await openai.responses.parse({
    model,
    input: [
      {
        role: "system",
        content:
          "You write polished Google Business Profile review scripts for real customers. Keep the tone natural, helpful, believable, and SEO aware. Avoid repetition, avoid exaggerated claims, and make every review distinct enough that repeated visitors do not see near-duplicates.",
      },
      {
        role: "user",
        content: `Generate ${targetCount} unique review scripts for ${options.businessName}, a ${options.industry} business in ${options.city}. The broad business sector is ${options.sector}. Split the reviews across these categories only: ${categories.join(
          ", ",
        )}. Each review should feel human, be 2-4 sentences, sound different from the others, and naturally include high-value local SEO phrases tied to ${options.city}, ${options.industry}, and ${options.sector}. Prioritize keywords a real Google Business Profile review could naturally contain, without keyword stuffing. Reflect the real business context, audience, strengths, and experience based on this description when it is useful: ${businessDescription || "No extra description was provided, so infer sensible specifics from the business name, city, sector, and industry."} Focus on believable details, not generic praise. Do not use quotation marks, emojis, numbered lists, placeholders, or repeated opening sentences.`,
      },
    ],
    text: {
      format: zodTextFormat(GeneratedReviewsSchema, "generated_reviews"),
    },
  });

  const parsed = response.output_parsed;

  if (!parsed) {
    throw new Error("OpenAI did not return structured reviews.");
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
