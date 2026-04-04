"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toDateInputValue } from "@/lib/billing";
import { toErrorMessage } from "@/lib/utils";
import { BUSINESS_SECTORS, type ClientFormInput } from "@/types";

type ClientFormProps = {
  mode: "create" | "edit";
  initialData?: ClientFormInput;
  clientId?: string;
  maxExpiryDate?: string | null;
};

const emptyForm: ClientFormInput = {
  businessName: "",
  city: "",
  sector: "",
  industry: "",
  businessDescription: "",
  expiresAt: "",
  googleReviewLink: "",
};

export function ClientForm({
  mode,
  initialData = emptyForm,
  clientId,
  maxExpiryDate,
}: ClientFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<ClientFormInput>(initialData);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function updateField<K extends keyof ClientFormInput>(
    key: K,
    value: ClientFormInput[K],
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    startTransition(async () => {
      try {
        const response = await fetch(
          mode === "create" ? "/api/clients" : `/api/clients/${clientId}`,
          {
            method: mode === "create" ? "POST" : "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(form),
          },
        );

        const payload = (await response.json()) as { error?: string };

        if (!response.ok) {
          throw new Error(payload.error || "Could not save client.");
        }

        router.replace("/dashboard");
      } catch (submissionError) {
        setError(toErrorMessage(submissionError));
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="surface-card-elevated p-6"
    >
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand/10 to-brand/5">
            <svg className="h-4 w-4 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-9.86a4.5 4.5 0 00-6.364 0l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
            </svg>
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-brand">
            {mode === "create" ? "New Review Link" : "Edit Review Link"}
          </p>
        </div>
        <h2 className="mt-3 text-xl font-bold tracking-[-0.01em] text-[var(--on-surface)]">
          {mode === "create"
            ? "Create a new public review page"
            : "Update this review link"}
        </h2>
        <p className="mt-1.5 text-sm text-[var(--on-surface-variant)]">
          Fill in the details below. The AI will generate tailored review scripts based on the business information you provide.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Input
          label="Business name"
          value={form.businessName}
          onChange={(event) => updateField("businessName", event.target.value)}
          placeholder="Sunrise Hostel"
          required
        />
        <Input
          label="City"
          value={form.city}
          onChange={(event) => updateField("city", event.target.value)}
          placeholder="Pune"
          required
        />
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-[var(--on-surface-variant)]">
            Business sector
          </span>
          <select
            value={form.sector || ""}
            onChange={(event) =>
              updateField(
                "sector",
                event.target.value as ClientFormInput["sector"],
              )
            }
            className="w-full rounded-xl border-0 bg-[var(--surface-highest,#e0e3e5)] px-4 py-3 text-sm text-[var(--on-surface)] shadow-none outline-none transition-all duration-200 hover:bg-[var(--surface-container)] focus:bg-[var(--surface-card)] focus:shadow-[0_0_0_2px_rgba(0,131,120,0.3)] focus:ring-0"
          >
            <option value="">Auto-detect sector</option>
            {BUSINESS_SECTORS.map((sector) => (
              <option key={sector} value={sector}>
                {sector}
              </option>
            ))}
          </select>
          <span className="text-xs text-[var(--on-surface-variant)]">
            Choose a broad sector or keep auto-detect.
          </span>
        </label>
        <Input
          label="Specific industry or niche"
          value={form.industry}
          onChange={(event) => updateField("industry", event.target.value)}
          placeholder="Girls hostel near coaching institutes"
          helperText="Helps the AI write more specific review scripts."
        />
        <Input
          label="Link expiry date"
          type="date"
          value={form.expiresAt || ""}
          onChange={(event) => updateField("expiresAt", event.target.value)}
          min={toDateInputValue(new Date())}
          max={toDateInputValue(maxExpiryDate)}
          helperText={
            maxExpiryDate
              ? `Leave blank to match subscription expiry. Max: ${toDateInputValue(maxExpiryDate)}`
              : "Leave blank to follow your current subscription period."
          }
        />
        <div className="md:col-span-2">
          <Textarea
            label="Business description for AI"
            value={form.businessDescription || ""}
            onChange={(event) =>
              updateField("businessDescription", event.target.value)
            }
            placeholder="Describe your business, ideal customers, location advantages, amenities, service style, specialties, or what makes it stand out."
            maxLength={600}
          />
          <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--on-surface-variant)]">
            <span>
              Gives the AI richer context for custom review scripts.
            </span>
            <span className="tabular-nums">{(form.businessDescription || "").length}/600</span>
          </div>
        </div>
        <Input
          label="Google review link"
          value={form.googleReviewLink}
          onChange={(event) =>
            updateField("googleReviewLink", event.target.value)
          }
          placeholder="https://g.page/r/..."
          required
        />
      </div>

      {error ? (
        <div className="mt-5 flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {error}
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-2.5">
        <Button type="submit" disabled={isPending}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d={mode === "create" ? "M12 4.5v15m7.5-7.5h-15" : "M4.5 12.75l6 6 9-13.5"} />
          </svg>
          {isPending
            ? mode === "create"
              ? "Creating..."
              : "Saving..."
            : mode === "create"
              ? "Create Link"
              : "Save Changes"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push("/dashboard")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
