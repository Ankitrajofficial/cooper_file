"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, toErrorMessage } from "@/lib/utils";
import { type DashboardClient } from "@/types";

export function ClientCard({ client }: { client: DashboardClient }) {
  const router = useRouter();
  const [feedback, setFeedback] = useState("");
  const [deletePending, startDeleteTransition] = useTransition();
  const [generatePending, startGenerateTransition] = useTransition();

  async function handleDelete() {
    if (!window.confirm(`Delete ${client.businessName} and all reviews?`)) {
      return;
    }

    setFeedback("");
    startDeleteTransition(async () => {
      try {
        const response = await fetch(`/api/clients/${client.id}`, {
          method: "DELETE",
        });

        const payload = (await response.json()) as { error?: string };

        if (!response.ok) {
          throw new Error(payload.error || "Failed to delete client.");
        }

        router.refresh();
      } catch (error) {
        setFeedback(toErrorMessage(error));
      }
    });
  }

  async function handleGenerateReviews() {
    setFeedback("");
    startGenerateTransition(async () => {
      try {
        const response = await fetch(
          `/api/clients/${client.id}/generate-reviews`,
          {
            method: "POST",
          },
        );

        const payload = (await response.json()) as {
          error?: string;
          message?: string;
        };

        if (!response.ok) {
          throw new Error(payload.error || "Failed to generate reviews.");
        }

        setFeedback(payload.message || "Reviews generated successfully.");
        router.refresh();
      } catch (error) {
        setFeedback(toErrorMessage(error));
      }
    });
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/review/${client.slug}`,
      );
      setFeedback("Public review page copied.");
    } catch {
      setFeedback("Could not copy the public page link.");
    }
  }

  return (
    <article className="card-hover ghost-border-interactive surface-card-elevated overflow-hidden p-6">
      {/* ─── Header row ─── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="default">{client.sector}</Badge>
            <Badge variant="teal">{client.industry}</Badge>
            <Badge variant="amber">{client.city}</Badge>
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-[-0.01em] text-[var(--on-surface)]">
              {client.businessName}
            </h3>
            <p className="text-xs text-[var(--on-surface-variant)]">
              Created {formatDate(client.createdAt)}
            </p>
            {client.businessDescription ? (
              <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-[var(--on-surface-variant)]">
                {client.businessDescription}
              </p>
            ) : null}
          </div>
        </div>
        <Link
          href={`/review/${client.slug}`}
          target="_blank"
          className="group inline-flex items-center gap-2 rounded-lg bg-brand/[0.06] px-3 py-1.5 text-sm font-semibold text-brand transition-all duration-200 hover:bg-brand/10 hover:text-brand-dark"
        >
          Open public page
          <svg
            className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
            />
          </svg>
        </Link>
      </div>

      {/* ─── Stats row (Stitch tonal layering) ─── */}
      <div className="mt-5 grid gap-2.5 sm:grid-cols-4">
        <div className="rounded-xl bg-[var(--surface-low)] p-3.5 transition-colors hover:bg-[var(--surface-container)]">
          <p className="text-[11px] font-medium text-[var(--on-surface-variant)]">Review scripts</p>
          <div className="mt-1 flex items-center gap-2">
            <p className="text-xl font-bold text-[var(--on-surface)]">{client.reviewCount}</p>
            <span className="data-pulse-cyan" />
          </div>
        </div>
        <div className="rounded-xl bg-[var(--surface-low)] p-3.5 transition-colors hover:bg-[var(--surface-container)]">
          <p className="text-[11px] font-medium text-[var(--on-surface-variant)]">Review clicks</p>
          <p className="mt-1 text-xl font-bold text-[var(--on-surface)]">{client.clickCount}</p>
        </div>
        <div className="rounded-xl bg-[var(--surface-low)] p-3.5 transition-colors hover:bg-[var(--surface-container)]">
          <p className="text-[11px] font-medium text-[var(--on-surface-variant)]">Slug</p>
          <p className="mt-1 truncate text-sm font-semibold text-[var(--on-surface)]">{client.slug}</p>
        </div>
        <div className="rounded-xl bg-[var(--surface-low)] p-3.5 transition-colors hover:bg-[var(--surface-container)]">
          <p className="text-[11px] font-medium text-[var(--on-surface-variant)]">Link expiry</p>
          <p className="mt-1 text-sm font-semibold text-[var(--on-surface)]">
            {client.expiresAt
              ? client.expiryMode === "custom"
                ? `${formatDate(client.expiresAt)} (custom)`
                : `Follows plan until ${formatDate(client.expiresAt)}`
              : "Follows current subscription"}
          </p>
        </div>
      </div>

      {/* ─── Actions ─── */}
      <div className="mt-5 flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" onClick={handleCopyLink}>
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
          Copy link
        </Button>
        <Button size="sm" onClick={handleGenerateReviews} disabled={generatePending}>
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
          {generatePending ? "Generating..." : "Generate SEO Reviews"}
        </Button>
        <Link
          href={`/dashboard/clients/${client.id}`}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold text-[var(--on-surface-variant)] transition-all duration-200 hover:bg-[var(--surface-container)] hover:text-[var(--on-surface)]"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
          </svg>
          Edit
        </Link>
        <Button size="sm" variant="danger" onClick={handleDelete} disabled={deletePending}>
          {deletePending ? "Deleting..." : "Delete"}
        </Button>
      </div>

      {/* ─── Feedback (Stitch tonal feedback) ─── */}
      {feedback ? (
        <div className="mt-3.5 flex items-center gap-2 rounded-xl bg-[var(--surface-low)] px-4 py-2.5 text-sm text-[var(--on-surface-variant)]">
          <svg className="h-4 w-4 shrink-0 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {feedback}
        </div>
      ) : null}
    </article>
  );
}
