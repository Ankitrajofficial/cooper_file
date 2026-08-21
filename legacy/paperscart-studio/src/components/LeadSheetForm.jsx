import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

const emptyLead = () => ({ name: '', phone: '', address: '', status: '', contactDate: '', notes: '' });

export default function LeadSheetForm({ data, onChange, onLeadChange, onAddLead, onRemoveLead }) {
  const leads = data.leads || [];

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100 space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Leads Tracking Sheet</h2>
      <p className="text-xs sm:text-sm text-gray-500">
        Add leads below. Each lead appears as a card on the sheet. Use Status and Contact Date when you follow up.
      </p>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">State Operating Head</label>
        <input
          type="text"
          value={data.stateOperatingHead || ''}
          onChange={(e) => onChange?.({ stateOperatingHead: e.target.value })}
          placeholder="Person who closed this deal"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div className="space-y-4">
        {leads.map((lead, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold text-gray-700">Lead #{index + 1}</span>
              <button
                type="button"
                onClick={() => onRemoveLead(index)}
                className="p-1.5 text-red-500 hover:text-red-700 transition-colors"
                title="Remove lead"
              >
                <Trash2 size={18} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                <input
                  type="text"
                  value={lead.name}
                  onChange={(e) => onLeadChange(index, 'name', e.target.value)}
                  placeholder="Lead / business name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                <input
                  type="text"
                  value={lead.phone}
                  onChange={(e) => onLeadChange(index, 'phone', e.target.value)}
                  placeholder="Phone number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Contact Date</label>
                <input
                  type="date"
                  value={lead.contactDate}
                  onChange={(e) => onLeadChange(index, 'contactDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
                <input
                  type="text"
                  value={lead.address}
                  onChange={(e) => onLeadChange(index, 'address', e.target.value)}
                  placeholder="Full address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <input
                  type="text"
                  value={lead.status}
                  onChange={(e) => onLeadChange(index, 'status', e.target.value)}
                  placeholder="e.g. Contacted, Follow-up"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                <textarea
                  value={lead.notes}
                  onChange={(e) => onLeadChange(index, 'notes', e.target.value)}
                  placeholder="Notes"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => onAddLead(emptyLead())}
          className="flex items-center gap-2 text-emerald-600 hover:text-emerald-800 font-medium transition-colors"
        >
          <Plus size={20} /> Add Lead
        </button>
      </div>
    </div>
  );
}
