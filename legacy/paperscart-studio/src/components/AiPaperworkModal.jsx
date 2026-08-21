import React, { useState } from 'react';
import { CalendarClock, FileSignature, Loader2, Receipt, ScrollText, Sparkles, X } from 'lucide-react';
import { generatePaperworkDraft } from '../utils/paperworkAi';

const QUESTIONS = [
  {
    key: 'projectSummary',
    label: 'What is the project?',
    placeholder: 'Redesign the marketing website: 6 pages, mobile-first, booking integration.',
    rows: 3,
    required: true,
  },
  {
    key: 'deliverables',
    label: 'What does the client actually receive?',
    placeholder: 'Figma designs, responsive build, booking widget, one training session.',
    rows: 3,
  },
  {
    key: 'duration',
    label: 'How long will it take?',
    placeholder: '6 weeks from kickoff',
    rows: 1,
  },
  {
    key: 'paymentTerms',
    label: 'How does payment work?',
    placeholder: '50% upfront, 50% on delivery',
    rows: 1,
  },
  {
    key: 'exclusions',
    label: 'Anything explicitly NOT included?',
    placeholder: 'Ongoing SEO, copywriting, photography',
    rows: 2,
  },
];

export default function AiPaperworkModal({ context, initialAnswers, onApply, onClose }) {
  const [answers, setAnswers] = useState(() => ({
    projectSummary: '',
    deliverables: '',
    duration: '',
    paymentTerms: '',
    exclusions: '',
    ...initialAnswers,
  }));
  const [dates, setDates] = useState({
    startDate: context.startDate || '',
    endDate: context.endDate || '',
  });
  const [draft, setDraft] = useState(null);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isGenerating, setIsGenerating] = useState(false);

  const setAnswer = (key, value) => setAnswers((prev) => ({ ...prev, [key]: value }));

  const handleGenerate = async (event) => {
    event.preventDefault();
    if (isGenerating) return;
    if (!answers.projectSummary.trim()) {
      setStatus({ type: 'error', message: 'Describe the project first.' });
      return;
    }

    setIsGenerating(true);
    setStatus({ type: 'loading', message: 'Drafting your paperwork…' });
    try {
      const payload = await generatePaperworkDraft({
        answers,
        context: { ...context, startDate: dates.startDate, endDate: dates.endDate },
      });
      setDraft(payload.draft);
      setStatus({ type: 'done', message: `Draft ready (${payload.provider}). Review it before applying.` });
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    onApply({ draft, startDate: dates.startDate, endDate: dates.endDate });
  };

  const milestoneCount = draft?.timeline?.milestones?.length || 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/50 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="AI paperwork"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="my-4 w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 text-lg font-black text-slate-950">
              <Sparkles size={18} className="text-emerald-600" />
              AI paperwork
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Answer a few questions and get an agreement, scope of work, and timeline.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close AI paperwork"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4 px-5 py-5">
          {/* What it already knows, so nobody retypes the client or the amounts. */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3">
            <p className="text-xs font-black uppercase tracking-wide text-emerald-800">Using what you already have</p>
            <ul className="mt-1.5 space-y-1 text-xs text-emerald-900">
              <li>Client: <span className="font-bold">{context.clientName || 'not set'}</span></li>
              {context.invoiceNumber && (
                <li>
                  Invoice <span className="font-bold">{context.invoiceNumber}</span>
                  {context.invoiceTotal ? ` — ${context.invoiceTotal}` : ''}
                  {context.invoiceDueDate ? `, due ${context.invoiceDueDate}` : ''}
                </li>
              )}
              {Array.isArray(context.invoiceItems) && context.invoiceItems.length > 0 && (
                <li>{context.invoiceItems.length} billed line item{context.invoiceItems.length === 1 ? '' : 's'}</li>
              )}
            </ul>
          </div>

          {QUESTIONS.map((question) => (
            <label key={question.key} className="block">
              <span className="mb-1 block text-xs font-bold text-slate-600">
                {question.label}
                {question.required && <span className="text-emerald-700"> *</span>}
              </span>
              {question.rows > 1 ? (
                <textarea
                  value={answers[question.key]}
                  onChange={(event) => setAnswer(question.key, event.target.value)}
                  rows={question.rows}
                  placeholder={question.placeholder}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              ) : (
                <input
                  type="text"
                  value={answers[question.key]}
                  onChange={(event) => setAnswer(question.key, event.target.value)}
                  placeholder={question.placeholder}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              )}
            </label>
          ))}

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-xs font-bold text-slate-600">Start date</span>
              <input
                type="date"
                value={dates.startDate}
                onChange={(event) => setDates((prev) => ({ ...prev, startDate: event.target.value }))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-bold text-slate-600">End date</span>
              <input
                type="date"
                value={dates.endDate}
                onChange={(event) => setDates((prev) => ({ ...prev, endDate: event.target.value }))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </label>
          </div>

          {status.message && (
            <p
              className={`rounded-lg px-3 py-2 text-sm ${
                status.type === 'error'
                  ? 'bg-amber-50 text-amber-800'
                  : status.type === 'done'
                  ? 'bg-emerald-50 text-emerald-800'
                  : 'bg-slate-50 text-slate-600'
              }`}
            >
              {status.message}
            </p>
          )}

          {draft && (
            <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">Draft preview</p>
              {draft.projectName && (
                <p className="text-sm font-bold text-slate-900">{draft.projectName}</p>
              )}
              <div className="space-y-2 text-xs text-slate-700">
                <p className="flex items-start gap-2">
                  <FileSignature size={14} className="mt-0.5 shrink-0 text-slate-400" />
                  <span className="min-w-0"><span className="font-bold">Agreement:</span> {draft.agreement.scope.slice(0, 180) || '—'}</span>
                </p>
                <p className="flex items-start gap-2">
                  <ScrollText size={14} className="mt-0.5 shrink-0 text-slate-400" />
                  <span className="min-w-0"><span className="font-bold">Out of scope:</span> {draft.scope.outOfScope.slice(0, 180) || '—'}</span>
                </p>
                <p className="flex items-start gap-2">
                  <CalendarClock size={14} className="mt-0.5 shrink-0 text-slate-400" />
                  <span className="min-w-0"><span className="font-bold">Timeline:</span> {milestoneCount} milestone{milestoneCount === 1 ? '' : 's'}</span>
                </p>
                <p className="flex items-start gap-2">
                  <Receipt size={14} className="mt-0.5 shrink-0 text-slate-400" />
                  <span className="min-w-0"><span className="font-bold">Payment:</span> {draft.agreement.paymentTerms.slice(0, 180) || '—'}</span>
                </p>
              </div>
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                Applying overwrites your current agreement, scope of work, and timeline. Read the drafts before
                sending them to a client — AI can get details wrong.
              </p>
            </div>
          )}

          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={isGenerating}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {isGenerating ? 'Drafting' : draft ? 'Regenerate' : 'Generate'}
            </button>
            {draft && (
              <button
                type="button"
                onClick={handleApply}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-black text-white transition-colors hover:bg-emerald-700"
              >
                Apply to all three
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
