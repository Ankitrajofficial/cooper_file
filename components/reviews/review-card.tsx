"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { copyTextToClipboard } from "@/lib/utils";

type ReviewCardProps = {
  reviewId: string;
  slug: string;
  text: string;
  googleReviewLink: string;
};

export function ReviewCard({
  reviewId,
  slug,
  text,
  googleReviewLink,
}: ReviewCardProps) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [isOpening, setIsOpening] = useState(false);
  const [showManualCopy, setShowManualCopy] = useState(false);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timer = window.setTimeout(() => setCopied(false), 2000);

    return () => window.clearTimeout(timer);
  }, [copied]);

  async function handleCopyAndOpen() {
    setError("");
    setShowManualCopy(false);
    setIsOpening(true);

    try {
      const copied = await copyTextToClipboard(text);

      if (!copied) {
        setError(
          "Auto-copy was blocked on this browser. Copy the review manually, then open Google review.",
        );
        setShowManualCopy(true);
        return;
      }

      setCopied(true);

      void fetch(`/api/review/${slug}/click`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reviewId }),
      });
      window.open(googleReviewLink, "_blank", "noopener,noreferrer");
    } catch {
      setError(
        "Could not complete the one-click review flow. Copy the text manually and then open Google review.",
      );
      setShowManualCopy(true);
    } finally {
      setIsOpening(false);
    }
  }

  return (
    <div className="card-hover rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card">
      <p className="select-text text-sm leading-relaxed text-slate-700">{text}</p>
      {showManualCopy ? (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
          <p className="text-xs font-medium text-amber-900">
            Manual copy fallback
          </p>
          <p className="mt-1 text-xs leading-5 text-amber-800">
            Press and hold the review text below to copy it, then open the Google review form.
          </p>
          <textarea
            readOnly
            value={text}
            className="mt-3 min-h-28 w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none"
            onFocus={(event) => event.currentTarget.select()}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => window.open(googleReviewLink, "_blank", "noopener,noreferrer")}
            >
              Open Google Review
            </Button>
            <Button size="sm" onClick={handleCopyAndOpen}>
              Try auto-copy again
            </Button>
          </div>
        </div>
      ) : null}
      <div className="mt-4 flex items-center justify-between gap-3">
        <Button size="sm" onClick={handleCopyAndOpen} disabled={isOpening}>
          {copied ? (
            <>
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Copied
            </>
          ) : isOpening ? (
            "Opening..."
          ) : (
            <>
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              1-Click Review
            </>
          )}
        </Button>
        {error ? <span className="text-xs text-rose-600">{error}</span> : null}
      </div>
    </div>
  );
}
