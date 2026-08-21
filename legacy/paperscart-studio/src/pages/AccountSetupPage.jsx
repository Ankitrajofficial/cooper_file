import React, { useState } from 'react';
import { Briefcase, CheckCircle2, Clock, Leaf, Store } from 'lucide-react';
import { getSelectableWorkspaceModeOptions } from '../utils/companyProfile';

function ModeIcon({ id }) {
  if (id === 'business') return <Store size={22} />;
  if (id === 'agency') return <Clock size={22} />;
  return <Briefcase size={22} />;
}

export default function AccountSetupPage({
  email,
  initialMode = '',
  onComplete,
  onSignOut,
}) {
  const selectableModes = getSelectableWorkspaceModeOptions();
  const initialSelectableMode = selectableModes.some((mode) => mode.id === initialMode)
    ? initialMode
    : selectableModes[0]?.id || '';
  const [selectedMode, setSelectedMode] = useState(initialSelectableMode);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!selectedMode) return;
    onComplete(selectedMode);
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 text-slate-950 sm:px-6">
      <main className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div>
              <img src="/paperscart-logo.png" alt="PapersCart" className="h-9 w-auto max-w-[170px] object-contain" />
              {email && <p className="text-sm text-slate-500">{email}</p>}
            </div>
          </div>
          <button
            type="button"
            onClick={onSignOut}
            className="self-start rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 sm:self-auto"
          >
            Sign out
          </button>
        </div>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-emerald-50 px-5 py-5 sm:px-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-black uppercase tracking-wide text-emerald-800">
              <Leaf size={15} />
              Paperless workspace setup
            </span>
            <h1 className="mt-4 max-w-3xl text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
              Open the freelancer dashboard for this account.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              This deployment is focused on freelancers: client onboarding, invoices, agreements, timelines, and saved history.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-5 sm:p-8">
            <div className="grid gap-3 md:grid-cols-2">
              {selectableModes.map((option) => {
                const selected = selectedMode === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => !option.comingSoon && setSelectedMode(option.id)}
                    disabled={option.comingSoon}
                    className={`flex min-h-[180px] flex-col rounded-xl border p-4 text-left transition-all ${
                      selected
                        ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                        : option.comingSoon
                        ? 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400'
                        : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50'
                    }`}
                  >
                    <span className={`mb-5 flex h-11 w-11 items-center justify-center rounded-lg ${
                      selected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <ModeIcon id={option.id} />
                    </span>
                    <span className="text-base font-black text-slate-950">{option.label}</span>
                    <span className={`mt-2 text-sm leading-6 ${option.comingSoon ? 'text-slate-400' : 'text-slate-600'}`}>
                      {option.description}
                    </span>
                    {selected && (
                      <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-black text-emerald-700">
                        <CheckCircle2 size={16} />
                        Selected
                      </span>
                    )}
                    {option.comingSoon && (
                      <span className="mt-auto pt-4 text-sm font-black text-slate-400">Coming soon</span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm leading-6 text-slate-600">
                You can still edit profile, logo, UPI, and bank details after opening the dashboard.
              </p>
              <button
                type="submit"
                disabled={!selectedMode}
                className="shrink-0 rounded-lg bg-slate-950 px-5 py-3 text-sm font-black text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
