"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toErrorMessage } from "@/lib/utils";

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

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timer = window.setTimeout(() => setCopied(false), 2000);

    return () => window.clearTimeout(timer);
  }, [copied]);

  async function handleCopyAndOpen() {
    setError("");
    setIsOpening(true);
    window.open(googleReviewLink, "_blank", "noopener,noreferrer");

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      void fetch(`/api/review/${slug}/click`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reviewId }),
      });
    } catch (copyError) {
      setError(toErrorMessage(copyError));
    } finally {
      setIsOpening(false);
    }
  }

  return (
    <div className="card-hover rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card">
      <p className="text-sm leading-relaxed text-slate-700">{text}</p>
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
