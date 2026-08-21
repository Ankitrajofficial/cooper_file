import React from 'react';
import { Clock, LogOut } from 'lucide-react';

export default function AgencyComingSoonPage({ email, onSignOut }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8 text-slate-950 sm:px-6">
      <main className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-8">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          <Clock size={26} />
        </span>
        <h1 className="mt-5 text-3xl font-black">Agency dashboard is coming soon.</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          This account is marked for agency mode, but the agency workflow is not enabled yet.
        </p>
        {email && <p className="mt-3 text-xs font-semibold text-slate-500">{email}</p>}
        <button
          type="button"
          onClick={onSignOut}
          className="mx-auto mt-6 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </main>
    </div>
  );
}
