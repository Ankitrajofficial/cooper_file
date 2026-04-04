import Link from "next/link";

export default function NotFound() {
  return (
    <div className="hero-gradient relative min-h-screen">
      <div className="absolute inset-0 premium-grid opacity-20" />
      <div className="absolute left-1/2 top-1/3 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-brand/[0.06] blur-[80px]" />

      <main className="relative flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md text-center">
          <p className="text-8xl font-extrabold tracking-tight text-white/10">
            404
          </p>
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-white">
            Page not found
          </h1>
          <p className="mt-3 text-base text-slate-400">
            The page you&apos;re looking for doesn&apos;t exist or may have been
            removed.
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex items-center rounded-xl bg-gradient-to-b from-brand to-brand-dark px-5 py-2.5 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(0,0,0,0.1),0_4px_12px_-2px_rgba(13,148,136,0.35)] transition-all hover:-translate-y-0.5"
          >
            Back to home
          </Link>
        </div>
      </main>
    </div>
  );
}
