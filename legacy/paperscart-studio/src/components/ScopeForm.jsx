import React from 'react';

const clientFields = [
  { key: 'clientName', label: 'Client Name' },
  { key: 'clientAddress', label: 'Client Address' },
  { key: 'clientEmail', label: 'Client Email', type: 'email' },
  { key: 'clientPhone', label: 'Client Phone' },
];

const projectFields = [
  { key: 'projectName', label: 'Project Name' },
  { key: 'scopeNumber', label: 'Scope Number' },
  { key: 'date', label: 'Date', type: 'date' },
  { key: 'startDate', label: 'Start Date', type: 'date' },
  { key: 'endDate', label: 'End Date', type: 'date' },
  { key: 'revisionRounds', label: 'Revision Rounds Included' },
];

const sections = [
  {
    key: 'overview',
    title: 'Project Overview',
    placeholder: 'What this project is and what problem it solves...',
    rows: 4,
  },
  {
    key: 'deliverables',
    title: 'Deliverables',
    placeholder: 'List exactly what the client receives — one per line.',
    rows: 5,
  },
  {
    key: 'outOfScope',
    title: 'Out of Scope',
    placeholder: 'Anything explicitly NOT included, so extra requests become a new quote.',
    rows: 4,
  },
  {
    key: 'assumptions',
    title: 'Assumptions & Client Responsibilities',
    placeholder: 'What you are assuming, and what the client must provide (content, access, approvals).',
    rows: 4,
  },
  {
    key: 'acceptanceCriteria',
    title: 'Acceptance Criteria',
    placeholder: 'How the work is judged complete and signed off.',
    rows: 3,
  },
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

export default function ScopeForm({ data, onChange, hideClientInfo = false }) {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100 space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Scope of Work</h2>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700">Client & Project</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {!hideClientInfo && renderFields(clientFields, data, onChange)}
          {renderFields(projectFields, data, onChange)}
        </div>
      </div>

      {sections.map((section) => (
        <div key={section.key} className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">{section.title}</h3>
          <textarea
            value={data[section.key] || ''}
            onChange={(e) => onChange({ [section.key]: e.target.value })}
            rows={section.rows}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder={section.placeholder}
          />
        </div>
      ))}
    </div>
  );
}
