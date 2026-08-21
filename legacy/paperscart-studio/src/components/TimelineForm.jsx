import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

const statusOptions = ['Pending', 'In Progress', 'Review', 'Done'];

export default function TimelineForm({
  data,
  onChange,
  onMilestoneChange,
  onAddMilestone,
  onRemoveMilestone,
  hideClientInfo = false,
}) {
  const updateTimeline = (updates) => onChange(updates);

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100 space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Project Timeline</h2>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700">Project & Client</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
            <input
              type="text"
              value={data.projectName || ''}
              onChange={(e) => updateTimeline({ projectName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Project name"
            />
          </div>
          {!hideClientInfo && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                <input
                  type="text"
                  value={data.clientName || ''}
                  onChange={(e) => updateTimeline({ clientName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Client name"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Address</label>
                <input
                  type="text"
                  value={data.clientAddress || ''}
                  onChange={(e) => updateTimeline({ clientAddress: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Client address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Email</label>
                <input
                  type="email"
                  value={data.clientEmail || ''}
                  onChange={(e) => updateTimeline({ clientEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="client@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Phone</label>
                <input
                  type="tel"
                  value={data.clientPhone || ''}
                  onChange={(e) => updateTimeline({ clientPhone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="+91 98765 43210"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">State Operating Head</label>
                <input
                  type="text"
                  value={data.stateOperatingHead || ''}
                  onChange={(e) => updateTimeline({ stateOperatingHead: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Person who closed this deal"
                />
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Issued On</label>
            <input
              type="date"
              value={data.date || ''}
              onChange={(e) => updateTimeline({ date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={data.startDate || ''}
              onChange={(e) => updateTimeline({ startDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={data.endDate || ''}
              onChange={(e) => updateTimeline({ endDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700">Milestones</h3>
        <div className="space-y-3">
          {data.milestones.map((m, index) => (
            <div
              key={index}
              className="p-4 border border-gray-200 rounded-lg flex flex-col md:flex-row gap-3 flex-wrap"
            >
              <input
                type="text"
                value={m.phase}
                onChange={(e) => onMilestoneChange(index, 'phase', e.target.value)}
                placeholder="Phase name"
                className="flex-1 min-w-[120px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="text"
                value={m.description}
                onChange={(e) => onMilestoneChange(index, 'description', e.target.value)}
                placeholder="Description"
                className="flex-1 min-w-[180px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="date"
                value={m.dueDate}
                onChange={(e) => onMilestoneChange(index, 'dueDate', e.target.value)}
                className="w-full md:w-36 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <select
                value={m.status}
                onChange={(e) => onMilestoneChange(index, 'status', e.target.value)}
                className="w-full md:w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => onRemoveMilestone(index)}
                className="p-2 text-red-500 hover:text-red-700 transition-colors self-center"
                title="Remove milestone"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={onAddMilestone}
          className="flex items-center gap-2 text-emerald-600 hover:text-emerald-800 font-medium transition-colors"
        >
          <Plus size={20} /> Add Milestone
        </button>
      </div>
    </div>
  );
}
