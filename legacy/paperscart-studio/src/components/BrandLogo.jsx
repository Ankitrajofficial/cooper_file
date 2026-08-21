import React from 'react';

// Single source of truth for the PapersCart brand mark. Renders the full
// wordmark so the logo is never shown partially: paperscart-icon.png is a
// square crop of this same artwork that cuts off mid-word, and pairing it with
// a separate "PapersCart" text mark also spelled the name twice in two
// different typefaces.
export default function BrandLogo({ className = '', imgClassName = 'h-8 w-auto' }) {
  return (
    <span className={`inline-flex items-center ${className}`}>
      <img
        src="/paperscart-logo.png"
        alt="PapersCart"
        className={`${imgClassName} object-contain`}
      />
    </span>
  );
}
