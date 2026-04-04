import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { SiteHeader } from "@/components/site/site-header";
import { Button } from "@/components/ui/button";

const featureCards = [
  {
    icon: "AI",
    title: "AI Review Scripts",
    benefit: "Generate fresh, high-intent Google review copy tailored to each business and location.",
  },
  {
    icon: "PG",
    title: "Shareable Review Pages",
    benefit: "Send one clean page that makes it effortless for happy customers to leave a review.",
  },
  {
    icon: "SEO",
    title: "SEO-Weighted Content",
    benefit: "Create natural scripts that reinforce local keywords without sounding robotic or forced.",
  },
  {
    icon: "CL",
    title: "Multi-Client Control",
    benefit: "Manage every property, clinic, cafe, or brand from one premium dashboard.",
  },
];

const steps = [
  {
    icon: "01",
    title: "Add your business",
    text: "Create a client, choose the sector, and paste the Google review link.",
  },
  {
    icon: "02",
    title: "Generate fresh scripts",
    text: "AI creates a rotating bank of conversion-ready, locally optimized review options.",
  },
  {
    icon: "03",
    title: "Share and collect reviews",
    text: "Send your page to customers so they can copy a script and post in seconds.",
  },
];

const proofStats = [
  { label: "Businesses onboarded", value: "500+" },
  { label: "Review scripts generated", value: "1.2M+" },
  { label: "Average setup time", value: "3 min" },
];

const testimonials = [
  {
    quote:
      "We finally have a review flow our staff can actually use. It feels premium and gets results.",
    name: "Anika Sharma",
    role: "Operations Lead, UrbanStay Hostels",
  },
  {
    quote:
      "The AI scripts sound natural, the page is simple, and our Google review volume improved fast.",
    name: "Dr. Mehul Arora",
    role: "Founder, Arora Dental Clinic",
  },
];

