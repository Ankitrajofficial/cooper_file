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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

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

      startTransition(() => {
        router.push("/dashboard");
        router.refresh();
      });
    } catch (submissionError) {
      setError(toErrorMessage(submissionError));
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
    >
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
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Business sector</span>
          <select
            value={form.sector || ""}
            onChange={(event) =>
              updateField("sector", event.target.value as ClientFormInput["sector"])
            }
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
          >
            <option value="">Auto-detect sector</option>
            {BUSINESS_SECTORS.map((sector) => (
              <option key={sector} value={sector}>
                {sector}
              </option>
            ))}
          </select>
          <span className="text-sm text-slate-500">
            Choose a broad sector like hotel, hostel, restaurant, clinic, or keep
            auto-detect.
          </span>
        </label>
        <Input
          label="Specific industry or niche"
          value={form.industry}
          onChange={(event) => updateField("industry", event.target.value)}
          placeholder="Girls hostel near coaching institutes"
          helperText="This helps the AI write more specific SEO review scripts."
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
              ? `Leave blank to match your subscription expiry. Max allowed: ${toDateInputValue(
                  maxExpiryDate,
                )}`
              : "Leave blank to let the link follow your current subscription period."
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
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500">
            <span>
              This gives the AI richer context to create custom review scripts for
              this specific business.
            </span>
            <span>{(form.businessDescription || "").length}/600</span>
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
        <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending
            ? mode === "create"
              ? "Creating..."
              : "Saving..."
            : mode === "create"
              ? "Create Client"
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
