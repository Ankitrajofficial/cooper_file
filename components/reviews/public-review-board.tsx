"use client";

import { useEffect, useRef, useState } from "react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { copyTextToClipboard, cn, toErrorMessage } from "@/lib/utils";
import { type PublicClientPayload } from "@/types";

type ReviewOption = {
  id: string;
  text: string;
};

const ratingLabels: Record<number, string> = {
  1: "Poor",
  2: "Could be better",
  3: "Okay",
  4: "Good",
  5: "Excellent",
};

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      className={cn(
        "h-8 w-8 transition-colors sm:h-9 sm:w-9",
        filled ? "text-amber-400" : "text-slate-300",
      )}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111c.084.203.276.34.495.358l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.563.563 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557L3.041 10.385a.563.563 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .495-.358l2.105-5.098Z" />
    </svg>
  );
}

function ReviewOptionCard({
  option,
  slug,
  googleReviewLink,
}: {
  option: ReviewOption;
  slug: string;
  googleReviewLink: string;
}) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [isOpening, setIsOpening] = useState(false);
  const [showManualCopy, setShowManualCopy] = useState(false);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timer = window.setTimeout(() => setCopied(false), 2200);

    return () => window.clearTimeout(timer);
  }, [copied]);

  function trackGoogleOpen() {
    const endpoint = `/api/review/${slug}/click`;

    if (navigator.sendBeacon) {
      navigator.sendBeacon(endpoint);
      return;
    }

    void fetch(endpoint, {
      method: "POST",
      keepalive: true,
    });
  }

  function openGoogleReviewProfile() {
    trackGoogleOpen();
    window.location.assign(googleReviewLink);
  }

  async function handleReview() {
    setError("");
    setShowManualCopy(false);
    setIsOpening(true);

    try {
      const copySucceeded = await copyTextToClipboard(option.text);

      if (!copySucceeded) {
        setError("Copy was blocked. Select the review text, then open Google.");
        setShowManualCopy(true);
        return;
      }

      setCopied(true);
      openGoogleReviewProfile();
    } catch {
      setError("Could not copy the review. Select the text manually, then open Google.");
      setShowManualCopy(true);
    } finally {
      setIsOpening(false);
    }
  }

  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-ambient">
      <p className="select-text text-base leading-7 text-[var(--on-surface)]">
        {option.text}
      </p>

      {showManualCopy ? (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
          <p className="text-xs font-semibold text-amber-900">
            Manual copy
          </p>
          <textarea
            readOnly
            value={option.text}
            className="mt-2 min-h-28 w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none"
            onFocus={(event) => event.currentTarget.select()}
          />
          <Button
            className="mt-3"
            fullWidth
            onClick={openGoogleReviewProfile}
          >
            Open Google
          </Button>
        </div>
      ) : null}

      <div className="mt-4 space-y-2">
        <Button fullWidth onClick={handleReview} disabled={isOpening}>
          {copied ? (
            <>
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Copied. Opening Google
            </>
          ) : isOpening ? (
            "Opening Google..."
          ) : (
            <>
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
              Review
            </>
          )}
        </Button>
        <p className="text-center text-xs text-slate-500">
          Copies this review and opens Google.
        </p>
        {error ? <p className="text-center text-xs text-rose-600">{error}</p> : null}
      </div>
    </article>
  );
}

export function PublicReviewBoard({ client }: { client: PublicClientPayload }) {
  const [rating, setRating] = useState<number | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [reviews, setReviews] = useState<ReviewOption[]>([]);
  const [error, setError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const hasTrackedViewRef = useRef(false);

  const activeRating = hoveredRating || rating || 0;

  useEffect(() => {
    if (hasTrackedViewRef.current) {
      return;
    }

    hasTrackedViewRef.current = true;

    const endpoint = `/api/review/${client.slug}/view`;

    if (navigator.sendBeacon) {
      navigator.sendBeacon(endpoint);
      return;
    }

    void fetch(endpoint, {
      method: "POST",
      keepalive: true,
    });
  }, [client.slug]);

  async function generateReviewsForRating(nextRating: number) {
    setRating(nextRating);
    setReviews([]);
    setError("");
    setIsGenerating(true);

    try {
      const response = await fetch(`/api/review/${client.slug}/generate`, {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rating: nextRating }),
      });
      const payload = (await response.json()) as {
        error?: string;
        reviews?: string[];
      };

      if (!response.ok || !payload.reviews?.length) {
        throw new Error(payload.error || "Could not generate review options.");
      }

      setReviews(
        payload.reviews.slice(0, 2).map((text, index) => ({
          id: `${nextRating}-${index + 1}-${Date.now()}`,
          text,
        })),
      );
    } catch (generationError) {
      setError(toErrorMessage(generationError));
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--surface-base)] px-4 py-5 sm:px-6">
      <main className="mx-auto flex min-h-[calc(100vh-40px)] max-w-3xl flex-col">
        <header className="flex items-center justify-between gap-3">
          <BrandLogo theme="dark" compact />
          <Badge variant="teal">{client.city}</Badge>
        </header>

        <section className="mt-8 rounded-2xl border border-slate-200/80 bg-white p-5 text-center shadow-ambient sm:mt-10 sm:p-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111c.084.203.276.34.495.358l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557L3.041 10.385a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.495-.358l2.105-5.098z" />
            </svg>
          </div>
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">
            {client.industry}
          </p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[var(--on-surface)] sm:text-4xl">
            How was your experience at {client.businessName}?
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[var(--on-surface-variant)]">
            Select your star rating. We will generate review text that matches
            your experience, then the Review button copies it and opens Google.
          </p>

          <div
            className="mt-7 flex flex-wrap items-center justify-center gap-2"
            onMouseLeave={() => setHoveredRating(null)}
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => generateReviewsForRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                className={cn(
                  "group flex h-14 w-14 items-center justify-center rounded-2xl border transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/25 sm:h-16 sm:w-16",
                  rating === star
                    ? "border-amber-300 bg-amber-50 shadow-ambient"
                    : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-amber-200 hover:bg-amber-50",
                )}
                aria-label={`Select ${star} star rating`}
              >
                <StarIcon filled={activeRating >= star} />
              </button>
            ))}
          </div>

          <div className="mt-4 min-h-6">
            {rating ? (
              <p className="text-sm font-semibold text-[var(--on-surface)]">
                {rating} star{rating > 1 ? "s" : ""}: {ratingLabels[rating]}
              </p>
            ) : (
              <p className="text-sm text-[var(--on-surface-variant)]">
                Tap a star to generate review options.
              </p>
            )}
          </div>
        </section>

        {isGenerating ? (
          <section className="mt-5 rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-ambient">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-brand/20 border-t-brand" />
            <p className="mt-4 text-sm font-semibold text-[var(--on-surface)]">
              Generating review options...
            </p>
          </section>
        ) : null}

        {error ? (
          <section className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </section>
        ) : null}

        {reviews.length ? (
          <section className="mt-6 space-y-4 pb-10">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-[var(--on-surface)]">
                  Choose a review
                </h2>
                <p className="mt-1 text-sm text-[var(--on-surface-variant)]">
                  You can edit the text on Google before submitting.
                </p>
              </div>
              <Badge variant="slate">{reviews.length} options</Badge>
            </div>
            <div className="grid gap-4">
              {reviews.map((option) => (
                <ReviewOptionCard
                  key={option.id}
                  option={option}
                  slug={client.slug}
                  googleReviewLink={client.googleReviewLink}
                />
              ))}
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
