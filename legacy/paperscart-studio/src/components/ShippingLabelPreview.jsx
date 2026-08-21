import React, { forwardRef } from 'react';
import { getCompanyDisplayProfile } from '../utils/companyProfile';
import { getPdfTheme } from '../utils/pdfThemes';

const ShippingLabelPreview = forwardRef(({ company, data }, ref) => {
  const displayCompany = getCompanyDisplayProfile(company);
  const theme = getPdfTheme(company.pdfTheme);
  const shippingAddress = data.shippingAddress || data.clientAddress || 'Shipping address';

  return (
    <div className="mx-auto bg-white shadow-2xl" style={{ width: '148mm', minWidth: '148mm', minHeight: '210mm' }}>
      <div ref={ref} className="bg-white p-10">
        <div className={`overflow-hidden rounded-lg border-2 ${theme.divider}`}>
          {/* Themed Ship-From band */}
          <div className={`flex items-start justify-between gap-6 px-6 py-5 text-white ${theme.band}`}>
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">Ship From</p>
              <h1 className="mt-2 text-xl font-black">{displayCompany.companyName}</h1>
              <p className="text-sm text-white/80">{displayCompany.founderName}</p>
              <p className="max-w-[72mm] text-sm text-white/80">{displayCompany.address}</p>
              <p className="text-sm text-white/80">Mobile: {displayCompany.mobileNumber}</p>
            </div>
            {displayCompany.logoDataUrl && (
              <img src={displayCompany.logoDataUrl} alt={`${displayCompany.companyName} logo`} className="h-16 max-w-[38mm] object-contain" />
            )}
          </div>

          <div className="px-6 py-8">
            <p className={`text-xs font-black uppercase tracking-[0.2em] ${theme.accent}`}>Ship To</p>
            <h2 className="mt-3 text-3xl font-black text-slate-950">{data.clientName || 'Customer Name'}</h2>
            <p className="mt-3 whitespace-pre-wrap text-lg leading-8 text-slate-800">{shippingAddress}</p>
            <div className="mt-5 grid grid-cols-2 gap-4 text-sm text-slate-700">
              <p><span className="font-black">Phone:</span> {data.clientPhone || '-'}</p>
              <p><span className="font-black">Email:</span> {data.clientEmail || '-'}</p>
            </div>
          </div>

          <div className={`border-t-2 px-6 py-5 ${theme.divider}`}>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <p><span className="font-black">Invoice:</span> {data.invoiceNumber || '-'}</p>
              <p><span className="font-black">Date:</span> {data.date || '-'}</p>
            </div>
            <p className="mt-5 text-center text-xs font-black uppercase tracking-[0.25em] text-slate-400">Paperless Shipping Label</p>
          </div>
        </div>
      </div>
    </div>
  );
});

ShippingLabelPreview.displayName = 'ShippingLabelPreview';
export default ShippingLabelPreview;
