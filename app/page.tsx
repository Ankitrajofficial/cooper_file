import Link from "next/link";
import { redirect } from "next/navigation";
import { getPostLoginRedirectPath, getSession } from "@/lib/auth";
import {
  BILLING_PLANS,
  formatInr,
  getReviewCapacityForInterval,
  getReviewCapacityLabel,
} from "@/lib/billing";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Button } from "@/components/ui/button";

/* ─── Feature data ─── */

const featureCards = [
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
      </svg>
    ),
    title: "AI-Scripted Reviews, Zero Writer's Block",
    benefit:
      "Our AI studies your business sector, niche, and location to auto-generate hundreds of unique, natural-sounding Google review scripts — each packed with local SEO keywords that help your profile rank higher.",
    stat: "200+ scripts per link",
    statIcon: "✦",
    preview: (
      <div className="mt-4 rounded-xl border border-brand/10 bg-gradient-to-br from-brand/[0.04] to-cyan-500/[0.03] p-3.5">
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <svg key={i} className="h-3 w-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        <p className="mt-2 text-[12px] italic leading-5 text-slate-500">
          &ldquo;Exceptional service and a genuinely welcoming atmosphere. The staff goes above and beyond...&rdquo;
        </p>
        <p className="mt-1 text-[10px] font-semibold text-brand">— AI-generated script</p>
      </div>
    ),
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
      </svg>
    ),
    title: "Get 5-Star SEO-Boosting Google Reviews in 10 Seconds",
    benefit:
      "No typing, no thinking, no friction. Customers land on a branded review page, pick a pre-written script that matches their experience, copy it in one tap, and land straight on Google's review form.",
    stat: "10-second review flow",
    statIcon: "⚡",
    preview: (
      <div className="mt-4 flex items-center gap-2.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="flex-1 rounded-xl bg-emerald-50 px-3.5 py-2.5 text-[12px] font-semibold text-emerald-700">
          <div className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            Review copied — redirecting to Google
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
      </svg>
    ),
    title: "Increase Visibility on Google Maps Automatically",
    benefit:
      "Each AI-crafted script is loaded with business-relevant keywords, location markers, and natural phrasing that Google's algorithm rewards. More quality reviews = higher map pack ranking = more walk-ins and calls.",
    stat: "3x more visibility",
    statIcon: "📈",
    preview: (
      <div className="mt-4 flex items-end gap-1.5">
        {[30, 48, 42, 56, 52, 68, 78, 85, 95].map((h, i) => (
          <div key={i} className="flex-1 rounded-t-md bg-gradient-to-t from-brand to-cyan-400" style={{ height: `${h * 0.5}px`, opacity: 0.4 + i * 0.07 }} />
        ))}
      </div>
    ),
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
      </svg>
    ),
    title: "Hundreds of Unique Scripts — Never Repeat",
    benefit:
      "Generate massive review banks per client — 200, 500, or unlimited unique scripts. No two customers ever post the same review. Diversity signals authenticity to Google's algorithm and builds unshakeable trust.",
    stat: "Each script is unique",
    statIcon: "🎯",
    preview: (
      <div className="mt-4 flex items-center gap-3">
        <div className="relative flex h-14 w-14 items-center justify-center">
          <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 56 56">
            <circle cx="28" cy="28" r="24" fill="none" stroke="#e0e3e5" strokeWidth="4" />
            <circle cx="28" cy="28" r="24" fill="none" stroke="url(#grad)" strokeWidth="4" strokeDasharray="151" strokeDashoffset="15" strokeLinecap="round" />
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0d9488" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>
          <span className="text-lg font-extrabold text-brand">500</span>
        </div>
        <div>
          <p className="text-[12px] font-semibold text-slate-700">Unique scripts generated</p>
          <p className="text-[11px] text-slate-400">Zero duplicates · Algorithm-safe</p>
        </div>
      </div>
    ),
  },
];

