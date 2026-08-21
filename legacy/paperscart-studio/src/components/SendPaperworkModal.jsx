import React, { useState } from 'react';
import { CalendarClock, FileSignature, Loader2, Mail, Receipt, ScrollText, X } from 'lucide-react';

const SENDABLE_DOCUMENTS = [
  {
    id: 'invoice',
    label: 'Invoice',
    description: 'Amounts, due date, and payment details.',
    icon: Receipt,
  },
  {
    id: 'agreement',
    label: 'Agreement',
    description: 'Project terms, dates, and signatures.',
    icon: FileSignature,
  },
  {
    id: 'scope',
    label: 'Scope of work',
    description: 'What is included, what is not, and how it is accepted.',
    icon: ScrollText,
  },
  {
    id: 'timeline',
    label: 'Project timeline',
    description: 'Milestones and delivery dates.',
    icon: CalendarClock,
  },
];

const PRESETS = [
  { id: 'invoice-only', label: 'Invoice only', documents: ['invoice'] },
  { id: 'everything', label: 'Full paperwork', documents: ['invoice', 'agreement', 'scope', 'timeline'] },
];

export default function SendPaperworkModal({
  defaultRecipient = '',
  isSending = false,
  statusMessage = '',
  statusType = '',
  onSend,
  onClose,
}) {
  const [selected, setSelected] = useState(['invoice', 'agreement', 'scope', 'timeline']);
  const [recipient, setRecipient] = useState(defaultRecipient);

  const toggleDocument = (id) => {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  // Keep the order stable so the email always reads invoice, agreement, timeline.
  const orderedSelection = SENDABLE_DOCUMENTS.map((doc) => doc.id).filter((id) => selected.includes(id));
  const canSend = orderedSelection.length > 0 && !isSending;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!canSend) return;
    onSend({ documents: orderedSelection, recipient: recipient.trim() });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/50 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Send paperwork"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-lg font-black text-slate-950">Send paperwork</h2>
            <p className="mt-0.5 text-xs text-slate-500">Pick what to attach, then send it all in one email.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close send paperwork"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => {
              const isActive =
                preset.documents.length === orderedSelection.length &&
                preset.documents.every((id) => orderedSelection.includes(id));
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setSelected(preset.documents)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-black transition-colors ${
                    isActive
                      ? 'border-emerald-600 bg-emerald-600 text-white'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          <div className="space-y-2">
            {SENDABLE_DOCUMENTS.map((doc) => {
              const Icon = doc.icon;
              const isChecked = selected.includes(doc.id);
              return (
                <label
                  key={doc.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${
                    isChecked ? 'border-emerald-300 bg-emerald-50/60' : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleDocument(doc.id)}
                    className="mt-1 h-4 w-4 shrink-0 accent-emerald-600"
                  />
                  <span className="flex min-w-0 items-start gap-2.5">
                    <Icon size={18} className={`mt-0.5 shrink-0 ${isChecked ? 'text-emerald-700' : 'text-slate-400'}`} />
                    <span className="min-w-0">
                      <span className="block text-sm font-bold text-slate-900">{doc.label}</span>
                      <span className="block text-xs text-slate-500">{doc.description}</span>
                    </span>
                  </span>
                </label>
              );
            })}
          </div>

          <label className="block">
            <span className="mb-1 block text-xs font-bold text-slate-600">Send to</span>
            <input
              type="email"
              value={recipient}
              onChange={(event) => setRecipient(event.target.value)}
              placeholder="client@example.com"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
            {!defaultRecipient && (
              <span className="mt-1 block text-xs text-slate-500">
                No client email saved yet — enter one to send.
              </span>
            )}
          </label>

          {statusMessage && (
            <p
              className={`rounded-lg px-3 py-2 text-sm ${
                statusType === 'error'
                  ? 'bg-amber-50 text-amber-800'
                  : statusType === 'done'
                  ? 'bg-emerald-50 text-emerald-800'
                  : 'bg-slate-50 text-slate-600'
              }`}
            >
              {statusMessage}
            </p>
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
              disabled={!canSend}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-black text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSending ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
              {isSending
                ? 'Sending'
                : `Send ${orderedSelection.length || 0} document${orderedSelection.length === 1 ? '' : 's'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
