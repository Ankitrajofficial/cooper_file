import React from 'react';

// A typed electronic signature drawn from the profile details already on file.
// It is deliberately labelled as electronically signed rather than dressed up
// as a hand-written signature — the reader should know what they are looking at.
const SCRIPT_FONT =
  '"Snell Roundhand", "Brush Script MT", "Segoe Script", "Bradley Hand", "Lucida Handwriting", cursive';

function formatSignedDate(date) {
  if (!date) return '';
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

// html2canvas does not lay text out the way the browser does: it puts the
// baseline near the bottom of the line box instead of centring the font's
// content area in it. Measured against this font at 30px, the ink lands ~7px
// BELOW the span's border box — so `truncate`'s `overflow: hidden` sliced every
// descender off flat in the PDF even though the same span renders clean on
// screen. Raising `line-height` cannot fix it, because html2canvas moves the
// baseline down with the box.
//
// Padding is the lever that works: `overflow` clips at the padding box, so the
// pb below buys room for the descenders and swashes to land inside the clip.
// Keep the truncation itself — it stops a long name spilling into the next
// grid column.
//
// leading-[1.2] + pb-6 was picked by measuring the rendered ink against names
// with deep descenders ("Jayanti Gupta"), not by eye: it leaves 8px of clear
// space under the lowest pixel and still fits the h-16 row below. Tightening
// either value eats that margin — pb-3 leaves only 0.5px, which clips again on
// the first name with a descender in it.
export function SignatureMark({ name, theme }) {
  return (
    <span
      className={`block max-w-full overflow-hidden text-ellipsis whitespace-nowrap pb-6 text-3xl leading-[1.2] ${
        theme?.accent || 'text-gray-900'
      }`}
      style={{ fontFamily: SCRIPT_FONT }}
    >
      {name}
    </span>
  );
}

/**
 * Signature row. The provider side signs automatically from the saved profile;
 * the counterparty side stays blank for them to sign by hand.
 */
export default function SignatureBlock({
  theme,
  signerName,
  companyName,
  signerRole = 'Service Provider',
  signedDate,
  counterpartyName,
  counterpartyRole = 'Client Signature',
  showCounterparty = true,
  className = '',
}) {
  const signedOn = formatSignedDate(signedDate);

  const providerCell = (
    <div>
      <div className="flex h-16 items-end">
        <SignatureMark name={signerName} theme={theme} />
      </div>
      {/* Deliberately no bottom padding here: this block is the last thing on
          the agreement and scope sheets, so padding lands past the bottom of
          the A4 box and buys a second page. Documents that put something below
          the signature own the clearance instead (see InvoicePreview). */}
      <div className="border-t border-gray-400 pt-2">
        <p className="text-sm font-bold text-gray-900">{signerName}</p>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">{signerRole}</p>
        <p className="mt-2 text-xs leading-5 text-gray-500">
          Electronically signed{companyName ? ` for ${companyName}` : ''}
          {signedOn ? ` on ${signedOn}` : ''}
        </p>
      </div>
    </div>
  );

  if (!showCounterparty) {
    return <div className={`pdf-keep-together grid grid-cols-2 gap-10 ${className}`}>{providerCell}<div /></div>;
  }

  return (
    <div className={`pdf-keep-together grid grid-cols-2 gap-10 ${className}`}>
      <div>
        {/* Matches the signed side's mark height so both rules line up. */}
        <div className="h-16" />
        <div className="border-t border-gray-400 pt-2">
          <p className="text-sm font-bold text-gray-900">{counterpartyName || 'Client'}</p>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">{counterpartyRole}</p>
          <p className="mt-2 text-xs text-gray-400">Date: ______________</p>
        </div>
      </div>
      {providerCell}
    </div>
  );
}