const steps = [
  {
    step: "01",
    title: "Add Your Business Profile",
    text: "Enter your business name, sector, city, and Google review link. The AI instantly understands your niche to craft industry-specific review language.",
    tag: "Takes 60 seconds",
    color: "from-brand to-brand-dark",
    tagColor: "bg-brand/[0.08] text-brand",
  },
  {
    step: "02",
    title: "AI Generates Your Review Script Bank",
    text: "Hit 'Generate' and watch the AI create hundreds of unique, SEO-rich review scripts tailored to your business. Each reads naturally — like a real customer wrote it after a great experience.",
    tag: "200-500 unique scripts",
    color: "from-cyan-600 to-cyan-700",
    tagColor: "bg-cyan-500/[0.08] text-cyan-700",
  },
  {
    step: "03",
    title: "Share, Collect, Rank Higher",
    text: "Share your branded review page link with customers. They tap 'Copy', paste into Google, and you climb local search rankings. Every new review is another SEO signal boosting your Google Business Profile.",
    tag: "1-click posting flow",
    color: "from-violet-600 to-violet-700",
    tagColor: "bg-violet-500/[0.08] text-violet-700",
  },
];

const proofStats = [
  { label: "Businesses onboarded", value: "500+", icon: "🏢" },
  { label: "AI review scripts generated", value: "1.2M+", icon: "✍️" },
  { label: "Average setup time", value: "3 min", icon: "⚡" },
];

const testimonials = [
  {
    quote:
      "We finally have a review flow our staff can actually use. The AI scripts sound natural and our Google ranking improved within weeks.",
    name: "Anika Sharma",
    role: "Operations Lead, UrbanStay Hostels",
    initials: "AS",
  },
  {
    quote:
      "The AI writes reviews that sound like my patients. Our clinic jumped from page 3 to the Google Map Pack in two months.",
    name: "Dr. Mehul Arora",
    role: "Founder, Arora Dental Clinic",
    initials: "MA",
  },
];

/* ─── Page ─── */

