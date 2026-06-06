"use client";

import Link from "next/link";
import QRCode from "qrcode";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { copyTextToClipboard, formatDate, toErrorMessage } from "@/lib/utils";
import { type DashboardClient } from "@/types";

export function ClientCard({ client }: { client: DashboardClient }) {
  const router = useRouter();
  const [feedback, setFeedback] = useState("");
  const [downloadQrPending, setDownloadQrPending] = useState(false);
  const [deletePending, startDeleteTransition] = useTransition();
  const [generatePending, startGenerateTransition] = useTransition();

  function getPublicReviewUrl() {
    return `${window.location.origin}/review/${client.slug}`;
  }

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

  async function handleCopyLink() {
    const copied = await copyTextToClipboard(getPublicReviewUrl());
    setFeedback(copied ? "Review link copied." : "Could not copy the review link.");
  }

  async function handleDownloadQr() {
    setFeedback("");
    setDownloadQrPending(true);

    try {
      const dataUrl = await QRCode.toDataURL(getPublicReviewUrl(), {
        errorCorrectionLevel: "M",
        margin: 2,
        width: 1200,
        color: {
          dark: "#020617",
          light: "#FFFFFF",
        },
      });

      const downloadLink = document.createElement("a");
      downloadLink.href = dataUrl;
      downloadLink.download = `${client.slug}-review-qr.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      setFeedback("QR code downloaded.");
    } catch (error) {
      setFeedback(toErrorMessage(error) || "Could not generate the QR code.");
    } finally {
      setDownloadQrPending(false);
    }
  }

  function handleGenerateReviews() {
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
          throw new Error(payload.error || "Failed to generate review scripts.");
        }

        setFeedback(payload.message || "100 backend review scripts generated.");
        router.refresh();
      } catch (error) {
        setFeedback(toErrorMessage(error));
      }
    });
  }

  const expiryLabel = client.expiresAt
    ? `Expires ${formatDate(client.expiresAt)}`
    : "No expiry";
  const publicPath = `/review/${client.slug}`;

  return (
    <article className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm transition-colors duration-200 hover:border-brand/30">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold tracking-tight text-[var(--on-surface)]">
              {client.businessName}
            </h3>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                client.isExpired
                  ? "bg-rose-50 text-rose-700"
                  : "bg-emerald-50 text-emerald-700"
              }`}
            >
              {client.isExpired ? "Expired" : "Active"}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Badge variant="default">{client.sector}</Badge>
            <Badge variant="teal">{client.industry}</Badge>
            <Badge variant="amber">{client.city}</Badge>
          </div>

          <p className="mt-3 truncate rounded-lg border border-slate-200 bg-[var(--surface-low)] px-3 py-2 font-mono text-xs text-[var(--on-surface-variant)]">
            {publicPath}
          </p>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--on-surface-variant)]">
            <span>
              <strong className="text-[var(--on-surface)]">{client.viewCount}</strong>{" "}
              link opens
            </span>
            <span>
              <strong className="text-[var(--on-surface)]">{client.clickCount}</strong>{" "}
              Google clicks
            </span>
            <span>
              <strong className="text-[var(--on-surface)]">{client.reviewCount}</strong>{" "}
              scripts
            </span>
            <span>{expiryLabel}</span>
            <span>Created {formatDate(client.createdAt)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap lg:max-w-[430px] lg:justify-end">
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
            Copy
          </Button>
          <Button
            size="sm"
            onClick={handleDownloadQr}
            disabled={downloadQrPending}
          >
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
                d="M3.75 3.75h5.5v5.5h-5.5zm11 0h5.5v5.5h-5.5zm-11 11h5.5v5.5h-5.5zm12.5 0v2.75m0 0V20.25m0-2.75h2.75m-2.75 0H14.5m-1.75-7.5h1.75v1.75h-1.75zm1.75 1.75h1.75v1.75H14.5zm1.75-1.75H18v1.75h-1.75zm-3.5 3.5h1.75V18h-1.75zm3.5 0H18V18h-1.75z"
              />
            </svg>
            {downloadQrPending ? "Downloading" : "Download QR"}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleGenerateReviews}
            disabled={generatePending}
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            {generatePending ? "Generating" : "Generate 100"}
          </Button>
          <Link
            href={`/review/${client.slug}`}
            target="_blank"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-[var(--on-surface)] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/30 hover:text-brand"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
            Open
          </Link>
          <Link
            href={`/dashboard/clients/${client.id}`}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold text-[var(--on-surface-variant)] transition-all duration-200 hover:bg-[var(--surface-container)] hover:text-[var(--on-surface)]"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
            Edit
          </Link>
          <Button
            size="sm"
            variant="danger"
            onClick={handleDelete}
            disabled={deletePending}
          >
            {deletePending ? "Deleting" : "Delete"}
          </Button>
        </div>
      </div>

      {feedback ? (
        <div className="mt-3 rounded-lg bg-[var(--surface-low)] px-3 py-2 text-sm text-[var(--on-surface-variant)]">
          {feedback}
        </div>
      ) : null}
    </article>
  );
}
