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

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timer = window.setTimeout(() => setCopied(false), 2000);

    return () => window.clearTimeout(timer);
  }, [copied]);

  async function handleCopyAndOpen() {
    setError("");

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
      window.open(googleReviewLink, "_blank", "noopener,noreferrer");
    } catch (copyError) {
      setError(toErrorMessage(copyError));
    }
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm leading-7 text-slate-700">{text}</p>
      <div className="mt-5 flex items-center justify-between gap-3">
        <Button onClick={handleCopyAndOpen}>
          {copied ? "Copied ✅" : "Copy & Review"}
        </Button>
        {error ? <span className="text-xs text-rose-600">{error}</span> : null}
      </div>
    </div>
  );
}

