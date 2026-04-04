"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
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
  const [isPending, setIsPending] = useState(false);

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
    setIsPending(true);

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
      setIsPending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card"
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
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-slate-700">
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
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.04)] outline-none transition-all duration-200 hover:border-slate-300 focus:border-brand focus:shadow-[0_0_0_3px_rgba(13,148,136,0.1)] focus:ring-0"
          >
            <option value="">Auto-detect sector</option>
            {BUSINESS_SECTORS.map((sector) => (
              <option key={sector} value={sector}>
                {sector}
              </option>
            ))}
          </select>
          <span className="text-xs text-slate-500">
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
          <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <span>
              Gives the AI richer context for custom review scripts.
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

      <div className="mt-6 flex flex-wrap gap-2">
        <Button type="submit" disabled={isPending}>
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
