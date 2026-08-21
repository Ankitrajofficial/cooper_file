// Central PDF theme system.
// ONE theme drives every document preview/PDF (invoice, agreement, timeline,
// lead sheet, shipping label). The selected theme id is stored globally on the
// company profile as `pdfTheme`, so switching it restyles all documents at once.
//
// IMPORTANT: only Tailwind v3 (rgb) color classes are used here. html2canvas —
// which rasterises these previews into the PDF — cannot parse oklch(), so we
// must avoid Tailwind v4 colors. All classes below are written as complete
// string literals so Tailwind's JIT scanner compiles them.

export const PDF_THEMES = [
  {
    id: 'slate',
    label: 'Slate',
    swatch: '#1e293b',
    band: 'bg-slate-800',
    tableHead: 'bg-slate-800',
    totalPanel: 'bg-slate-800',
    chip: 'bg-white/15',
    accent: 'text-slate-800',
    accentBg: 'bg-slate-800',
    accentSoft: 'bg-slate-50',
    accentBorder: 'border-slate-300',
    divider: 'border-slate-800',
  },
  {
    id: 'emerald',
    label: 'Emerald',
    swatch: '#047857',
    band: 'bg-emerald-700',
    tableHead: 'bg-emerald-700',
    totalPanel: 'bg-emerald-700',
    chip: 'bg-white/20',
    accent: 'text-emerald-700',
    accentBg: 'bg-emerald-700',
    accentSoft: 'bg-emerald-50',
    accentBorder: 'border-emerald-300',
    divider: 'border-emerald-700',
  },
  {
    id: 'midnight',
    label: 'Midnight',
    swatch: '#020617',
    band: 'bg-slate-950',
    tableHead: 'bg-slate-950',
    totalPanel: 'bg-slate-950',
    chip: 'bg-white/15',
    accent: 'text-slate-900',
    accentBg: 'bg-slate-900',
    accentSoft: 'bg-slate-100',
    accentBorder: 'border-slate-400',
    divider: 'border-slate-950',
  },
  {
    id: 'indigo',
    label: 'Indigo',
    swatch: '#4338ca',
    band: 'bg-indigo-700',
    tableHead: 'bg-indigo-700',
    totalPanel: 'bg-indigo-700',
    chip: 'bg-white/20',
    accent: 'text-indigo-700',
    accentBg: 'bg-indigo-700',
    accentSoft: 'bg-indigo-50',
    accentBorder: 'border-indigo-300',
    divider: 'border-indigo-700',
  },
  {
    id: 'rose',
    label: 'Rose',
    swatch: '#be123c',
    band: 'bg-rose-700',
    tableHead: 'bg-rose-700',
    totalPanel: 'bg-rose-700',
    chip: 'bg-white/20',
    accent: 'text-rose-700',
    accentBg: 'bg-rose-700',
    accentSoft: 'bg-rose-50',
    accentBorder: 'border-rose-300',
    divider: 'border-rose-700',
  },
];

export const DEFAULT_PDF_THEME_ID = 'slate';

// Backward-compat: the old per-invoice template ids map onto the new theme ids.
const LEGACY_ALIASES = { clean: 'slate', retail: 'emerald', bold: 'midnight' };

const THEME_BY_ID = PDF_THEMES.reduce((acc, theme) => {
  acc[theme.id] = theme;
  return acc;
}, {});

export function normalizePdfThemeId(id) {
  if (typeof id !== 'string') return DEFAULT_PDF_THEME_ID;
  const key = id.trim();
  if (THEME_BY_ID[key]) return key;
  if (LEGACY_ALIASES[key]) return LEGACY_ALIASES[key];
  return DEFAULT_PDF_THEME_ID;
}

// Resolve any id (new id, legacy alias, or junk) to a full token object.
export function getPdfTheme(id) {
  return THEME_BY_ID[normalizePdfThemeId(id)];
}
