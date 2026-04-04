import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { BILLING_PLANS, formatInr } from "@/lib/billing";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Button } from "@/components/ui/button";

/* ─── Data ─── */

const featureCards = [
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
      </svg>
    ),
    title: "AI Review Scripts",
    benefit:
      "Generate fresh, high-intent Google review copy tailored to each business and location.",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.193-5.193a4.5 4.5 0 00-1.242-7.244l4.5-4.5a4.5 4.5 0 016.364 6.364l-1.757 1.757" />
      </svg>
    ),
    title: "Shareable Review Pages",
    benefit:
      "Send one clean page that makes it effortless for happy customers to leave a review.",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
      </svg>
    ),
    title: "SEO-Weighted Content",
    benefit:
      "Create natural scripts that reinforce local keywords without sounding robotic.",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
    title: "Multi-Client Control",
    benefit:
      "Manage every property, clinic, or brand from one premium dashboard.",
  },
];

const steps = [
  {
    step: "01",
    title: "Add your business",
    text: "Create a client, choose the sector, and paste the Google review link.",
    color: "from-brand/20 to-cyan-500/10",
  },
  {
    step: "02",
    title: "Generate fresh scripts",
    text: "AI creates a rotating bank of conversion-ready, locally optimized review options.",
    color: "from-cyan-500/15 to-blue-500/10",
  },
  {
    step: "03",
    title: "Share and collect reviews",
    text: "Send your page to customers so they can copy a script and post in seconds.",
    color: "from-blue-500/15 to-violet-500/10",
  },
];

const proofStats = [
  { label: "Businesses onboarded", value: "500+", icon: "🏢" },
  { label: "Review scripts generated", value: "1.2M+", icon: "✍️" },
  { label: "Average setup time", value: "3 min", icon: "⚡" },
];

const testimonials = [
  {
    quote:
      "We finally have a review flow our staff can actually use. It feels premium and gets results.",
    name: "Anika Sharma",
    role: "Operations Lead, UrbanStay Hostels",
    initials: "AS",
  },
  {
    quote:
      "The AI scripts sound natural, the page is simple, and our Google review volume improved fast.",
    name: "Dr. Mehul Arora",
    role: "Founder, Arora Dental Clinic",
    initials: "MA",
  },
];

const planHighlights = {
  tier_1: [
    "1 active review link",
    "Ideal for 1 property or clinic",
    "Expiry follows paid period",
  ],
  tier_2: [
    "5 active review links",
    "Best for multi-property operators",
    "Centralized client management",
  ],
  tier_3: [
    "Unlimited review links",
    "For agencies and growing portfolios",
    "Scales with autopay renewals",
  ],
} as const;

/* ─── Page ─── */

