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

const CATEGORY_SCRIPT_DETAILS: Record<ReviewCategory, string[]> = {
  General: [
    "The overall experience felt smooth, professional, and easy to trust.",
    "Everything was handled with care, and the process felt simple from start to finish.",
    "The business gives a reliable impression and delivers a customer-friendly experience.",
    "It feels like a dependable local option for people who want quality and consistency.",
  ],
  "Study Environment": [
    "The environment feels calm, organized, and suitable for focused study.",
    "The setup is practical for students who need fewer distractions and steady routines.",
    "The space supports a productive daily schedule and feels thoughtfully managed.",
    "It creates a balanced atmosphere for students who want comfort and focus together.",
  ],
  Safety: [
    "The place feels well managed, secure, and reassuring for customers.",
    "The attention to safety and proper handling adds confidence to the experience.",
    "The setup feels organized in a way that gives customers peace of mind.",
    "Safety and basic management are treated seriously, which makes a real difference.",
  ],
  Food: [
    "The food experience adds convenience and makes the visit more satisfying.",
    "The quality and consistency of the food support a better overall experience.",
    "The food service feels practical, comfortable, and useful for regular customers.",
    "It is clear that food and hospitality are part of the complete customer experience.",
  ],
  "Service Quality": [
    "The service feels attentive, organized, and consistent.",
    "The team responds well and keeps the customer experience smooth.",
    "The work is handled with proper attention to detail and clear communication.",
    "The service quality stands out because the experience feels dependable.",
  ],
  "Staff & Support": [
    "The staff are polite, responsive, and easy to speak with.",
    "The support from the team makes the whole experience more comfortable.",
    "The people here are helpful and make customers feel properly guided.",
    "The team gives clear support and maintains a professional approach.",
  ],
  Cleanliness: [
    "The place feels clean, maintained, and pleasant to visit.",
    "Cleanliness and upkeep are handled well, which creates a strong first impression.",
    "The environment is neat and organized, making the experience more comfortable.",
    "The attention to cleanliness adds trust and makes the business feel well managed.",
  ],
  Comfort: [
    "The experience feels comfortable, practical, and thoughtfully arranged.",
    "The overall setup makes the visit easy and pleasant.",
    "There is a good balance of comfort, service, and convenience.",
    "The business creates a relaxed experience without losing professionalism.",
  ],
  "Treatment Experience": [
    "The consultation experience feels calm, professional, and properly guided.",
    "The care and communication make the visit feel reassuring.",
    "The process is handled patiently, which helps customers feel comfortable.",
    "The treatment experience feels organized, respectful, and dependable.",
  ],
  Ambience: [
    "The ambience feels welcoming and adds to the overall experience.",
    "The atmosphere is pleasant, comfortable, and easy to appreciate.",
    "The setting creates a positive impression from the moment customers arrive.",
    "The ambience supports a better customer experience and feels well maintained.",
  ],
  Value: [
    "The service feels worth the time because the quality and support are consistent.",
    "The overall value is strong when you consider the experience and attention to detail.",
    "It feels like a practical choice for customers who want dependable quality.",
    "The business offers good value through reliable service and a smooth experience.",
  ],
};

const SCRIPT_OPENERS = [
  "I had a very good experience with {businessName} in {city}.",
  "{businessName} has been a reliable choice in {city}.",
  "My experience with {businessName} was positive from the beginning.",
  "I was happy with the way {businessName} handled the overall experience.",
  "{businessName} stands out as a dependable {industry} in {city}.",
  "I found {businessName} to be professional, helpful, and easy to trust.",
  "The experience at {businessName} felt well managed and customer focused.",
  "{businessName} made the process simple and comfortable.",
];

const SCRIPT_CLOSERS = [
  "I would recommend this {industry} to anyone looking for a trusted option in {city}.",
  "It is a good choice for customers who value service, quality, and consistency.",
  "I would be comfortable choosing them again and recommending them to others.",
  "For anyone searching in {city}, this business is worth considering.",
  "The experience felt genuine, useful, and easy to recommend.",
  "It is a strong local option for people who want dependable service.",
  "The quality and support make it an easy business to recommend.",
  "Overall, it was a smooth and satisfying customer experience.",
];

const SCRIPT_CONTEXT_LINES = [
  "The business understands what customers expect and keeps the experience practical.",
  "The team pays attention to details that make the final experience better.",
  "Communication was clear, and the service felt professional throughout.",
  "The overall approach feels honest, steady, and customer friendly.",
  "The experience combines local convenience with dependable service.",
  "The team keeps things simple while still maintaining good quality.",
  "The work and support feel consistent, which is important for customers.",
  "The service has a polished feel without becoming complicated.",
];

function pickRotating<T>(items: T[], index: number, offset = 0) {
  return items[(index + offset) % items.length];
}

