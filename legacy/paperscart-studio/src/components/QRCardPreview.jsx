import React, { forwardRef } from 'react';
import { Camera } from 'lucide-react';
import { getCompanyDisplayProfile } from '../utils/companyProfile';

const QRCardPreview = forwardRef(({ company, data }, ref) => {
  const displayCompany = getCompanyDisplayProfile(company);
  const { 
    hostelName = 'Property Name', 
    purpose = 'Scan to Connect', 
    theme = 'theme-default', 
    qrImage,
    stateOperatingHead = '',
    qrMessage = 'Fast & secure. Connect with us instantly.'
  } = data;
  const closedBy = typeof stateOperatingHead === 'string' ? stateOperatingHead.trim() : '';

  // Render different company branding based on theme
  const getBrandingText = () => {
    return `POWERED BY ${displayCompany.companyName.toUpperCase()}`;
  };

  return (
    <div ref={ref} className="bg-white p-4 sm:p-8 rounded-xl shadow-sm border border-gray-100 flex items-center justify-center min-h-[500px] overflow-hidden">
      {/* 
        This wrapper creates the correct context for html2pdf. 
        The inline styles prevent it from inheriting conflicting responsive classes 
      */}
      <div 
        style={{ 
          width: '400px', 
          height: '600px',
          position: 'relative',
          padding: 0,
          margin: 0,
          boxSizing: 'border-box',
          backgroundColor: 'transparent'
        }}
        className="qr-pdf-container"
      >
        <div className={`qr-card ${theme}`}>
          <div className="card-header">
            <h1>{hostelName || 'Property Name'}</h1>
            <p className="subtitle">{purpose}</p>
          </div>

          <div className="qr-container">
            {qrImage ? (
              <div className="qr-placeholder" style={{ border: 'none', background: 'transparent' }}>
                <img src={qrImage} alt="QR Code" />
              </div>
            ) : (
              <div className="qr-placeholder flex flex-col items-center justify-center text-gray-400 gap-2">
                <Camera size={32} />
                <span className="text-sm font-medium">Upload QR Code</span>
              </div>
            )}
          </div>

          <p className="sweet-msg">{qrMessage}</p>

          {closedBy && (
            <p className="sweet-msg" style={{ fontSize: '0.82rem', marginTop: '0.35rem' }}>
              State Operating Head: {closedBy}
            </p>
          )}

          <div className="card-footer">
            {displayCompany.logoDataUrl && (
              <img
                src={displayCompany.logoDataUrl}
                alt={`${displayCompany.companyName} logo`}
                style={{
                  display: 'block',
                  maxWidth: '110px',
                  maxHeight: '42px',
                  objectFit: 'contain',
                  margin: '0 auto 0.4rem',
                }}
              />
            )}
            <p>Thank you!</p>
          </div>

          <div className="powered-by">{getBrandingText()}</div>

          {/* Decorational elements for themes */}
          <div className="decoration dec-1"></div>
          <div className="decoration dec-2"></div>
        </div>
      </div>
    </div>
  );
});

QRCardPreview.displayName = 'QRCardPreview';

export default QRCardPreview;
