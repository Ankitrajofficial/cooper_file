import React from 'react';

const clientFields = [
  { key: 'clientName', label: 'Client Name' },
  { key: 'clientAddress', label: 'Client Address' },
  { key: 'clientEmail', label: 'Client Email', type: 'email' },
  { key: 'clientPhone', label: 'Client Phone' },
  { key: 'stateOperatingHead', label: 'State Operating Head' },
];

const projectFields = [
  { key: 'projectName', label: 'Project Name' },
  { key: 'agreementNumber', label: 'Agreement Number' },
  { key: 'date', label: 'Date', type: 'date' },
  { key: 'startDate', label: 'Start Date', type: 'date' },
  { key: 'endDate', label: 'End Date', type: 'date' },
];

function renderFields(fields, data, onChange) {
  return fields.map(({ key, label, type = 'text' }) => (
    <div key={key}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={data[key] || ''}
        onChange={(e) => onChange({ [key]: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        placeholder={label}
      />
    </div>
  ));
}

export default function AgreementForm({ data, onChange, hideClientInfo = false }) {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100 space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Project Agreement</h2>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700">Parties & Project</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {!hideClientInfo && renderFields(clientFields, data, onChange)}
          {renderFields(projectFields, data, onChange)}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700">Scope of Work</h3>
        <textarea
          value={data.scope || ''}
          onChange={(e) => onChange({ scope: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="Describe the scope of the project..."
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700">Deliverables</h3>
        <textarea
          value={data.deliverables || ''}
          onChange={(e) => onChange({ deliverables: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="List deliverables..."
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700">Payment Terms</h3>
        <textarea
          value={data.paymentTerms || ''}
          onChange={(e) => onChange({ paymentTerms: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="e.g. 50% advance, 50% on delivery"
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700">Special Terms (optional)</h3>
        <textarea
          value={data.specialTerms || ''}
          onChange={(e) => onChange({ specialTerms: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="Any additional terms..."
        />
      </div>
    </div>
  );
}
