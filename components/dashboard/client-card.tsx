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

  function handleDelete() {
    if (!window.confirm(`Delete ${client.businessName} and all reviews?`)) {
      return;
    }

    setFeedback("");

    startDeleteTransition(() => {
      void (async () => {
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
      })();
    });
  }

  function handleGenerateReviews() {
    setFeedback("");

    startGenerateTransition(() => {
      void (async () => {
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
      })();
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
    <article className="card-hover rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="default">{client.sector}</Badge>
            <Badge variant="teal">{client.industry}</Badge>
            <Badge variant="amber">{client.city}</Badge>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-ink">{client.businessName}</h3>
            <p className="text-xs text-slate-500">
              Created {formatDate(client.createdAt)}
            </p>
            {client.businessDescription ? (
              <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-600">
                {client.businessDescription}
              </p>
            ) : null}
          </div>
        </div>
        <Link
          href={`/review/${client.slug}`}
          target="_blank"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand transition hover:text-brand-dark"
        >
          Open public page
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
              d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
            />
          </svg>
        </Link>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-4">
        <div className="rounded-xl bg-slate-50 p-3.5">
          <p className="text-[11px] font-medium text-slate-500">Review scripts</p>
          <p className="mt-1 text-xl font-bold text-ink">{client.reviewCount}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3.5">
          <p className="text-[11px] font-medium text-slate-500">Review clicks</p>
          <p className="mt-1 text-xl font-bold text-ink">{client.clickCount}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3.5">
          <p className="text-[11px] font-medium text-slate-500">Slug</p>
          <p className="mt-1 truncate text-sm font-semibold text-ink">{client.slug}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3.5">
          <p className="text-[11px] font-medium text-slate-500">Link expiry</p>
          <p className="mt-1 text-sm font-semibold text-ink">
            {client.expiresAt
              ? `${formatDate(client.expiresAt)}${client.expiryMode === "custom" ? " (custom)" : ""}`
              : "Follows subscription"}
          </p>
        </div>
      </div>

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
          {generatePending ? "Generating..." : "Generate SEO Reviews"}
        </Button>
        <Link
          href={`/dashboard/clients/${client.id}`}
          className="inline-flex items-center justify-center rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-ink"
        >
          Edit
        </Link>
        <Button size="sm" variant="danger" onClick={handleDelete} disabled={deletePending}>
          {deletePending ? "Deleting..." : "Delete"}
        </Button>
      </div>

      {feedback ? (
        <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
          {feedback}
        </p>
      ) : null}
    </article>
  );
}
