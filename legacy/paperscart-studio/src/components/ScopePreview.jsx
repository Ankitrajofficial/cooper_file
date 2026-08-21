import React, { forwardRef } from 'react';
import { getCompanyDisplayProfile } from '../utils/companyProfile';
import { getPdfTheme } from '../utils/pdfThemes';
import SignatureBlock from './SignatureBlock';

const ScopePreview = forwardRef(({ company, data }, ref) => {
  const displayCompany = getCompanyDisplayProfile(company);
  const theme = getPdfTheme(company.pdfTheme);

  const sections = [
    { title: 'Project Overview', body: data.overview || '—' },
    { title: 'Deliverables', body: data.deliverables || '—' },
    { title: 'Out of Scope', body: data.outOfScope || '—' },
    { title: 'Assumptions & Client Responsibilities', body: data.assumptions || '—' },
    { title: 'Acceptance Criteria', body: data.acceptanceCriteria || '—' },
  ];

  return (
    <div
      className="mx-auto bg-white shadow-2xl overflow-hidden"
      style={{ width: '210mm', minWidth: '210mm', minHeight: '297mm' }}
    >
      <div
        ref={ref}
        className="bg-white flex flex-col"
        id="scope-preview"
        style={{ width: '210mm', minWidth: '210mm', minHeight: '297mm' }}
      >
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
            <div className="mt-2 space-y-0.5 text-xs leading-relaxed text-white/70">
              <p className="break-words">{displayCompany.address}</p>
              <p>Mobile: {displayCompany.mobileNumber}</p>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <h1 className="text-2xl font-black uppercase tracking-wide leading-tight">Scope<br />Of Work</h1>
            <span className={`mt-2 inline-block rounded-full px-3 py-1 text-sm font-semibold ${theme.chip}`}>
              #{data.scopeNumber || 'SOW-001'}
            </span>
            <p className="mt-3 text-sm"><span className="text-white/60">Issued On</span>&nbsp;&nbsp;{data.date}</p>
          </div>
        </div>

        <div className="flex flex-1 flex-col px-4 py-8 sm:px-6 md:px-8 lg:px-12">
          <p className="mb-6 text-sm leading-6 text-gray-600">
            This Scope of Work sets out exactly what is included in the engagement, what is not, and how the work is
            accepted as complete. Anything outside this document is quoted separately.
          </p>

          <div className="mb-8 grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-gray-200 p-4">
              <p className={`text-[11px] font-bold uppercase tracking-wider ${theme.accent}`}>Prepared By</p>
              <p className="mt-1.5 text-base font-bold text-gray-900">{displayCompany.companyName}</p>
              <p className="text-sm text-gray-600">{displayCompany.founderName}</p>
              <p className="text-sm text-gray-600 break-words">{displayCompany.address}</p>
              <p className="text-sm text-gray-600">Mobile: {displayCompany.mobileNumber}</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className={`text-[11px] font-bold uppercase tracking-wider ${theme.accent}`}>Prepared For</p>
              <p className="mt-1.5 text-base font-bold text-gray-900">{data.clientName || 'Client Name'}</p>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{data.clientAddress || 'Client Address'}</p>
              {data.clientEmail && <p className="text-sm text-gray-600">Email: {data.clientEmail}</p>}
              {data.clientPhone && <p className="text-sm text-gray-600">Phone: {data.clientPhone}</p>}
            </div>
          </div>

          <div className={`mb-8 grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-gray-200 ${theme.accentSoft}`}>
            <div className="bg-white/60 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Project</p>
              <p className="mt-0.5 text-sm font-bold text-gray-900">{data.projectName || 'Project Name'}</p>
            </div>
            <div className="bg-white/60 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Term</p>
              <p className="mt-0.5 text-sm font-bold text-gray-900">
                {data.startDate && data.endDate ? `${data.startDate} – ${data.endDate}` : 'To be specified'}
              </p>
            </div>
            <div className="bg-white/60 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Revisions</p>
              <p className="mt-0.5 text-sm font-bold text-gray-900">{data.revisionRounds || 'As agreed'}</p>
            </div>
          </div>

          <div className="space-y-5">
            {sections.map((section, i) => (
              <div key={section.title} className="flex gap-3">
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-black text-white ${theme.accentBg}`}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800">{section.title}</h3>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-gray-700">{section.body}</p>
                </div>
              </div>
            ))}
          </div>

          <SignatureBlock
            className="mt-auto pt-12"
            theme={theme}
            signerName={displayCompany.founderName || displayCompany.companyName}
            companyName={displayCompany.companyName}
            signedDate={data.date}
            counterpartyName={data.clientName}
            counterpartyRole="Client Approval"
          />
        </div>
      </div>
    </div>
  );
});

export default ScopePreview;
