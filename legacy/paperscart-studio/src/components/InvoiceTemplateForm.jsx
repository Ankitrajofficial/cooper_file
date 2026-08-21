import React from 'react';

export default function InvoiceTemplateForm({ data, onChange }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-lg sm:p-6">
      <h2 className="text-xl font-bold text-gray-800 sm:text-2xl">Customize Invoice Template</h2>
      <p className="mt-1 text-sm text-gray-500">Set the invoice title shown in the preview and downloaded PDF.</p>

      <div className="mt-5 space-y-5">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-gray-700">Invoice Label</span>
          <input
            type="text"
            value={data.invoiceLabel || 'INVOICE'}
            onChange={(event) => onChange({ invoiceLabel: event.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="INVOICE, TAX INVOICE, BILL"
          />
        </label>

        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-3 text-sm text-gray-600">
          <span className="font-semibold text-gray-700">Colour theme moved.</span> Use the
          <span className="font-semibold"> PDF Theme</span> picker above — it now styles every document
          (invoice, agreement, timeline, lead sheet, shipping label) with one consistent look.
        </div>
      </div>
    </div>
  );
}
