import React from 'react';
import {
  ArrowRight,
  LogOut,
  FileText,
  FileSignature,
  Calendar,
  Flame,
  Dumbbell,
  Sparkles,
} from 'lucide-react';
import BrandLogo from '../components/BrandLogo';

const CHOICES = [
  {
    id: 'tools',
    eyebrow: 'Freelancing tools',
    title: 'Create paperwork',
    description: 'Invoices, agreements, timelines, lead sheets, QR cards & more — branded and PDF-ready in minutes.',
    cta: 'Open tools',
    image: '/create-paperwork-v4.jpg',
    accentBar: 'from-emerald-400 via-emerald-500 to-teal-500',
    eyebrowPill: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-100',
    ctaPill: 'bg-emerald-600 group-hover:bg-emerald-700',
    glow: 'bg-emerald-400/20',
    focusRing: 'focus-visible:ring-emerald-500',
    hoverBorder: 'hover:border-emerald-200',
    chips: [
      { icon: FileText, label: 'Invoices' },
      { icon: FileSignature, label: 'Agreements' },
      { icon: Calendar, label: 'Timelines' },
    ],
  },
  {
    id: 'contracts',
    eyebrow: 'Self-commitment',
    title: 'Buy contracts',
    description: 'Commit to a personal goal — discipline, fitness, study, or quitting a habit. Check in daily and earn a reward.',
    cta: 'Browse contracts',
    image: '/self-commitment-v4.jpg',
    accentBar: 'from-indigo-400 via-violet-500 to-fuchsia-500',
    eyebrowPill: 'bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-100',
    ctaPill: 'bg-indigo-600 group-hover:bg-indigo-700',
    glow: 'bg-indigo-400/20',
    focusRing: 'focus-visible:ring-indigo-500',
    hoverBorder: 'hover:border-indigo-200',
    chips: [
      { icon: Flame, label: 'Discipline' },
      { icon: Dumbbell, label: 'Fitness' },
      { icon: Sparkles, label: 'Streaks' },
    ],
  },
];

export default function HubChooserPage({ email, onChooseTools, onChooseContracts, onSignOut }) {
  const handlers = {
    tools: onChooseTools,
    contracts: onChooseContracts,
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[32rem] bg-gradient-to-b from-white via-white/60 to-transparent" />
      <div aria-hidden className="pointer-events-none absolute -left-32 top-24 h-80 w-80 rounded-full bg-emerald-300/25 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -right-32 top-48 h-80 w-80 rounded-full bg-indigo-300/25 blur-3xl" />

      <header className="relative border-b border-slate-200/80 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
          <BrandLogo />
          <div className="flex items-center gap-3">
            {email && (
              <span className="hidden max-w-[200px] truncate rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-500 sm:inline">
                {email}
              </span>
            )}
            <button
              type="button"
              onClick={onSignOut}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
            >
              <LogOut size={15} /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="relative mx-auto flex min-h-[calc(100vh-4.4rem)] max-w-5xl flex-col justify-center px-4 py-12 sm:px-6 sm:py-16">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-black uppercase tracking-wider text-slate-500 shadow-sm">
            <Sparkles size={12} className="text-emerald-600" /> Welcome back
          </span>
          <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-[2.6rem] sm:leading-tight">What do you want to do?</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
            Pick a workspace to get started. You can switch between them anytime.
          </p>
        </div>

        <div className="mx-auto mt-10 grid w-full max-w-3xl gap-5 sm:grid-cols-2 sm:gap-6">
          {CHOICES.map((choice) => (
            <button
              key={choice.id}
              type="button"
              onClick={handlers[choice.id]}
              className={`group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white text-left shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_28px_-18px_rgba(15,23,42,0.25)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_1px_2px_rgba(15,23,42,0.04),0_28px_50px_-24px_rgba(15,23,42,0.35)] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${choice.hoverBorder} ${choice.focusRing}`}
            >
              <span
                aria-hidden
                className={`h-1 w-full bg-gradient-to-r ${choice.accentBar} opacity-70 transition-opacity duration-300 group-hover:opacity-100`}
              />

              <div className="relative flex h-40 items-center justify-center overflow-hidden px-6">
                <div
                  aria-hidden
                  className={`pointer-events-none absolute -top-16 h-40 w-40 rounded-full blur-3xl transition-opacity duration-300 group-hover:opacity-100 ${choice.glow} opacity-60`}
                />
                <img
                  src={choice.image}
                  alt=""
                  className="relative h-36 w-auto max-w-full object-contain mix-blend-multiply transition-transform duration-500 ease-out group-hover:scale-[1.07]"
                  loading="lazy"
                />
              </div>

              <div className="flex flex-1 flex-col px-6 pb-6">
                <span className={`inline-flex w-fit items-center rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${choice.eyebrowPill}`}>
                  {choice.eyebrow}
                </span>
                <h2 className="mt-2.5 text-xl font-black tracking-tight">{choice.title}</h2>
                <p className="mt-2 flex-1 text-sm leading-6 text-slate-500">{choice.description}</p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {choice.chips.map((chip) => {
                    const ChipIcon = chip.icon;
                    return (
                      <span
                        key={chip.label}
                        className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600"
                      >
                        <ChipIcon size={12} /> {chip.label}
                      </span>
                    );
                  })}
                </div>

                <span
                  className={`mt-6 inline-flex w-fit items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-black text-white shadow-sm transition-colors duration-200 ${choice.ctaPill}`}
                >
                  {choice.cta}
                  <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
                </span>
              </div>
            </button>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-slate-400">
          Your work stays saved in both workspaces — switching never loses anything.
        </p>
      </main>
    </div>
  );
}
