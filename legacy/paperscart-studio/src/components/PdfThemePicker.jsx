import React from 'react';
import { PDF_THEMES, normalizePdfThemeId } from '../utils/pdfThemes';

// Global PDF theme picker. Applies to every document type at once because the
// selection is stored on the shared company profile (`pdfTheme`).
const PdfThemePicker = ({ value, onChange, className = '' }) => {
  const active = normalizePdfThemeId(value);

  return (
    <div className={`rounded-lg border border-gray-200 bg-white p-3 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wide text-gray-700">PDF Theme</h3>
          <p className="mt-0.5 text-xs font-medium text-gray-500">Applies to every document you download.</p>
        </div>
      </div>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {PDF_THEMES.map((theme) => {
          const isActive = theme.id === active;
          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => onChange(theme.id)}
              aria-pressed={isActive}
              title={theme.label}
              className={`flex items-center gap-2 rounded-full border px-2.5 py-1.5 text-xs font-semibold transition ${
                isActive
                  ? 'border-gray-900 bg-gray-900 text-white shadow-sm'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span
                className="h-3.5 w-3.5 rounded-full ring-1 ring-black/10"
                style={{ backgroundColor: theme.swatch }}
              />
              {theme.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PdfThemePicker;
