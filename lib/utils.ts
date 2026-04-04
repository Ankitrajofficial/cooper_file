import { type BusinessSector } from "@/types";

const BUSINESS_KEYWORDS: Array<{
  keyword: string;
  sector: BusinessSector;
  industry: string;
}> = [
  { keyword: "hostel", sector: "Hostel", industry: "Hostel" },
  { keyword: "pg", sector: "Hostel", industry: "Paying Guest Accommodation" },
  { keyword: "hotel", sector: "Hotel", industry: "Hotel" },
  { keyword: "resort", sector: "Hotel", industry: "Resort" },
  { keyword: "cafe", sector: "Cafe", industry: "Cafe" },
  { keyword: "coffee", sector: "Cafe", industry: "Coffee Shop" },
  { keyword: "restaurant", sector: "Restaurant", industry: "Restaurant" },
  { keyword: "diner", sector: "Restaurant", industry: "Restaurant" },
  { keyword: "clinic", sector: "Doctor Clinic", industry: "Clinic" },
  { keyword: "doctor", sector: "Doctor Clinic", industry: "Doctor Clinic" },
  { keyword: "hospital", sector: "Doctor Clinic", industry: "Hospital" },
  { keyword: "academy", sector: "Education", industry: "Education" },
  { keyword: "school", sector: "Education", industry: "Education" },
  { keyword: "college", sector: "Education", industry: "Education" },
  { keyword: "coaching", sector: "Education", industry: "Coaching Institute" },
  { keyword: "gym", sector: "Fitness Gym", industry: "Fitness Gym" },
  { keyword: "fitness", sector: "Fitness Gym", industry: "Fitness Center" },
  { keyword: "salon", sector: "Salon Spa", industry: "Salon" },
  { keyword: "spa", sector: "Salon Spa", industry: "Spa" },
  { keyword: "shop", sector: "Retail Shop", industry: "Retail Shop" },
  { keyword: "store", sector: "Retail Shop", industry: "Retail Store" },
  { keyword: "realty", sector: "Real Estate", industry: "Real Estate" },
  { keyword: "property", sector: "Real Estate", industry: "Real Estate" },
];

type ClassValue = string | false | null | undefined;

export function cn(...classes: ClassValue[]) {
  return classes.filter(Boolean).join(" ");
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function detectSector(
  businessName: string,
  fallback: BusinessSector = "General Business",
) {
  const normalized = businessName.toLowerCase();
  const matched = BUSINESS_KEYWORDS.find(({ keyword }) =>
    normalized.includes(keyword),
  );

  return matched?.sector ?? fallback;
}

export function detectIndustry(
  businessName: string,
  fallback = "General Business",
) {
  const normalized = businessName.toLowerCase();
  const matched = BUSINESS_KEYWORDS.find(({ keyword }) =>
    normalized.includes(keyword),
  );

  return matched?.industry ?? fallback;
}

export function normalizeExternalUrl(input: string) {
  const value = input.trim();

  if (!value) {
    return "";
  }

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  return `https://${value}`;
}

export function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export function toErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

function copyTextWithExecCommand(value: string) {
  if (typeof document === "undefined") {
    return false;
  }

  const textArea = document.createElement("textarea");
  const selection = document.getSelection();
  const previousRange =
    selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

  textArea.value = value;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.width = "1px";
  textArea.style.height = "1px";
  textArea.style.opacity = "0";
  textArea.style.pointerEvents = "none";

  document.body.appendChild(textArea);
  textArea.focus({ preventScroll: true });
  textArea.select();
  textArea.setSelectionRange(0, value.length);

  let copied = false;

  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  }

  document.body.removeChild(textArea);

  if (selection) {
    selection.removeAllRanges();

    if (previousRange) {
      selection.addRange(previousRange);
    }
  }

  return copied;
}

export async function copyTextToClipboard(value: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      return copyTextWithExecCommand(value);
    }
  }

  return copyTextWithExecCommand(value);
}