export default async function HomePage() {
  const session = await getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen pb-12">
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden px-4 pb-20 pt-8 sm:px-6 lg:px-8">
          <div className="absolute inset-0 premium-grid opacity-60" />
          <div className="absolute left-1/2 top-24 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-500/20 blur-3xl" />
          <div className="absolute right-16 top-20 h-64 w-64 rounded-full bg-brand/20 blur-3xl" />
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <section className="relative z-10 space-y-8 pt-6 text-white">
              <div className="space-y-5">
                <p className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-brand-light shadow-[0_18px_45px_-28px_rgba(34,211,238,0.8)] backdrop-blur-xl">
                  Used by 500+ businesses
                </p>
                <h1 className="max-w-4xl text-5xl font-black tracking-[-0.04em] sm:text-6xl lg:text-7xl">
                  Turn Happy Customers Into 5-Star Reviews
                  <span className="bg-gradient-to-r from-brand-light to-cyan-300 bg-clip-text text-transparent">
                    {" "}
                    Automatically
                  </span>
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
                  Create AI-powered review funnels that make it easier for satisfied
                  customers to leave polished Google reviews and help your business
                  rank, convert, and build trust faster.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link href="/signup">
                  <Button className="px-6 py-3.5 text-base">
                    Start Getting Reviews
                  </Button>
                </Link>
                <a href="#how-it-works">
                  <Button
                    variant="secondary"
                    className="border border-white/15 bg-white/10 px-6 py-3.5 text-base text-white hover:bg-white/15"
                  >
                    See How It Works
                  </Button>
                </a>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                {["Trusted by modern local brands", "Fast setup", "No-code workflow"].map(
                  (item) => (
                    <div
                      key={item}
                      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 backdrop-blur"
                    >
                      {item}
                    </div>
                  ),
                )}
              </div>
            </section>

            <section className="relative z-10">
              <div className="glass-panel overflow-hidden rounded-[2rem] border border-white/15 p-4 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.9)]">
                <div className="rounded-[1.75rem] border border-slate-200/80 bg-slate-950 p-4 text-white shadow-2xl">
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/80">
                        Live review engine
                      </p>
                      <p className="mt-1 text-lg font-semibold">
                        AI Review Funnel Dashboard
                      </p>
                    </div>
                    <div className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-300">
                      32 reviews generated today
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
                    <div className="space-y-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-400">Client</p>
                          <h3 className="text-xl font-semibold">UrbanStay Hostel</h3>
                        </div>
                        <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-200">
                          Hostel
                        </span>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl bg-slate-900/70 p-4">
                          <p className="text-xs text-slate-400">Review bank</p>
                          <p className="mt-2 text-2xl font-bold">40</p>
                        </div>
                        <div className="rounded-2xl bg-slate-900/70 p-4">
                          <p className="text-xs text-slate-400">Live clicks</p>
                          <p className="mt-2 text-2xl font-bold">284</p>
                        </div>
                        <div className="rounded-2xl bg-slate-900/70 p-4">
                          <p className="text-xs text-slate-400">Page status</p>
                          <p className="mt-2 text-2xl font-bold">Active</p>
                        </div>
                      </div>
                      <div className="rounded-2xl border border-brand/20 bg-gradient-to-r from-brand/15 to-cyan-500/10 p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-brand-light">
                          AI output
                        </p>
                        <p className="mt-2 text-sm leading-7 text-slate-200">
                          Safe, clean, and professionally managed girls hostel in Kota
                          with a positive study environment and genuinely helpful staff.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                      <p className="text-sm font-semibold text-slate-300">
                        Public review page preview
                      </p>
                      <div className="space-y-3 rounded-3xl bg-white p-4 text-slate-900">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-[0.18em] text-brand">
                              Review Funnel
                            </p>
                            <h4 className="mt-1 text-lg font-bold">
                              Review UrbanStay Hostel
                            </h4>
                          </div>
                          <span className="rounded-full bg-brand-light px-3 py-1 text-xs font-semibold text-brand-dark">
                            Copied on click
                          </span>
                        </div>
                        {[
                          "The environment is clean, comfortable, and really supportive for students preparing in Kota.",
                          "Staff are polite, responsive, and the overall hostel setup feels safe and well managed.",
                        ].map((item) => (
                          <div
                            key={item}
                            className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm transition hover:-translate-y-0.5"
                          >
                            <p className="text-sm leading-6 text-slate-700">{item}</p>
                            <div className="mt-3 inline-flex rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white">
                              Copy & Review
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </section>

        <section
          id="features"
          className="bg-[#f7fafc] px-4 py-20 sm:px-6 lg:px-8"
        >
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">
                Why it converts
              </p>
              <h2 className="mt-3 text-4xl font-black tracking-[-0.03em] text-ink sm:text-5xl">
                Built to remove friction between a happy customer and a public review.
              </h2>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
                Every block is designed to push clarity, trust, and action. No clutter.
                No wasted clicks.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {featureCards.map((feature) => (
                <div
                  key={feature.title}
                  className="group rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_-35px_rgba(15,23,42,0.35)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_80px_-35px_rgba(8,145,178,0.35)]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand/15 to-cyan-500/15 text-sm font-bold text-brand transition group-hover:scale-105">
                    {feature.icon}
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-ink">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {feature.benefit}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="bg-white px-4 py-20 sm:px-6 lg:px-8"
        >
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
              <div className="max-w-xl">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">
                  How it works
                </p>
                <h2 className="mt-3 text-4xl font-black tracking-[-0.03em] text-ink sm:text-5xl">
                  Three steps from setup to review collection.
                </h2>
                <p className="mt-4 text-lg leading-8 text-slate-600">
                  This is designed for operators, marketers, and owners who need a
                  simple system that looks polished and performs reliably.
                </p>
              </div>
              <div className="grid gap-5">
                {steps.map((step) => (
                  <div
                    key={step.title}
                    className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 shadow-sm"
                  >
                    <div className="flex flex-wrap items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-sm font-bold text-white">
                        {step.icon}
                      </div>
                      <div className="max-w-xl">
                        <h3 className="text-xl font-semibold text-ink">{step.title}</h3>
                        <p className="mt-2 text-sm leading-7 text-slate-600">
                          {step.text}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          id="proof"
          className="bg-slate-950 px-4 py-20 text-white sm:px-6 lg:px-8"
        >
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-light">
                Social proof
              </p>
              <h2 className="mt-3 text-4xl font-black tracking-[-0.03em] sm:text-5xl">
                Serious SaaS trust signals for serious local businesses.
              </h2>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {proofStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 backdrop-blur"
                >
                  <p className="text-4xl font-black tracking-[-0.04em] text-white">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-sm text-slate-300">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              {testimonials.map((item) => (
                <div
                  key={item.name}
                  className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 backdrop-blur"
                >
                  <p className="text-lg leading-8 text-slate-100">“{item.quote}”</p>
                  <div className="mt-6">
                    <p className="font-semibold text-white">{item.name}</p>
                    <p className="text-sm text-slate-400">{item.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="preview"
          className="bg-[#f3f7fb] px-4 py-20 sm:px-6 lg:px-8"
        >
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
              <div className="max-w-xl">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">
                  Live preview
                </p>
                <h2 className="mt-3 text-4xl font-black tracking-[-0.03em] text-ink sm:text-5xl">
                  A review funnel page your customers can actually use.
                </h2>
                <p className="mt-4 text-lg leading-8 text-slate-600">
                  Clear instructions, polished script cards, and one click to copy and
                  open Google. Simple enough for customers, premium enough for your
                  brand.
                </p>
              </div>

              <div className="rounded-[2rem] border border-white/80 bg-white p-5 shadow-[0_28px_80px_-40px_rgba(15,23,42,0.35)]">
                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-brand">
                        Funnel page
                      </p>
                      <h3 className="mt-1 text-2xl font-bold text-ink">
                        Review Kanchan Mohan Girls Hostel
                      </h3>
                    </div>
                    <div className="rounded-full bg-brand-light px-4 py-2 text-xs font-semibold text-brand-dark">
                      Rotates fresh scripts
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    {["Pick a review", "Copy in one tap", "Paste on Google"].map(
                      (step) => (
                        <div
                          key={step}
                          className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-medium text-slate-700"
                        >
                          {step}
                        </div>
                      ),
                    )}
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    {[
                      "Safe, clean, and supportive hostel for girls in Kota with a focused environment for students.",
                      "Helpful staff, good food, and a comfortable daily setup that makes long-term stay easier.",
                    ].map((item) => (
                      <div
                        key={item}
                        className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-panel"
                      >
                        <p className="text-sm leading-7 text-slate-700">{item}</p>
                        <div className="mt-4 inline-flex rounded-xl bg-slate-950 px-4 py-2 text-xs font-semibold text-white">
                          Copy & Review
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="overflow-hidden rounded-[2.25rem] bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950 p-8 text-white shadow-[0_32px_90px_-40px_rgba(15,23,42,0.8)] sm:p-12">
              <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-light">
                    Final CTA
                  </p>
                  <h2 className="mt-3 max-w-3xl text-4xl font-black tracking-[-0.03em] sm:text-5xl">
                    Stop hoping customers leave reviews. Build a system that gets them.
                  </h2>
                  <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
                    Launch your first AI-powered review funnel in minutes and give every
                    happy customer a faster path to posting on Google.
                  </p>
                </div>
                <div className="flex flex-wrap gap-4 lg:justify-end">
                  <Link href="/signup">
                    <Button className="px-6 py-3.5 text-base">
                      Start Getting Reviews
                    </Button>
                  </Link>
                  <a href="#how-it-works">
                    <Button
                      variant="secondary"
                      className="border border-white/10 bg-white/10 px-6 py-3.5 text-base text-white hover:bg-white/15"
                    >
                      See How It Works
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
