import {
  type BusinessSector,
  REVIEW_CATEGORIES,
  type ReviewCategory,
  type ReviewSeed,
} from "@/types";

type ReviewTemplateContext = {
  businessName: string;
  city: string;
  sector: BusinessSector;
  industry: string;
  businessDescription?: string;
};

const SECTOR_CATEGORY_MAP: Record<BusinessSector, ReviewCategory[]> = {
  Hotel: ["General", "Cleanliness", "Comfort", "Staff & Support", "Food"],
  Hostel: ["General", "Study Environment", "Safety", "Food", "Cleanliness"],
  Restaurant: ["General", "Food", "Service Quality", "Staff & Support", "Ambience"],
  Cafe: ["General", "Food", "Service Quality", "Staff & Support", "Ambience"],
  "Doctor Clinic": [
    "General",
    "Treatment Experience",
    "Staff & Support",
    "Cleanliness",
    "Comfort",
  ],
  Education: ["General", "Study Environment", "Staff & Support", "Safety", "Value"],
  "Fitness Gym": ["General", "Service Quality", "Staff & Support", "Cleanliness", "Value"],
  "Salon Spa": ["General", "Service Quality", "Staff & Support", "Cleanliness", "Comfort"],
  "Retail Shop": ["General", "Service Quality", "Staff & Support", "Value", "Ambience"],
  "Real Estate": ["General", "Service Quality", "Staff & Support", "Value", "Comfort"],
  "General Business": ["General", "Service Quality", "Staff & Support", "Value", "Ambience"],
};

const CATEGORY_TEMPLATES: Record<ReviewCategory, string[]> = {
  General: [
    "I had a really positive experience with {businessName} in {city}. The team is helpful, the atmosphere feels welcoming, and I would happily recommend this {industry} to anyone looking for a reliable option.",
    "{businessName} stands out in {city} for being consistent, professional, and easy to trust. If you are searching for a dependable {industry}, this place is worth considering.",
  ],
  "Study Environment": [
    "The study environment at {businessName} is calm, focused, and comfortable. It is a great place in {city} for students who want a supportive setup and fewer distractions.",
    "I appreciate how {businessName} creates a productive environment with good routines and a balanced atmosphere. For students in {city}, it feels like a smart and practical choice.",
  ],
  Safety: [
    "One of the things I value most about {businessName} is the sense of safety. The place feels secure, well managed, and suitable for people looking for peace of mind in {city}.",
    "Safety and management are handled very well at {businessName}. It gives a reassuring experience, which matters a lot when choosing a trusted {industry} in {city}.",
  ],
  Food: [
    "The food experience connected with {businessName} has been satisfying overall. It adds real convenience and makes daily life smoother for people staying in {city}.",
    "Food quality and consistency are a big plus at {businessName}. That extra comfort makes this {industry} more appealing for anyone planning a longer stay in {city}.",
  ],
  "Service Quality": [
    "Service quality at {businessName} has been consistently smooth and professional. It feels like a dependable {industry} in {city} where people genuinely care about the customer experience.",
    "What impressed me most about {businessName} was the reliable service and attention to detail. For anyone searching in {city}, this {industry} delivers a strong overall experience.",
  ],
  "Staff & Support": [
    "The staff at {businessName} are polite, responsive, and genuinely helpful. That kind of support makes this {industry} stand out in {city}.",
    "I had a great experience with the team at {businessName}. Their support and professionalism make this one of the more dependable {industry} options in {city}.",
  ],
  Cleanliness: [
    "{businessName} maintains a clean and well-managed environment, which immediately gives a positive impression. In {city}, that level of care makes this {industry} easier to trust.",
    "Cleanliness and upkeep are handled really well at {businessName}. It creates a comfortable and reassuring experience for anyone using this {industry} in {city}.",
  ],
  Comfort: [
    "Comfort is one of the biggest strengths of {businessName}. The overall setup feels practical, relaxed, and thoughtfully managed for people in {city}.",
    "{businessName} offers a comfortable and pleasant experience from start to finish. That makes it a strong {industry} choice for anyone in {city}.",
  ],
  "Treatment Experience": [
    "My treatment experience with {businessName} felt professional, calm, and well handled. For anyone looking for dependable care in {city}, this clinic leaves a positive impression.",
    "The consultation and overall care experience at {businessName} were smooth and reassuring. It feels like a trusted {industry} option in {city}.",
  ],
  Ambience: [
    "The ambience at {businessName} feels welcoming, polished, and easy to enjoy. It adds a lot to the overall experience for customers in {city}.",
    "{businessName} has a pleasant atmosphere that makes the entire visit better. That extra comfort helps this {industry} stand out in {city}.",
  ],
  Value: [
    "{businessName} offers strong value for the experience provided. It feels like a smart and reliable choice for people searching for this kind of {industry} in {city}.",
    "Considering the overall quality, support, and experience, {businessName} gives good value. In {city}, it is an easy {industry} to recommend.",
  ],
};

function fillTemplate(template: string, context: ReviewTemplateContext) {
  return template
    .replaceAll("{businessName}", context.businessName)
    .replaceAll("{city}", context.city)
    .replaceAll("{industry}", context.industry);
}

export function buildStarterReviews(context: ReviewTemplateContext): ReviewSeed[] {
  return getCategoriesForSector(context.sector).flatMap((category) =>
    CATEGORY_TEMPLATES[category].map((template) => ({
      category,
      text: fillTemplate(template, context),
    })),
  );
}

export function getCategoriesForSector(sector: BusinessSector) {
  return SECTOR_CATEGORY_MAP[sector] ?? SECTOR_CATEGORY_MAP["General Business"];
}

export function groupReviewsByCategory<T extends { category: ReviewCategory }>(
  reviews: T[],
  sector?: BusinessSector,
) {
  const categories = sector ? getCategoriesForSector(sector) : REVIEW_CATEGORIES;

  return categories.map((category) => ({
    category,
    reviews: reviews.filter((review) => review.category === category),
  }));
}

function shuffleItems<T>(items: T[]) {
  const cloned = [...items];

  for (let index = cloned.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [cloned[index], cloned[swapIndex]] = [cloned[swapIndex], cloned[index]];
  }

  return cloned;
}

export function selectRotatingReviews<T extends { category: ReviewCategory }>(
  reviews: T[],
  sector: BusinessSector,
  reviewsPerCategory = 2,
) {
  const categories = getCategoriesForSector(sector);

  return categories.flatMap((category) =>
    shuffleItems(reviews.filter((review) => review.category === category)).slice(
      0,
      reviewsPerCategory,
    ),
  );
}