export function buildScriptedReviews(
  context: ReviewTemplateContext,
  count = 100,
): ReviewSeed[] {
  const targetCount = Math.max(1, Math.min(count, 250));
  const categories = getCategoriesForSector(context.sector);

  return Array.from({ length: targetCount }, (_, index) => {
    const category = pickRotating(categories, index);
    const categoryDetails = CATEGORY_SCRIPT_DETAILS[category];
    const opener = pickRotating(SCRIPT_OPENERS, index);
    const detail = pickRotating(categoryDetails, index, Math.floor(index / categories.length));
    const contextLine = pickRotating(SCRIPT_CONTEXT_LINES, index, category.length);
    const closer = pickRotating(SCRIPT_CLOSERS, index, categoryDetails.length);

    return {
      category,
      text: fillTemplate(
        `${opener} ${detail} ${contextLine} ${closer}`,
        context,
      ),
    };
  });
}

// Doctor clinic ratings stay positive across 1-5 and never criticise the doctor.
// At 3 stars, any soft improvement note is pointed at the front desk / wait time
// (the staff and surrounding experience) so the doctor's reputation is protected.
const DOCTOR_RATING_REVIEW_TEMPLATES: Record<number, string[]> = {
  1: [
    "I had a genuinely reassuring experience at {businessName} in {city}. The doctor was attentive, patient, and professional, and the care felt thorough. A trusted clinic for anyone in {city}.",
    "The doctor at {businessName} was caring and knowledgeable, and took the time to explain everything clearly. I left feeling well looked after and would happily recommend this clinic in {city}.",
  ],
  2: [
    "{businessName} gave me a comforting and professional experience. The doctor was thorough and explained the treatment clearly, which made the visit feel dependable and worthwhile.",
    "I appreciated the care I received at {businessName}. The doctor was attentive and reassuring, and the consultation felt trustworthy. A solid choice for patients in {city}.",
  ],
  3: [
    "The doctor at {businessName} was excellent — attentive, professional, and clear about the treatment. The front desk and wait time could be a little smoother, but the medical care itself was reassuring and well worth it.",
    "I had a good experience with the doctor at {businessName}; the consultation was thorough and caring. The only small thing was the scheduling and front-desk flow, but the doctor's care left a strong, positive impression.",
  ],
  4: [
    "I had a great experience at {businessName} in {city}. The doctor was professional and attentive, the care felt thorough, and this clinic is well worth considering if you are nearby.",
    "{businessName} gave me a very positive experience. The doctor was caring and clear, and while the front-desk flow could be slightly quicker, the treatment and support were strong.",
  ],
  5: [
    "I had an excellent experience at {businessName} in {city}. The doctor was professional, caring, and thorough, and I would wholeheartedly recommend this clinic to others.",
    "{businessName} really stood out for the doctor's attentive care and reassuring approach. It is a trusted choice in {city} for anyone looking for dependable treatment.",
  ],
};

// Generic ratings keep 1-3 positive too, protecting the core service while
// pointing any soft 3-star note at the front desk / wait rather than the work.
const RATING_REVIEW_TEMPLATES: Record<number, string[]> = {
  1: [
    "I had a really positive experience with {businessName} in {city}. The service felt professional and the overall visit was smooth. Recommended for anyone looking for a reliable {industry} in {city}.",
    "{businessName} gave me a genuinely good experience. The quality and support were dependable, and I would happily recommend this {industry} to others in {city}.",
  ],
  2: [
    "{businessName} delivered a reassuring experience overall. The core service felt professional and the visit was comfortable. A solid {industry} option in {city}.",
    "I appreciated the experience at {businessName}. The main service was dependable and worthwhile, making it a good {industry} choice in {city}.",
  ],
  3: [
    "The main service at {businessName} was great and felt professional. A few small things at the front desk or with wait time could be smoother, but the overall experience was positive and worth it.",
    "I had a good experience with {businessName} overall; the core service was reliable. The only minor thing was the front-desk flow and timing, but it did not take away from a positive visit.",
  ],
  4: [
    "I had a good experience with {businessName} in {city}. The team was helpful, the service felt smooth, and this {industry} is worth considering if you are nearby.",
    "{businessName} gave me a positive overall experience. A few small things could be refined, but the service, support, and local convenience were strong.",
  ],
  5: [
    "I had an excellent experience with {businessName} in {city}. The team was professional, the service felt smooth, and I would happily recommend this {industry} to others.",
    "{businessName} really stood out for its helpful service and reliable experience. It is a strong choice in {city} for anyone looking for a dependable {industry}.",
  ],
};

export function buildRatingReviewOptions(
  context: ReviewTemplateContext & { rating: number },
) {
  const templateMap =
    context.sector === "Doctor Clinic"
      ? DOCTOR_RATING_REVIEW_TEMPLATES
      : RATING_REVIEW_TEMPLATES;
  const templates = templateMap[context.rating] ?? templateMap[5];

  return templates.map((template) => fillTemplate(template, context));
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