export default async function HomePage() {
  const session = await getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen">
      {/* ─── HERO ─── */}
      <section className="hero-gradient relative overflow-hidden pb-20 pt-0 sm:pb-28">
        <div className="absolute inset-0 premium-grid opacity-40" />
        {/* Ambient glow orbs */}
        <div className="absolute left-[15%] top-[10%] h-[500px] w-[500px] rounded-full bg-brand/[0.07] blur-[100px]" />
        <div className="absolute right-[10%] top-[20%] h-[400px] w-[400px] rounded-full bg-cyan-500/[0.06] blur-[100px]" />
        <div className="absolute bottom-0 left-1/2 h-[300px] w-[800px] -translate-x-1/2 rounded-full bg-brand/[0.04] blur-[80px]" />

        <SiteHeader />

        <div className="relative z-10 mx-auto max-w-7xl px-4 pt-12 sm:px-6 sm:pt-16 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">
            {/* Left column */}
            <div className="space-y-8">
              {/* Trust badge */}
              <div className="animate-fade-up">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-sm font-medium text-brand-muted backdrop-blur-sm">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400">
                    <span className="h-2 w-2 animate-ping rounded-full bg-emerald-400 opacity-75" />
                  </span>
                  Used by 500+ businesses
                </span>
              </div>

              {/* Headline */}
              <h1 className="animate-fade-up-delay-1 max-w-[640px] text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Turn Happy Customers Into 5‑Star Reviews{" "}
                <span className="gradient-text">Automatically</span>
              </h1>

              {/* Subheadline */}
              <p className="animate-fade-up-delay-2 max-w-lg text-lg leading-relaxed text-slate-400">
                Create AI-powered review funnels that make it easier for
                satisfied customers to leave polished Google reviews — helping
                your business rank, convert, and build trust faster.
              </p>

              {/* CTAs */}
              <div className="animate-fade-up-delay-3 flex flex-wrap gap-3">
                <Link href="/signup">
                  <Button size="lg">Start Getting Reviews</Button>
                </Link>
                <a href="#how-it-works">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="border border-white/[0.08] text-slate-300 hover:bg-white/[0.06] hover:text-white"
                  >
                    See How It Works
                  </Button>
                </a>
              </div>

              {/* Micro trust signals */}
              <div className="animate-fade-up-delay-4 flex flex-wrap gap-4 pt-2">
                {["No credit card required", "3-min setup", "Cancel anytime"].map(
                  (item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2 text-sm text-slate-500"
                    >
                      <svg
                        className="h-4 w-4 text-brand"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {item}
                    </div>
                  ),
                )}
              </div>
            </div>

            {/* Right column — Dashboard mockup */}
            <div className="animate-fade-up-delay-2 relative lg:animate-fade-up-delay-3">
              <div className="animate-gentle-float rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3 shadow-[0_32px_80px_-20px_rgba(0,0,0,0.5)] backdrop-blur-sm">
                <div className="rounded-xl border border-white/[0.06] bg-slate-950/90 p-5">
                  {/* Mockup header */}
                  <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-muted">
                        Live review engine
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-white">
                        AI Review Funnel Dashboard
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      <span className="text-[11px] font-semibold text-emerald-300">
                        32 today
                      </span>
                    </div>
                  </div>

                  {/* Mockup stats */}
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {[
                      { label: "Review bank", value: "40" },
                      { label: "Live clicks", value: "284" },
                      { label: "Status", value: "Active" },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="rounded-xl bg-white/[0.03] p-3"
                      >
                        <p className="text-[10px] text-slate-500">{stat.label}</p>
                        <p className="mt-1 text-lg font-bold text-white">
                          {stat.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* AI output preview */}
                  <div className="mt-3 rounded-xl border border-brand/15 bg-gradient-to-r from-brand/[0.06] to-cyan-500/[0.04] p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-brand-muted">
                      AI-generated review
                    </p>
                    <p className="mt-2 text-[13px] leading-6 text-slate-300">
                      &ldquo;Safe, clean, and professionally managed hostel with a
                      positive study environment and genuinely helpful staff.&rdquo;
                    </p>
                  </div>

                  {/* Mini review cards */}
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {[
                      "The environment is clean and supportive for students.",
                      "Staff are polite and the setup feels safe.",
                    ].map((text) => (
                      <div
                        key={text}
                        className="rounded-xl border border-slate-700/50 bg-white/[0.02] p-3"
                      >
                        <p className="text-[11px] leading-5 text-slate-400">
                          {text}
                        </p>
                        <div className="mt-2 inline-flex rounded-lg bg-white/[0.06] px-2.5 py-1 text-[10px] font-semibold text-slate-300">
                          Copy & Review
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom fade to white */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#f8fafc] to-transparent" />
      </section>

      <main>
        {/* ─── FEATURES ─── */}
        <section id="features" className="relative px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.15em] text-brand">
                Why it converts
              </p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
                Built to remove friction between a happy customer and a public
                review.
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-slate-600">
                Every block is designed to push clarity, trust, and action. No
                clutter. No wasted clicks.
              </p>
            </div>

            <div className="mt-14 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {featureCards.map((feature) => (
                <div
                  key={feature.title}
                  className="card-hover group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card hover:shadow-card-hover"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand/10 to-cyan-500/10 text-brand transition-transform duration-200 group-hover:scale-110">
                    {feature.icon}
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-ink">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {feature.benefit}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="section-divider mx-auto max-w-7xl" />

        {/* ─── HOW IT WORKS ─── */}
        <section
          id="how-it-works"
          className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8"
        >
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
              <div className="max-w-lg">
                <p className="text-sm font-semibold uppercase tracking-[0.15em] text-brand">
                  How it works
                </p>
                <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
                  Three steps from setup to review collection.
                </h2>
                <p className="mt-4 text-lg leading-relaxed text-slate-600">
                  Designed for operators, marketers, and owners who need a simple
                  system that looks polished and performs reliably.
                </p>
              </div>
              <div className="grid gap-4">
                {steps.map((step) => (
                  <div
                    key={step.title}
                    className="card-hover group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card hover:shadow-card-hover"
                  >
                    <div className="flex items-start gap-5">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${step.color} text-sm font-bold text-brand transition-transform duration-200 group-hover:scale-110`}
                      >
                        {step.step}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-ink">
                          {step.title}
                        </h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
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

        <div className="section-divider mx-auto max-w-7xl" />

        {/* ─── PRICING ─── */}
        <section
          id="pricing"
          className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-28 lg:px-8"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/80 to-transparent" />
          <div className="relative mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.15em] text-brand">
                Subscription plans
              </p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
                Clear pricing built around how many review links you need.
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-slate-600">
                Every plan includes AI review generation, public review funnel
                pages, shareable client links, and Cashfree autopay support.
                Yearly billing includes 2 months off.
              </p>
            </div>

            <div className="mt-14 grid gap-6 xl:grid-cols-3">
              {BILLING_PLANS.map((plan) => (
                <article
                  key={plan.tier}
                  className={`card-hover relative rounded-2xl border p-7 transition-all duration-300 ${
                    plan.tier === "tier_2"
                      ? "border-brand/20 bg-slate-950 text-white shadow-[0_8px_40px_-12px_rgba(13,148,136,0.3)]"
                      : "border-slate-200/80 bg-white text-ink shadow-card hover:shadow-card-hover"
                  }`}
                >
                  {plan.tier === "tier_2" ? (
                    <div className="absolute -top-3 right-6">
                      <span className="rounded-full bg-gradient-to-r from-brand to-cyan-500 px-4 py-1.5 text-xs font-bold text-white shadow-glow">
                        Most popular
                      </span>
                    </div>
                  ) : null}

                  <p
                    className={`text-sm font-semibold uppercase tracking-[0.15em] ${
                      plan.tier === "tier_2" ? "text-brand-muted" : "text-brand"
                    }`}
                  >
                    {plan.name}
                  </p>
                  <h3 className="mt-2 text-xl font-bold">
                    {plan.clientLimit === null
                      ? "Unlimited links"
                      : `${plan.clientLimit} review ${
                          plan.clientLimit === 1 ? "link" : "links"
                        }`}
                  </h3>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div
                      className={`rounded-xl p-4 ${
                        plan.tier === "tier_2"
                          ? "bg-white/[0.04]"
                          : "bg-slate-50"
                      }`}
                    >
                      <p
                        className={`text-xs ${
                          plan.tier === "tier_2"
                            ? "text-slate-400"
                            : "text-slate-500"
                        }`}
                      >
                        Monthly
                      </p>
                      <p className="mt-1.5 text-2xl font-extrabold tracking-tight">
                        {formatInr(plan.monthlyPriceInr)}
                      </p>
                    </div>
                    <div
                      className={`rounded-xl p-4 ${
                        plan.tier === "tier_2"
                          ? "bg-white/[0.04]"
                          : "bg-slate-50"
                      }`}
                    >
                      <p
                        className={`text-xs ${
                          plan.tier === "tier_2"
                            ? "text-slate-400"
                            : "text-slate-500"
                        }`}
                      >
                        Yearly
                      </p>
                      <p className="mt-1.5 text-2xl font-extrabold tracking-tight">
                        {formatInr(plan.yearlyPriceInr)}
                      </p>
                      <p
                        className={`mt-0.5 text-[11px] font-semibold ${
                          plan.tier === "tier_2"
                            ? "text-brand-muted"
                            : "text-brand"
                        }`}
                      >
                        2 months free
                      </p>
                    </div>
                  </div>

                  <p
                    className={`mt-5 text-sm leading-relaxed ${
                      plan.tier === "tier_2" ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    {plan.description}
                  </p>

                  <div className="mt-5 space-y-2">
                    {planHighlights[plan.tier].map((item) => (
                      <div
                        key={item}
                        className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm ${
                          plan.tier === "tier_2"
                            ? "bg-white/[0.03] text-slate-300"
                            : "bg-slate-50 text-slate-700"
                        }`}
                      >
                        <svg
                          className={`h-4 w-4 shrink-0 ${
                            plan.tier === "tier_2"
                              ? "text-brand-muted"
                              : "text-brand"
                          }`}
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
                        {item}
                      </div>
                    ))}
                  </div>

                  <div className="mt-7">
                    <Link href="/signup">
                      <Button
                        fullWidth
                        variant={plan.tier === "tier_2" ? "primary" : "secondary"}
                      >
                        Start with {plan.name}
                      </Button>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <div className="section-divider mx-auto max-w-7xl" />

        {/* ─── SOCIAL PROOF ─── */}
        <section
          id="proof"
          className="hero-gradient relative overflow-hidden px-4 py-20 text-white sm:px-6 sm:py-28 lg:px-8"
        >
          <div className="absolute inset-0 premium-grid opacity-30" />
          <div className="absolute left-[20%] top-[30%] h-[400px] w-[400px] rounded-full bg-brand/[0.06] blur-[100px]" />

          <div className="relative mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.15em] text-brand-muted">
                Social proof
              </p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Trusted by serious local businesses.
              </h2>
            </div>

            {/* Stats */}
            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              {proofStats.map((stat) => (
                <div
                  key={stat.label}
                  className="card-hover rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-sm"
                >
                  <div className="text-2xl">{stat.icon}</div>
                  <p className="mt-3 text-3xl font-extrabold tracking-tight text-white stat-glow sm:text-4xl">
                    {stat.value}
                  </p>
                  <p className="mt-1.5 text-sm text-slate-400">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Testimonials */}
            <div className="mt-8 grid gap-5 lg:grid-cols-2">
              {testimonials.map((item) => (
                <div
                  key={item.name}
                  className="card-hover rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-sm"
                >
                  {/* Stars */}
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="h-4 w-4 text-amber-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="mt-4 text-base leading-7 text-slate-200">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                  <div className="mt-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand to-cyan-500 text-sm font-bold text-white">
                      {item.initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {item.name}
                      </p>
                      <p className="text-xs text-slate-500">{item.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── LIVE PREVIEW ─── */}
        <section
          id="preview"
          className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8"
        >
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div className="max-w-lg">
                <p className="text-sm font-semibold uppercase tracking-[0.15em] text-brand">
                  Live preview
                </p>
                <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
                  A review funnel page your customers can actually use.
                </h2>
                <p className="mt-4 text-lg leading-relaxed text-slate-600">
                  Clear instructions, polished script cards, and one click to
                  copy and open Google. Simple enough for customers, premium
                  enough for your brand.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-panel">
                <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-brand">
                        Funnel page
                      </p>
                      <h3 className="mt-1 text-xl font-bold text-ink">
                        Review Kanchan Mohan Girls Hostel
                      </h3>
                    </div>
                    <div className="hidden rounded-full bg-brand-light px-3 py-1.5 text-[11px] font-semibold text-brand-dark sm:block">
                      Rotates fresh scripts
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {["Pick a review", "Copy in one tap", "Paste on Google"].map(
                      (step) => (
                        <div
                          key={step}
                          className="rounded-lg border border-slate-200/80 bg-white p-3 text-center text-xs font-medium text-slate-600"
                        >
                          {step}
                        </div>
                      ),
                    )}
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {[
                      "Safe, clean, and supportive hostel for girls in Kota with a focused environment for students.",
                      "Helpful staff, good food, and a comfortable daily setup that makes long-term stay easier.",
                    ].map((item) => (
                      <div
                        key={item}
                        className="card-hover rounded-xl border border-slate-200/80 bg-white p-4 shadow-card"
                      >
                        <p className="text-sm leading-relaxed text-slate-700">
                          {item}
                        </p>
                        <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white">
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

        {/* ─── FINAL CTA ─── */}
        <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="hero-gradient relative overflow-hidden rounded-3xl px-6 py-14 text-white shadow-[0_24px_60px_-20px_rgba(0,0,0,0.4)] sm:px-12 sm:py-20">
              <div className="absolute inset-0 premium-grid opacity-20" />
              <div className="absolute right-[10%] top-[20%] h-[300px] w-[300px] rounded-full bg-brand/[0.08] blur-[80px]" />

              <div className="relative grid gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
                <div>
                  <h2 className="max-w-xl text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
                    Stop hoping customers leave reviews. Build a system that gets
                    them.
                  </h2>
                  <p className="mt-4 max-w-lg text-lg leading-relaxed text-slate-400">
                    Launch your first AI-powered review funnel in minutes and
                    give every happy customer a faster path to posting on Google.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 lg:justify-end">
                  <Link href="/signup">
                    <Button size="lg">Start Getting Reviews</Button>
                  </Link>
                  <a href="#how-it-works">
                    <Button
                      variant="ghost"
                      size="lg"
                      className="border border-white/[0.08] text-slate-300 hover:bg-white/[0.06] hover:text-white"
                    >
                      See How It Works
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <SiteFooter />
      </main>
    </div>
  );
}