export default async function HomePage() {
  const session = await getSession();

  if (session) {
    redirect(getPostLoginRedirectPath(session.role));
  }

  return (
    <div className="min-h-screen">
      {/* ─── HERO ─── */}
      <section className="hero-gradient relative flex min-h-screen flex-col overflow-hidden">
        <div className="absolute inset-0 premium-grid opacity-40" />
        {/* Ambient glow orbs */}
        <div className="absolute left-[15%] top-[10%] h-[500px] w-[500px] rounded-full bg-brand/[0.07] blur-[100px]" />
        <div className="absolute right-[10%] top-[20%] h-[400px] w-[400px] rounded-full bg-cyan-500/[0.06] blur-[100px]" />
        <div className="absolute bottom-0 left-1/2 h-[300px] w-[800px] -translate-x-1/2 rounded-full bg-brand/[0.04] blur-[80px]" />

        <SiteHeader />

        <div className="relative z-10 mx-auto flex max-w-7xl flex-1 items-center px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">
            {/* Left column */}
            <div className="space-y-8">
              {/* Trust badge */}
              <div className="animate-fade-up">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-sm font-medium text-brand-muted backdrop-blur-sm">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400">
                    <span className="h-2 w-2 animate-ping rounded-full bg-emerald-400 opacity-75" />
                  </span>
                  Trusted by 500+ businesses across India
                </span>
              </div>

              {/* Headline */}
              <h1 className="animate-fade-up-delay-1 max-w-[640px] text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Get 5-star SEO-boosting Google reviews in 10 seconds.{" "}
                <span className="gradient-text">Turn customers into rankings.</span>
              </h1>

              {/* Subheadline */}
              <p className="animate-fade-up-delay-2 max-w-lg text-lg leading-relaxed text-slate-400">
                Increase visibility on Google Maps automatically with AI-written
                review scripts your customers can copy and post in one click.
                Every happy customer becomes a stronger local SEO signal for
                your business.
              </p>

              {/* CTAs */}
              <div className="animate-fade-up-delay-3 flex flex-wrap gap-3">
                <Link href="/signup">
                  <Button size="lg">Start Getting Reviews Free</Button>
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
              <div className="animate-fade-up-delay-4 flex flex-wrap gap-5 pt-2">
                {[
                  "Turn customers into rankings",
                  "10-second review flow",
                  "Boost Google Maps visibility",
                ].map((item) => (
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
                ))}
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
                        AI review engine
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-white">
                        Review Script Dashboard
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      <span className="text-[11px] font-semibold text-emerald-300">
                        32 scripts today
                      </span>
                    </div>
                  </div>

                  {/* Mockup stats */}
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {[
                      { label: "AI scripts", value: "500" },
                      { label: "Google clicks", value: "284" },
                      { label: "SEO impact", value: "↑ 340%" },
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
                    <div className="flex items-center gap-2">
                      <span className="data-pulse" />
                      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-brand-muted">
                        AI-generated review script
                      </p>
                    </div>
                    <p className="mt-2 text-[13px] leading-6 text-slate-300">
                      &ldquo;Truly professional service with attention to every detail.
                      The team made the experience seamless from start to finish.
                      Highly recommend for anyone looking for quality and reliability.&rdquo;
                    </p>
                    <div className="mt-2.5 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-brand/20 px-2.5 py-0.5 text-[10px] font-semibold text-brand-muted">
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        SEO keywords detected
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/15 px-2.5 py-0.5 text-[10px] font-semibold text-cyan-300">
                        Natural tone verified
                      </span>
                    </div>
                  </div>

                  {/* Mini review cards */}
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {[
                      "Outstanding quality and timely delivery. Would definitely use their services again.",
                      "Professional, efficient, and friendly team. Made the entire process effortless.",
                    ].map((text) => (
                      <div
                        key={text}
                        className="rounded-xl border border-slate-700/50 bg-white/[0.02] p-3"
                      >
                        <p className="text-[11px] leading-5 text-slate-400">
                          {text}
                        </p>
                        <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-white/[0.06] px-2.5 py-1 text-[10px] font-semibold text-slate-300">
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          1-Click Copy
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

      </section>

      <main>
        {/* ─── PRICING ─── */}
        <section
          id="pricing"
          className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-28 lg:px-8"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/80 to-transparent" />
          <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/[0.02] blur-[100px]" />

          <div className="relative mx-auto max-w-7xl">
            <div className="flex flex-col items-center text-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-brand/[0.06] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-brand">
                Pricing That Scales
              </span>
              <h2 className="mt-5 max-w-2xl text-3xl font-extrabold tracking-tight text-ink sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
                Start with one AI review link.{" "}
                <span className="gradient-text">Scale to unlimited.</span>
              </h2>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-500">
                Every plan includes AI-scripted review generation, branded
                one-click review pages, and automatic billing. Pick yearly and
                save 2 months.
              </p>
            </div>

            <div className="mt-14 grid gap-6 xl:grid-cols-3">
              {BILLING_PLANS.map((plan, index) => (
                <article
                  key={plan.tier}
                  className={`card-hover relative rounded-2xl p-7 transition-all duration-300 animate-fade-up ${
                    plan.tier === "tier_2"
                      ? "border-2 border-brand/20 bg-slate-950 text-white shadow-[0_8px_40px_-12px_rgba(13,148,136,0.3)]"
                      : "overflow-hidden bg-white text-ink shadow-ambient ghost-border-interactive hover:shadow-ambient-hover"
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {plan.tier === "tier_2" ? (
                    <div className="absolute -top-3 right-6">
                      <span className="rounded-full bg-gradient-to-r from-brand to-cyan-500 px-4 py-1.5 text-[11px] font-bold text-white shadow-glow">
                        Most popular
                      </span>
                    </div>
                  ) : null}

                  <p
                    className={`text-[11px] font-bold uppercase tracking-[0.2em] ${
                      plan.tier === "tier_2" ? "text-brand-muted" : "text-brand"
                    }`}
                  >
                    {plan.name}
                  </p>

                  <h3 className="mt-2 text-lg font-bold">
                    {plan.tier === "tier_1"
                      ? "Perfect for a single Google Business Profile"
                      : plan.tier === "tier_2"
                        ? "For growing brands with multiple locations"
                        : "Built for agencies and large portfolios"}
                  </h3>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div
                      className={`rounded-xl p-4 ${
                        plan.tier === "tier_2"
                          ? "bg-white/[0.04]"
                          : "bg-[var(--surface-low)]"
                      }`}
                    >
                      <p
                        className={`text-[11px] font-medium ${
                          plan.tier === "tier_2"
                            ? "text-slate-400"
                            : "text-slate-400"
                        }`}
                      >
                        Monthly
                      </p>
                      <p className="mt-1.5 text-3xl font-extrabold tracking-tight">
                        {formatInr(plan.monthlyPriceInr)}
                      </p>
                    </div>
                    <div
                      className={`rounded-xl p-4 ${
                        plan.tier === "tier_2"
                          ? "bg-white/[0.04]"
                          : "bg-[var(--surface-low)]"
                      }`}
                    >
                      <p
                        className={`text-[11px] font-medium ${
                          plan.tier === "tier_2"
                            ? "text-slate-400"
                            : "text-slate-400"
                        }`}
                      >
                        Yearly
                      </p>
                      <p className="mt-1.5 text-3xl font-extrabold tracking-tight">
                        {formatInr(plan.yearlyPriceInr)}
                      </p>
                      <p
                        className={`mt-0.5 text-[11px] font-bold ${
                          plan.tier === "tier_2"
                            ? "text-brand-muted"
                            : "text-brand"
                        }`}
                      >
                        Save {formatInr(plan.monthlyPriceInr * 12 - plan.yearlyPriceInr)}
                      </p>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mt-5 space-y-2">
                    {[
                      plan.clientLimit === null
                        ? "Unlimited AI review links"
                        : `${plan.clientLimit} active AI review ${plan.clientLimit === 1 ? "link" : "links"}`,
                      plan.reviewsPerLink === null
                        ? "Unlimited AI-scripted reviews"
                        : `${getReviewCapacityForInterval(plan.reviewsPerLink, "monthly")?.toLocaleString("en-IN")} AI-scripted reviews / month · ${getReviewCapacityForInterval(plan.reviewsPerLink, "yearly")?.toLocaleString("en-IN")} / year`,
                      plan.reviewsPerLink === null
                        ? "Unlimited review capacity on yearly billing too"
                        : `Yearly plan includes ${getReviewCapacityLabel(plan.reviewsPerLink, "yearly")}`,
                      "Branded one-click review pages",
                      "SEO-optimized review scripts",
                      plan.tier === "tier_1"
                        ? "Google review form redirect"
                        : plan.tier === "tier_2"
                          ? "Priority AI script generation"
                          : "Dedicated priority support",
                    ].map((item) => (
                      <div
                        key={item}
                        className={`flex items-center gap-3 text-sm ${
                          plan.tier === "tier_2"
                            ? "text-slate-300"
                            : "text-slate-600"
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

            {/* Trust row */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
              {[
                { icon: "🔒", text: "Secured by Cashfree" },
                { icon: "↻", text: "Cancel anytime" },
                { icon: "⚡", text: "Setup in 3 minutes" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-2">
                  <span>{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="section-divider mx-auto max-w-7xl" />

        <div className="section-divider mx-auto max-w-7xl" />

        {/* ─── FEATURES (THE AI ADVANTAGE) ─── */}
        <section id="features" className="relative px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          {/* Background accent */}
          <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-brand/[0.02] blur-[120px]" />

          <div className="relative mx-auto max-w-7xl">
            <div className="flex flex-col items-center text-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-brand/[0.06] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-brand">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
                The AI Advantage
              </span>
              <h2 className="mt-5 max-w-3xl text-3xl font-extrabold tracking-tight text-ink sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
                Your AI Scriptwriter That Turns 5-Star Experiences Into{" "}
                <span className="gradient-text">Google SEO Fuel</span>
              </h2>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-500">
                Most businesses lose 95% of happy customers at the review stage.
                Review Machine&apos;s AI writes natural, keyword-rich review scripts
                your customers can post in one click — turning every satisfied
                customer into a ranking signal.
              </p>
            </div>

            <div className="mt-16 grid gap-5 sm:grid-cols-2">
              {featureCards.map((feature, index) => (
                <article
                  key={feature.title}
                  className="card-hover group overflow-hidden rounded-2xl bg-white p-6 shadow-ambient ghost-border-interactive hover:shadow-ambient-hover animate-fade-up sm:p-7"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand/12 to-cyan-500/8 text-brand transition-transform duration-300 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(13,148,136,0.15)]">
                      {feature.icon}
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand/[0.06] px-2.5 py-1 text-[10px] font-bold text-brand">
                      {feature.statIcon} {feature.stat}
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-bold tracking-[-0.01em] text-ink">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">
                    {feature.benefit}
                  </p>
                  {feature.preview}
                </article>
              ))}
            </div>
          </div>
        </section>

        <div className="section-divider mx-auto max-w-7xl" />

        {/* ─── HOW IT WORKS ─── */}
        <section
          id="how-it-works"
          className="relative px-4 py-20 sm:px-6 sm:py-28 lg:px-8"
        >
          {/* Subtle bg accent */}
          <div className="absolute right-0 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-cyan-500/[0.02] blur-[100px]" />

          <div className="relative mx-auto max-w-7xl">
            <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
              <div className="max-w-lg lg:sticky lg:top-28">
                <span className="inline-flex items-center gap-2 rounded-full bg-brand/[0.06] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-brand">
                  From Setup to Ranking
                </span>
                <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
                  Go from zero reviews to{" "}
                  <span className="gradient-text">SEO dominance</span> in three moves.
                </h2>
                <p className="mt-4 text-lg leading-relaxed text-slate-500">
                  No copywriting skills needed. No review templates. Just
                  AI-powered review scripts that sound like real customers wrote
                  them.
                </p>

                {/* Mini preview mockup */}
                <div className="mt-8 hidden rounded-2xl bg-slate-950 p-4 shadow-panel lg:block">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="data-pulse" />
                      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-brand-muted">
                        Live review page
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-300">
                      Active
                    </span>
                  </div>
                  <div className="mt-3 space-y-2">
                    {[
                      "\"Professional and reliable service. Exceeded expectations in every way.\"",
                      "\"Friendly staff, clean facilities, and excellent attention to detail.\"",
                    ].map((review) => (
                      <div key={review} className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-3">
                        <p className="text-[11px] leading-5 text-slate-400">{review}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-md bg-brand/20 px-2 py-0.5 text-[9px] font-bold text-brand-muted">
                            SEO score: High
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-md bg-white/[0.06] px-2 py-0.5 text-[9px] font-semibold text-slate-400">
                            Copy & Post →
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Steps */}
              <div className="relative grid gap-5">
                {/* Connecting line */}
                <div className="absolute left-7 top-14 hidden h-[calc(100%-112px)] w-px bg-gradient-to-b from-brand/20 via-cyan-500/15 to-violet-500/10 lg:block" />

                {steps.map((step, index) => (
                  <article
                    key={step.title}
                    className="card-hover group relative overflow-hidden rounded-2xl bg-white p-6 shadow-ambient ghost-border-interactive hover:shadow-ambient-hover animate-fade-up sm:p-7"
                    style={{ animationDelay: `${index * 0.12}s` }}
                  >
                    <div className="flex items-start gap-5">
                      <div className={`relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${step.color} text-lg font-extrabold text-white shadow-lg transition-transform duration-300 group-hover:scale-110`}>
                        {step.step}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <h3 className="text-lg font-bold tracking-[-0.01em] text-ink">
                            {step.title}
                          </h3>
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${step.tagColor}`}>
                            {step.tag}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-slate-500">
                          {step.text}
                        </p>

                        {/* Step 2 special — AI preview */}
                        {step.step === "02" && (
                          <div className="mt-4 rounded-xl border border-brand/10 bg-gradient-to-r from-brand/[0.04] to-cyan-500/[0.03] p-3.5">
                            <div className="flex items-center gap-1.5">
                              <svg className="h-3.5 w-3.5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                              </svg>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-brand">AI output →</p>
                            </div>
                            <p className="mt-1.5 text-[12px] italic leading-5 text-slate-500">
                              &ldquo;Consistently excellent food quality and genuinely warm hospitality. A hidden gem that deserves more recognition.&rdquo;
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
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
            <div className="flex flex-col items-center text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-brand-muted">
                Social Proof
              </span>
              <h2 className="mt-5 max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">
                Businesses that use AI-scripted reviews{" "}
                <span className="gradient-text">rank faster on Google.</span>
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
                <span className="inline-flex items-center gap-2 rounded-full bg-brand/[0.06] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-brand">
                  Live Preview
                </span>
                <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
                  A branded review page your customers{" "}
                  <span className="gradient-text">actually want to use.</span>
                </h2>
                <p className="mt-4 text-lg leading-relaxed text-slate-500">
                  Customers pick an AI-scripted review that matches their
                  experience, copy it in one tap, and land on Google&apos;s
                  review form. More completed reviews = stronger Google profile
                  momentum for the business.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  {[
                    "AI-scripted for SEO",
                    "One-tap copy",
                    "Google auto-redirect",
                  ].map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-1.5 rounded-full bg-brand/[0.06] px-3 py-1 text-[11px] font-bold text-brand"
                    >
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-ambient-lg ghost-border">
                <div className="rounded-xl bg-[var(--surface-low)] p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand">
                        AI review page
                      </p>
                      <h3 className="mt-1 text-xl font-bold text-ink">
                        Review Kanchan Mohan Girls Hostel
                      </h3>
                    </div>
                    <div className="hidden items-center gap-1.5 rounded-full bg-brand/[0.08] px-3 py-1.5 text-[11px] font-bold text-brand sm:flex">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                      </svg>
                      AI-scripted reviews
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {["Pick an AI review", "Copy in one tap", "Post on Google"].map(
                      (step, i) => (
                        <div
                          key={step}
                          className="flex items-center gap-2 rounded-lg bg-white p-3 text-center text-xs font-semibold text-slate-600 shadow-[0_1px_2px_rgba(25,28,30,0.04)]"
                        >
                          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-brand/10 text-[10px] font-bold text-brand">
                            {i + 1}
                          </span>
                          {step}
                        </div>
                      ),
                    )}
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {[
                      "Safe, clean, and supportive hostel for girls in Kota with a focused environment for students preparing for competitive exams.",
                      "Helpful staff, nutritious meals, and a comfortable living setup that makes long-term stays feel like home.",
                    ].map((item) => (
                      <div
                        key={item}
                        className="card-hover rounded-xl bg-white p-4 shadow-ambient ghost-border-interactive"
                      >
                        <p className="text-sm leading-relaxed text-slate-600">
                          {item}
                        </p>
                        <div className="mt-3 flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white">
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
                            Copy & Post
                          </span>
                          <span className="rounded-full bg-brand/[0.06] px-2 py-0.5 text-[9px] font-bold text-brand">SEO score: High</span>
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
                    Stop hoping for reviews.{" "}
                    <span className="gradient-text">Let AI write them for you.</span>
                  </h2>
                  <p className="mt-4 max-w-lg text-lg leading-relaxed text-slate-400">
                    Launch your first AI review link in minutes. Every satisfied
                    customer gets a branded page with pre-written, SEO-optimized
                    scripts they can post to Google in one click.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 lg:justify-end">
                  <Link href="/signup">
                    <Button size="lg">Start Getting Reviews Free</Button>
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
