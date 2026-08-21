import React, { forwardRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { getInvoiceTotals } from '../utils/invoiceMath';
import { getAddressLines, getCompanyDisplayProfile } from '../utils/companyProfile';
import { getPdfTheme } from '../utils/pdfThemes';
import SignatureBlock from './SignatureBlock';

const InvoicePreview = forwardRef(({ company, data }, ref) => {
  const {
    subtotal,
    discountType,
    discountValue,
    discountAmount,
    taxableAmount,
    gstRate,
    gstAmount,
    total,
    discountLabel,
    paymentRequestType,
    requestedPaymentAmount,
    balanceAfterRequestedPayment,
    paymentRequestLabel,
  } = getInvoiceTotals(data);
  const displayCompany = getCompanyDisplayProfile(company);
  const invoiceNumber = data.invoiceNumber || 'Generating...';
  const invoiceTitle = data.invoiceLabel || 'INVOICE';
  const theme = getPdfTheme(company.pdfTheme ?? data.invoiceTemplate);
  const templateStyles = { ...theme, panel: theme.accentSoft };
  const companyAddressLines = getAddressLines(displayCompany.address);
  const billingAddress = data.clientAddress || data.shippingAddress || 'Client Address';
  const shippingAddress = typeof data.shippingAddress === 'string' ? data.shippingAddress.trim() : '';
  const stateOperatingHead = typeof data.stateOperatingHead === 'string' ? data.stateOperatingHead.trim() : '';
  const shouldRequestPayment = data.status !== 'Paid' && paymentRequestType !== 'verification' && requestedPaymentAmount > 0;
  const footerNote = typeof data.footerNote === 'string' ? data.footerNote.trim() : '';
  const paymentTermsNote = typeof data.paymentTermsNote === 'string' ? data.paymentTermsNote.trim() : '';
  const bankDetails = [
    { label: 'Account', value: data.bankAccountName },
    { label: 'Bank', value: data.bankName },
    { label: 'A/C No.', value: data.bankAccountNumber },
    { label: 'IFSC', value: data.bankIfscCode },
    { label: 'Branch', value: data.bankBranch },
  ].filter((item) => typeof item.value === 'string' && item.value.trim());
  const hasBankDetails = bankDetails.length > 0;

  // QR content: UPI payment link if UPI ID set, else invoice summary for verification.
  // Always ensure non-empty value so the QR library never receives empty string.
  const qrValue = (() => {
    const upiId = (company.upiId || '').trim();
    if (upiId && shouldRequestPayment) {
      try {
        const pn = encodeURIComponent((displayCompany.founderName || displayCompany.companyName || 'Merchant').replace(/\s+/g, ' ').trim());
        const am = requestedPaymentAmount.toFixed(2);
        const tn = encodeURIComponent(`${paymentRequestLabel} for invoice ${invoiceNumber}`);
        return `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${pn}&am=${am}&tn=${tn}`;
      } catch {
        // fallback to plain text if URL build fails
      }
    }
    return `INVOICE ${invoiceNumber}\nAmount: ₹${total.toFixed(2)}\nRequested: ₹${requestedPaymentAmount.toFixed(2)}\nDate: ${data.date}\n${displayCompany.companyName || ''}`;
  })();

  const safeQrValue = qrValue && String(qrValue).trim() ? qrValue : `INVOICE ${invoiceNumber}\nAmount: ₹${total.toFixed(2)}`;

  return (
    <div
      className="bg-white shadow-2xl overflow-hidden relative mx-auto"
      style={{ width: '210mm', minWidth: '210mm', minHeight: '297mm' }}
    >
      <div
        ref={ref}
        className="bg-white relative flex flex-col"
        id="invoice-preview"
        style={{ width: '210mm', minWidth: '210mm', minHeight: '297mm' }}
      >

        {/* PAID Stamp */}
        {data.status === 'Paid' && (
          <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-4 border-red-600 text-red-600 text-6xl font-black px-4 py-2 opacity-50 rotate-[-15deg] pointer-events-none z-10">
            PAID
          </div>
        )}

        {/* Accent header band (full-bleed) */}
        <div className={`flex justify-between items-start gap-6 px-4 py-7 sm:px-6 md:px-8 lg:px-12 text-white ${templateStyles.band}`}>
          <div className="min-w-0">
            {displayCompany.logoDataUrl && (
              <img
                src={displayCompany.logoDataUrl}
                alt={`${displayCompany.companyName} logo`}
                className="mb-3 h-12 max-w-[44mm] object-contain"
              />
            )}
            <h2 className="text-2xl font-bold leading-tight">{displayCompany.companyName}</h2>
            {displayCompany.founderName && (
              <p className="text-sm text-white/70">{displayCompany.founderName}</p>
            )}
            <div className="mt-2 space-y-0.5 text-xs leading-relaxed text-white/70">
              {companyAddressLines.map((line) => (
                <p key={line} className="break-words">{line}</p>
              ))}
              <p>Mobile: {displayCompany.mobileNumber}</p>
              {displayCompany.businessDocumentValue && (
                <p>{displayCompany.businessDocumentLabel}: {displayCompany.businessDocumentValue}</p>
              )}
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end text-right" style={{ width: '72mm' }}>
            <div className="flex max-w-full flex-col items-end" style={{ gap: '5mm' }}>
              <h1
                className="m-0 max-w-full break-words text-3xl font-black uppercase tracking-wide"
                style={{ lineHeight: 1.12 }}
              >
                {invoiceTitle}
              </h1>
              <div
                className={`max-w-full rounded-full text-sm font-semibold ${templateStyles.chip}`}
                style={{
                  alignItems: 'center',
                  display: 'flex',
                  height: '10mm',
                  justifyContent: 'center',
                  lineHeight: '18px',
                  minHeight: '10mm',
                  padding: '0 5mm',
                  whiteSpace: 'nowrap',
                }}
              >
                #{invoiceNumber}
              </div>
            </div>
            <div className="mt-5 space-y-1 text-sm">
              <p><span className="text-white/60">Issued On</span>&nbsp;&nbsp;{data.date}</p>
              <p><span className="text-white/60">Due</span>&nbsp;&nbsp;{data.dueDate}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col px-4 py-8 sm:px-6 md:px-8 lg:px-12">

        {/* Client & status info */}
        <div className="flex justify-between gap-6 mb-10">
          <div className="min-w-0">
            <h3 className={`text-xs font-bold uppercase tracking-wider mb-2 ${templateStyles.accent}`}>Bill To</h3>
            <p className="text-lg font-bold text-gray-900">{data.clientName || 'Client Name'}</p>
            <p className="text-gray-600 max-w-xs whitespace-pre-wrap">{billingAddress}</p>
            {data.clientEmail && <p className="text-gray-600 text-sm">Email: {data.clientEmail}</p>}
            {data.clientPhone && <p className="text-gray-600 text-sm">Phone: {data.clientPhone}</p>}
            {shippingAddress && shippingAddress !== data.clientAddress && (
              <div className="mt-3 max-w-xs rounded-md border border-gray-200 bg-gray-50 p-2 text-sm text-gray-600">
                <p className="font-semibold uppercase tracking-wider text-gray-500 text-xs">Ship To</p>
                <p className="whitespace-pre-wrap">{shippingAddress}</p>
              </div>
            )}
            {stateOperatingHead && (
              <p className="text-gray-600 text-sm mt-3">
                <span className="font-semibold text-gray-500 uppercase tracking-wider">State Operating Head:</span>{' '}
                <span className="font-medium text-gray-900">{stateOperatingHead}</span>
              </p>
            )}
          </div>
          {data.status === 'Paid' && (
            <div className="shrink-0 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-right space-y-1">
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-3">Status</span>
                <span className="text-green-600 font-bold uppercase">PAID</span>
              </div>
              {data.paymentMethod && (
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-3">Method</span>
                  <span className="text-gray-900">{data.paymentMethod}</span>
                </div>
              )}
              {data.paymentDate && (
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-3">Paid On</span>
                  <span className="text-gray-900">{data.paymentDate}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Items Table */}
        <table className="w-full mb-4" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead>
            <tr className={`text-white ${templateStyles.tableHead}`}>
              <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider rounded-l-md">Description</th>
              <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider">Qty</th>
              <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider">Price</th>
              <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wider rounded-r-md">Total</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, index) => (
              <tr key={index} className={index % 2 === 1 ? 'bg-gray-50' : 'bg-white'}>
                <td className="py-3 px-4 text-gray-700">
                  <div className="flex items-center gap-3">
                    {item.imageDataUrl && (
                      <img src={item.imageDataUrl} alt={item.description || 'Product'} className="h-12 w-12 rounded border border-gray-200 object-cover" />
                    )}
                    <span>{item.description}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right text-gray-700 tabular-nums">{item.quantity}</td>
                <td className="py-3 px-4 text-right text-gray-700 tabular-nums">₹{item.price.toFixed(2)}</td>
                <td className="py-3 px-4 text-right font-semibold text-gray-900 tabular-nums">₹{(item.quantity * item.price).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* QR (left) + Totals (right) - same row, just below items */}
        <div className="flex justify-between items-start gap-6 mb-12">
          <div className="w-[92mm] shrink-0 space-y-3">
            <div className={`border border-gray-200 rounded-lg p-3 ${templateStyles.panel}`}>
              <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${templateStyles.accent}`}>
                {company.upiId && shouldRequestPayment ? 'Quick pay via UPI' : 'Invoice verification'}
              </p>
              <div className="flex gap-3 items-center">
                <div className="bg-white p-1.5 rounded border border-gray-200" style={{ width: 88, height: 88 }}>
                  <QRCodeCanvas value={safeQrValue} size={88} level="M" style={{ width: 88, height: 88, display: 'block' }} />
                </div>
                <div className="text-xs text-gray-700 space-y-1 min-w-0">
                  {shouldRequestPayment ? (
                    <>
                      <p className="font-semibold text-gray-900">{paymentRequestLabel}: ₹{requestedPaymentAmount.toFixed(2)}</p>
                      <p className="text-gray-600">Balance: ₹{balanceAfterRequestedPayment.toFixed(2)}</p>
                    </>
                  ) : (
                    <p className="font-semibold text-gray-900">Amount: ₹{total.toFixed(2)}</p>
                  )}
                  {company.upiId && shouldRequestPayment && (
                    <p className="text-gray-600 break-all">UPI: {company.upiId}</p>
                  )}
                  <p className="text-gray-500">
                    {company.upiId && shouldRequestPayment
                      ? 'Scan with UPI app to pay'
                      : `Scan to verify #${invoiceNumber}`}
                  </p>
                </div>
              </div>
            </div>
            {hasBankDetails && (
              <div className="border border-gray-200 rounded-lg p-3 bg-white">
                <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${templateStyles.accent}`}>Bank details</p>
                <div className="grid grid-cols-[70px,1fr] gap-x-2 gap-y-1 text-xs text-gray-700">
                  {bankDetails.map((item) => (
                    <React.Fragment key={item.label}>
                      <span className="font-semibold text-gray-500">{item.label}</span>
                      <span className="break-words text-gray-900">{item.value}</span>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="w-64 shrink-0">
            <div className="flex justify-between gap-4 py-2 border-b border-gray-200">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium text-gray-900 text-right">₹{subtotal.toFixed(2)}</span>
            </div>
            {(discountAmount > 0 || discountValue > 0) && (
              <div className="flex justify-between gap-4 py-2 border-b border-gray-200">
                <span className="text-gray-600 min-w-0">
                  {discountLabel}
                  {discountType === 'percent' ? ` (${discountValue.toFixed(2)}%)` : ''}
                </span>
              <span className={`font-medium text-right shrink-0 ${templateStyles.accent}`}>-₹{discountAmount.toFixed(2)}</span>
              </div>
            )}
            {(gstRate > 0 || gstAmount > 0) && (
              <>
                <div className="flex justify-between gap-4 py-2 border-b border-gray-200">
                  <span className="text-gray-600">Taxable amount</span>
                  <span className="font-medium text-gray-900 text-right">₹{taxableAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between gap-4 py-2 border-b border-gray-200">
                  <span className="text-gray-600 min-w-0">GST ({gstRate.toFixed(2)}%)</span>
                  <span className="font-medium text-gray-900 text-right shrink-0">₹{gstAmount.toFixed(2)}</span>
                </div>
              </>
            )}
            <div className={`flex justify-between items-center gap-4 mt-3 px-4 py-3 rounded-md text-white ${templateStyles.totalPanel}`}>
              <span className="text-base font-bold uppercase tracking-wide">{shouldRequestPayment ? 'Total' : 'Total Due'}</span>
              <span className="text-xl font-black text-right tabular-nums">₹{total.toFixed(2)}</span>
            </div>
            {shouldRequestPayment && (
              <div className="mt-3 rounded-md border border-gray-200 overflow-hidden">
                <div className={`flex justify-between gap-4 px-3 py-2 ${templateStyles.panel}`}>
                  <span className="text-gray-700 min-w-0 leading-snug font-medium">{paymentRequestLabel}</span>
                  <span className={`font-bold text-right shrink-0 tabular-nums ${templateStyles.accent}`}>₹{requestedPaymentAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between gap-4 px-3 py-2 border-t border-gray-200">
                  <span className="text-gray-600 min-w-0 leading-snug">Balance after payment</span>
                  <span className="font-semibold text-gray-900 text-right shrink-0 tabular-nums">₹{balanceAfterRequestedPayment.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* An invoice is issued, not countersigned — only the authorised
            signatory side is shown. */}
        <SignatureBlock
          className="mt-auto pt-10"
          theme={theme}
          signerName={displayCompany.founderName || displayCompany.companyName}
          companyName={displayCompany.companyName}
          signerRole="Authorised Signatory"
          signedDate={data.date}
          showCounterparty={false}
        />

        {/* Footer. mt-6 is load-bearing: the signature block above ends flush
            against this border, so anything html2canvas renders taller than the
            browser laid out gets drawn straight across the rule. */}
        <div className="pdf-keep-together mt-6 pt-6 border-t border-gray-200 text-center text-sm">
          <p className="font-semibold text-gray-700">{footerNote || 'Thank you for your business!'}</p>
          <p className="mt-1 text-gray-500">{paymentTermsNote || 'Payment is due within 15 days.'}</p>
        </div>
        </div>
      </div>
    </div>
  );
});

InvoicePreview.displayName = 'InvoicePreview';

export default InvoicePreview;
