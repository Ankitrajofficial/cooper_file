import React from 'react';

export default function ShippingLabelForm({ data, onChange }) {
  const handleChange = (event) => {
    const { name, value } = event.target;
    onChange({ [name]: value });
  };

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-lg sm:p-6">
      <h2 className="text-xl font-bold text-gray-800 sm:text-2xl">Shipping Label</h2>
      <p className="mt-1 text-sm text-gray-500">Use this for delivery slips, parcels, and paperless order handoff.</p>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-gray-700">Customer Name</span>
          <input
            type="text"
            name="clientName"
            value={data.clientName || ''}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Customer name"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-gray-700">Phone</span>
          <input
            type="tel"
            name="clientPhone"
            value={data.clientPhone || ''}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="+91 98765 43210"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-gray-700">Email</span>
          <input
            type="email"
            name="clientEmail"
            value={data.clientEmail || ''}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="customer@example.com"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-gray-700">Invoice Number</span>
          <input
            type="text"
            name="invoiceNumber"
            value={data.invoiceNumber || ''}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Invoice number"
          />
        </label>
        <label className="block md:col-span-2">
          <span className="mb-1 block text-sm font-medium text-gray-700">Shipping Address</span>
          <textarea
            name="shippingAddress"
            value={data.shippingAddress || ''}
            onChange={handleChange}
            rows={4}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Full delivery address"
          />
        </label>
      </div>
    </div>
  );
}
