import React, { forwardRef } from 'react';
import { getCompanyDisplayProfile } from '../utils/companyProfile';
import { getPdfTheme } from '../utils/pdfThemes';
import SignatureBlock from './SignatureBlock';

const statusColors = {
  Pending: 'bg-gray-200 text-gray-700',
  'In Progress': 'bg-amber-100 text-amber-800',
  Review: 'bg-blue-100 text-blue-800',
  Done: 'bg-emerald-100 text-emerald-800',
};

const TimelinePreview = forwardRef(({ company, data }, ref) => {
  const displayCompany = getCompanyDisplayProfile(company);
  const theme = getPdfTheme(company.pdfTheme);
  const stateOperatingHead = typeof data.stateOperatingHead === 'string' ? data.stateOperatingHead.trim() : '';

  const milestones = Array.isArray(data.milestones) ? data.milestones : [];
  const doneCount = milestones.filter((m) => (m.status || '').toLowerCase() === 'done').length;
  const progressPct = milestones.length ? Math.round((doneCount / milestones.length) * 100) : 0;

  return (
    <div
      className="mx-auto bg-white shadow-2xl overflow-hidden"
      style={{ width: '210mm', minWidth: '210mm', minHeight: '297mm' }}
    >
      <div
        ref={ref}
        className="bg-white flex flex-col"
        id="timeline-preview"
        style={{ width: '210mm', minWidth: '210mm', minHeight: '297mm' }}
      >
        {/* Accent header band (full-bleed) */}
        <div className={`flex justify-between items-start gap-6 px-4 py-7 sm:px-6 md:px-8 lg:px-12 text-white ${theme.band}`}>
          <div className="min-w-0">
            {displayCompany.logoDataUrl && (
              <img
                src={displayCompany.logoDataUrl}
                alt={`${displayCompany.companyName} logo`}
                className="mb-3 h-12 max-w-[44mm] object-contain"
              />
            )}
            <h2 className="text-2xl font-bold leading-tight">{displayCompany.companyName}</h2>
            {displayCompany.founderName && <p className="text-sm text-white/70">{displayCompany.founderName}</p>}
            <p className="mt-2 text-xs text-white/70">Mobile: {displayCompany.mobileNumber}</p>
          </div>
          <div className="shrink-0 text-right">
            <h1 className="text-2xl font-black uppercase tracking-wide leading-tight">Project<br />Timeline</h1>
            <span className={`mt-2 inline-block rounded-full px-3 py-1 text-sm font-semibold ${theme.chip}`}>
              {data.projectName || 'Project Name'}
            </span>
            <p className="mt-3 text-sm"><span className="text-white/60">Issued On</span>&nbsp;&nbsp;{data.date || '—'}</p>
          </div>
        </div>

        <div className="flex flex-1 flex-col px-4 py-8 sm:px-6 md:px-8 lg:px-12">

        {/* Client + engagement cards */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-gray-200 p-4">
            <p className={`text-[11px] font-bold uppercase tracking-wider ${theme.accent}`}>Client</p>
            <p className="mt-1.5 text-base font-bold text-gray-900">{data.clientName || '—'}</p>
            {data.clientAddress && <p className="text-sm text-gray-600 whitespace-pre-wrap">{data.clientAddress}</p>}
            {data.clientEmail && <p className="text-sm text-gray-600">Email: {data.clientEmail}</p>}
            {data.clientPhone && <p className="text-sm text-gray-600">Phone: {data.clientPhone}</p>}
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className={`text-[11px] font-bold uppercase tracking-wider ${theme.accent}`}>Engagement</p>
            <dl className="mt-1.5 space-y-1 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-gray-500">Project</dt>
                <dd className="font-semibold text-gray-900 text-right">{data.projectName || 'Project Name'}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-gray-500">Issued On</dt>
                <dd className="font-semibold text-gray-900 text-right">{data.date || '—'}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-gray-500">Period</dt>
                <dd className="font-semibold text-gray-900 text-right">{data.startDate || '—'} – {data.endDate || '—'}</dd>
              </div>
              {stateOperatingHead && (
                <div className="flex justify-between gap-3">
                  <dt className="text-gray-500">State Head</dt>
                  <dd className="font-semibold text-gray-900 text-right">{stateOperatingHead}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Progress summary */}
        {milestones.length > 0 && (
          <div className="mb-6 rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-gray-800">Overall progress</p>
              <p className={`text-sm font-black ${theme.accent}`}>{progressPct}% · {doneCount}/{milestones.length} done</p>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <div className={`h-full rounded-full ${theme.accentBg}`} style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        )}

        <table className="w-full" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead>
            <tr className={`text-white ${theme.tableHead}`}>
              <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider rounded-l-md">#</th>
              <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider">Phase</th>
              <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider">Description</th>
              <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider">Due Date</th>
              <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider rounded-r-md">Status</th>
            </tr>
          </thead>
          <tbody>
            {milestones.map((m, i) => (
              <tr key={i} className={i % 2 === 1 ? 'bg-gray-50' : 'bg-white'}>
                <td className="py-3 px-4 font-bold text-gray-400 tabular-nums">{String(i + 1).padStart(2, '0')}</td>
                <td className="py-3 px-4 font-semibold text-gray-900">{m.phase || '—'}</td>
                <td className="py-3 px-4 text-gray-700">{m.description || '—'}</td>
                <td className="py-3 px-4 text-right text-gray-700 tabular-nums">{m.dueDate || '—'}</td>
                <td className="py-3 px-4 text-right">
                  <span
                    className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                      statusColors[m.status] || statusColors.Pending
                    }`}
                  >
                    {m.status || 'Pending'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <SignatureBlock
          className="mt-auto pt-10"
          theme={theme}
          signerName={displayCompany.founderName || displayCompany.companyName}
          companyName={displayCompany.companyName}
          signerRole="Issued By"
          signedDate={data.date}
          counterpartyName={data.clientName}
          counterpartyRole="Client Acknowledgement"
        />

        <div className="pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>This timeline is indicative and may be updated by mutual agreement.</p>
        </div>
        </div>
      </div>
    </div>
  );
});

TimelinePreview.displayName = 'TimelinePreview';
export default TimelinePreview;
