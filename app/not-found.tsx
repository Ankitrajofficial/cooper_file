import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-panel">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">
          Not Found
        </p>
        <h1 className="mt-3 text-3xl font-bold text-ink">Page unavailable</h1>
        <p className="mt-3 text-slate-600">
          The page you are looking for does not exist or may have been removed.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}

