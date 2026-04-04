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
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-panel">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{client.sector}</Badge>
            <Badge className="bg-teal-50 text-teal-800">{client.industry}</Badge>
            <Badge className="bg-amber-100 text-amber-800">{client.city}</Badge>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-ink">{client.businessName}</h3>
            <p className="text-sm text-slate-500">
              Created {formatDate(client.createdAt)}
            </p>
            {client.businessDescription ? (
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                {client.businessDescription}
              </p>
            ) : null}
          </div>
        </div>
        <Link
          href={`/review/${client.slug}`}
          target="_blank"
          className="text-sm font-semibold text-brand transition hover:text-brand-dark"
        >
          Open public page
        </Link>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Review scripts</p>
          <p className="mt-1 text-2xl font-bold text-ink">{client.reviewCount}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Review clicks</p>
          <p className="mt-1 text-2xl font-bold text-ink">{client.clickCount}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Slug</p>
          <p className="mt-1 truncate text-sm font-semibold text-ink">{client.slug}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4 sm:col-span-3">
          <p className="text-sm text-slate-500">Link expiry</p>
          <p className="mt-1 text-sm font-semibold text-ink">
            {client.expiresAt
              ? `${formatDate(client.expiresAt)}${client.expiryMode === "custom" ? " (custom)" : " (subscription)"}`
              : "Follows subscription"}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button variant="secondary" onClick={handleCopyLink}>
          Copy public link
        </Button>
        <Button onClick={handleGenerateReviews} disabled={generatePending}>
          {generatePending ? "Generating..." : "Generate SEO Reviews"}
        </Button>
        <Link
          href={`/dashboard/clients/${client.id}`}
          className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          Edit Client
        </Link>
        <Button variant="danger" onClick={handleDelete} disabled={deletePending}>
          {deletePending ? "Deleting..." : "Delete"}
        </Button>
      </div>

      {feedback ? (
        <p className="mt-4 text-sm text-slate-600">{feedback}</p>
      ) : null}
    </article>
  );
}
