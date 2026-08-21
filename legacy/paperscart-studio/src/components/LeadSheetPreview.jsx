import React, { forwardRef } from 'react';
import { getCompanyDisplayProfile } from '../utils/companyProfile';
import { getPdfTheme } from '../utils/pdfThemes';

const LEADS_PER_PAGE = 6;

const LeadSheetPreview = forwardRef(({ company, data }, ref) => {
  const displayCompany = getCompanyDisplayProfile(company);
  const accentHex = getPdfTheme(company.pdfTheme).swatch;
  const stateOperatingHead = typeof data.stateOperatingHead === 'string' ? data.stateOperatingHead.trim() : '';
  const leads = data.leads || [];
  const pages = [];
  for (let i = 0; i < leads.length; i += LEADS_PER_PAGE) {
    pages.push(leads.slice(i, i + LEADS_PER_PAGE));
  }
  if (pages.length === 0) pages.push([]);

  return (
    <div ref={ref} className="lead-sheet-document bg-white text-black" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
      <style>{`
        .lead-sheet-document .page-lead {
          max-width: 210mm;
          margin: 0 auto;
          padding: 15mm;
          min-height: 297mm;
          background: white;
        }
        .lead-sheet-document .page-break {
          page-break-after: always;
        }
        @media print {
          .lead-sheet-document .page-break {
            page-break-after: always;
          }
        }
        .lead-sheet-document .header {
          text-align: center;
          margin-bottom: 15px;
        }
        .lead-sheet-document .company-name {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .lead-sheet-document .company-logo {
          max-height: 40px;
          max-width: 140px;
          object-fit: contain;
          margin: 0 auto 8px;
        }
        .lead-sheet-document .company-info {
          font-size: 11px;
          margin-bottom: 3px;
        }
        .lead-sheet-document .separator {
          border-bottom: 2px solid ${accentHex};
          margin: 10px 0;
        }
        .lead-sheet-document .title {
          font-size: 16px;
          font-weight: bold;
          text-align: center;
          margin-bottom: 10px;
          color: ${accentHex};
        }
        .lead-sheet-document .lead-card {
          margin-bottom: 10px;
          border: 1px solid ${accentHex};
          border-radius: 4px;
          overflow: hidden;
        }
        .lead-sheet-document .lead-header {
          background-color: ${accentHex};
          color: #fff;
          padding: 4px;
          text-align: center;
          font-weight: bold;
          font-size: 10px;
        }
        .lead-sheet-document .lead-table {
          width: 100%;
          border-collapse: collapse;
        }
        .lead-sheet-document .lead-table td {
          border: 1px solid #d1d5db;
          padding: 4px 6px;
          font-size: 8px;
          vertical-align: top;
        }
        .lead-sheet-document .label {
          font-weight: bold;
          width: 80px;
        }
        .lead-sheet-document .value {
          background-color: #fff;
        }
        .lead-sheet-document .phone-label {
          font-weight: bold;
          width: 100px;
        }
        .lead-sheet-document .notes-row td {
          height: 30px;
        }
      `}</style>

      {pages.map((pageLeads, pageIndex) => (
        <React.Fragment key={pageIndex}>
          <div className="page-lead">
            <div className="header">
              {displayCompany.logoDataUrl && (
                <img className="company-logo" src={displayCompany.logoDataUrl} alt={`${displayCompany.companyName} logo`} />
              )}
              <div className="company-name">{displayCompany.companyName}</div>
              <div className="company-info">Founder: {displayCompany.founderName}</div>
              {stateOperatingHead && (
                <div className="company-info">State Operating Head: {stateOperatingHead}</div>
              )}
              {displayCompany.businessDocumentValue && (
                <div className="company-info">
                  {displayCompany.businessDocumentLabel}: {displayCompany.businessDocumentValue}
                </div>
              )}
              <div className="separator" />
              <div className="title">LEADS TRACKING SHEET</div>
            </div>

            {pageLeads.length === 0 ? (
              <div className="lead-card">
                <div className="lead-header">LEAD #1</div>
                <table className="lead-table">
                  <tr>
                    <td className="label">Name:</td>
                    <td className="value" colSpan="3" />
                    <td className="phone-label">Phone:</td>
                    <td className="value" />
                  </tr>
                  <tr>
                    <td className="label">Address:</td>
                    <td className="value" colSpan="5" />
                  </tr>
                  <tr>
                    <td className="label">Status:</td>
                    <td className="value" colSpan="2" />
                    <td className="phone-label">Contact Date:</td>
                    <td className="value" colSpan="2" />
                  </tr>
                  <tr className="notes-row">
                    <td className="label">Notes:</td>
                    <td className="value" colSpan="5" />
                  </tr>
                </table>
              </div>
            ) : (
              pageLeads.map((lead, i) => {
                const leadNum = pageIndex * LEADS_PER_PAGE + i + 1;
                return (
                  <div key={leadNum} className="lead-card">
                    <div className="lead-header">LEAD #{leadNum}</div>
                    <table className="lead-table">
                      <tbody>
                        <tr>
                          <td className="label">Name:</td>
                          <td className="value" colSpan="3">{lead.name || '\u00A0'}</td>
                          <td className="phone-label">Phone:</td>
                          <td className="value">{lead.phone || '\u00A0'}</td>
                        </tr>
                        <tr>
                          <td className="label">Address:</td>
                          <td className="value" colSpan="5">{lead.address || '\u00A0'}</td>
                        </tr>
                        <tr>
                          <td className="label">Status:</td>
                          <td className="value" colSpan="2">{lead.status || '\u00A0'}</td>
                          <td className="phone-label">Contact Date:</td>
                          <td className="value" colSpan="2">{lead.contactDate || '\u00A0'}</td>
                        </tr>
                        <tr className="notes-row">
                          <td className="label">Notes:</td>
                          <td className="value" colSpan="5">{lead.notes || '\u00A0'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                );
              })
            )}
          </div>
          {pageIndex < pages.length - 1 && <div className="page-break html2pdf__page-break" />}
        </React.Fragment>
      ))}
    </div>
  );
});

LeadSheetPreview.displayName = 'LeadSheetPreview';
export default LeadSheetPreview;
