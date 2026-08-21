import React from 'react';
import { Calendar, ClipboardList, FileSignature, FileText, QrCode, ScrollText, SlidersHorizontal, Truck } from 'lucide-react';

const docTypes = [
  { id: 'invoice', label: 'Invoice', helper: 'Bills and receipts', icon: FileText },
  { id: 'agreement', label: 'Agreement', helper: 'Project terms', icon: FileSignature },
  { id: 'scope', label: 'Scope', helper: 'Work included', icon: ScrollText },
  { id: 'timeline', label: 'Timeline', helper: 'Milestones', icon: Calendar },
  { id: 'leadsheet', label: 'Leads', helper: 'Tracking sheet', icon: ClipboardList },
  { id: 'qrcard', label: 'QR Card', helper: 'Payment or link', icon: QrCode },
  { id: 'shippinglabel', label: 'Label', helper: 'Shipping address', icon: Truck },
  { id: 'templates', label: 'Templates', helper: 'Invoice style', icon: SlidersHorizontal },
];

export default function DocumentTypeSelector({ current, onChange, availableTypes, density = 'default', className = '' }) {
  const visibleDocTypes = Array.isArray(availableTypes) && availableTypes.length
    ? docTypes.filter((type) => availableTypes.includes(type.id))
    : docTypes;
  const isCompact = density === 'compact';
  const selectorStyle = isCompact
    ? { gridTemplateColumns: `repeat(${visibleDocTypes.length || 1}, minmax(0, 1fr))` }
    : undefined;

  return (
    <div
      className={`${isCompact ? 'grid w-full min-w-0 gap-1.5 rounded-lg bg-slate-100 p-1' : 'flex flex-wrap gap-2'} ${className}`}
      style={selectorStyle}
    >
      {visibleDocTypes.map(({ id, label, helper, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={`inline-flex min-w-0 items-center gap-2 rounded-lg border text-left transition-all touch-ignore ${
            isCompact ? 'min-h-11 justify-center px-2 py-1.5' : 'px-3 py-2'
          } ${
            current === id
              ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
              : isCompact
              ? 'border-transparent bg-white text-slate-700 hover:border-emerald-200 hover:bg-emerald-50'
              : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50'
          }`}
        >
          <span
            className={`flex shrink-0 items-center justify-center rounded-lg ${
              isCompact ? 'h-7 w-7' : 'h-8 w-8'
            } ${
              current === id ? 'bg-white/15' : 'bg-slate-100 text-slate-600'
            }`}
          >
            <Icon size={16} />
          </span>
          <span className="min-w-0">
            <span className={`${isCompact ? 'truncate text-[13px] leading-4' : 'text-sm leading-5'} block font-bold`}>
              {label}
            </span>
            <span className={`${isCompact ? 'hidden truncate text-[11px] leading-4 2xl:block' : 'hidden text-xs md:block'} ${current === id ? 'text-emerald-50' : 'text-slate-500'}`}>
              {helper}
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}
