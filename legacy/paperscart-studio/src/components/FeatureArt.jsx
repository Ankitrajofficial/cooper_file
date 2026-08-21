import React from 'react';

// Flat, on-brand vector illustrations for the landing "Why freelancers use it"
// feature cards. Brand green (#29b765) family on a soft brand-50 banner.
// Vector = crisp at any size, tiny payload, restyle-friendly.

const C = {
  green: '#29b765',
  greenDark: '#1f9b54',
  greenDarker: '#1a7c45',
  greenSoft: '#cdf3df',
  greenMint: '#6ed9a2',
  white: '#ffffff',
};

const svgProps = {
  viewBox: '0 0 400 200',
  className: 'h-full w-full',
  preserveAspectRatio: 'xMidYMid meet',
  role: 'img',
};

// One profile, every client — a profile card feeding three documents.
export function ProfileArt() {
  const docs = [40, 86, 132];
  return (
    <svg {...svgProps} aria-label="One reusable profile fills every document">
      <g fill="none" stroke={C.green} strokeWidth="2" strokeDasharray="4 5" opacity="0.55">
        <path d="M158 100 C 200 100, 205 61, 245 61" />
        <path d="M158 100 H245" />
        <path d="M158 100 C 200 100, 205 153, 245 153" />
      </g>
      <rect x="42" y="60" width="116" height="84" rx="14" fill={C.white} stroke={C.green} strokeWidth="2" />
      <circle cx="74" cy="92" r="17" fill={C.greenSoft} stroke={C.green} strokeWidth="2" />
      <circle cx="74" cy="87" r="6" fill={C.greenDark} />
      <path d="M62 102 a12 12 0 0 1 24 0" fill={C.greenDark} />
      <rect x="98" y="84" width="46" height="9" rx="4.5" fill={C.greenDarker} />
      <rect x="98" y="99" width="32" height="6" rx="3" fill={C.greenSoft} />
      {docs.map((y) => (
        <g key={y}>
          <rect x="245" y={y} width="118" height="42" rx="10" fill={C.white} stroke={C.greenSoft} strokeWidth="2" />
          <rect x="256" y={y + 11} width="20" height="20" rx="5" fill={C.greenSoft} />
          <rect x="286" y={y + 13} width="62" height="6" rx="3" fill={C.greenDarker} opacity="0.5" />
          <rect x="286" y={y + 25} width="40" height="5" rx="2.5" fill={C.greenSoft} />
        </g>
      ))}
    </svg>
  );
}

// Get paid faster — phone showing a UPI QR with a paid checkmark.
export function PayArt() {
  const finder = (x, y) => (
    <g>
      <rect x={x} y={y} width="20" height="20" rx="3" fill="none" stroke={C.greenDarker} strokeWidth="4" />
      <rect x={x + 7} y={y + 7} width="6" height="6" rx="1.5" fill={C.greenDarker} />
    </g>
  );
  const dots = [
    [218, 66], [226, 74], [218, 82], [234, 66], [242, 74], [234, 90],
    [218, 116], [226, 124], [242, 116], [234, 132], [218, 132], [242, 132],
  ];
  return (
    <svg {...svgProps} aria-label="Get paid with a UPI QR">
      <rect x="158" y="30" width="120" height="150" rx="20" fill={C.white} stroke={C.green} strokeWidth="2" />
      <rect x="172" y="48" width="92" height="104" rx="9" fill="#ebfaf2" />
      {finder(186, 62)}
      {finder(248, 62)}
      {finder(186, 112)}
      {dots.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="6" height="6" rx="1.5" fill={C.greenDark} />
      ))}
      <rect x="178" y="160" width="80" height="6" rx="3" fill={C.greenSoft} />
      <circle cx="268" cy="54" r="19" fill={C.green} stroke={C.white} strokeWidth="3" />
      <path d="M259 54 l6 7 l11 -13" fill="none" stroke={C.white} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Look the part — a branded document with a colour-theme palette.
export function ThemeArt() {
  return (
    <svg {...svgProps} aria-label="Pick a brand colour theme">
      <rect x="118" y="32" width="164" height="140" rx="16" fill={C.white} stroke={C.green} strokeWidth="2" />
      <path d="M134 32 H266 A16 16 0 0 1 282 48 V58 H118 V48 A16 16 0 0 1 134 32 Z" fill={C.green} />
      <circle cx="138" cy="45" r="5" fill={C.white} opacity="0.85" />
      <rect x="152" y="41" width="60" height="8" rx="4" fill={C.white} opacity="0.85" />
      <rect x="138" y="78" width="128" height="8" rx="4" fill={C.greenDarker} opacity="0.35" />
      <rect x="138" y="96" width="110" height="6" rx="3" fill={C.greenSoft} />
      <rect x="138" y="110" width="120" height="6" rx="3" fill={C.greenSoft} />
      <rect x="200" y="132" width="66" height="22" rx="11" fill={C.greenSoft} />
      <circle cx="150" cy="143" r="11" fill={C.green} stroke={C.white} strokeWidth="2" />
      <circle cx="170" cy="143" r="11" fill={C.greenDarker} stroke={C.white} strokeWidth="2" />
      <circle cx="190" cy="143" r="11" fill={C.greenMint} stroke={C.white} strokeWidth="2" />
    </svg>
  );
}

// Yours and private — a shield with a check guarding a document.
export function PrivateArt() {
  return (
    <svg {...svgProps} aria-label="Your data stays private">
      <rect x="120" y="46" width="104" height="124" rx="12" fill={C.white} stroke={C.greenSoft} strokeWidth="2" />
      <rect x="136" y="66" width="56" height="7" rx="3.5" fill={C.greenDarker} opacity="0.35" />
      <rect x="136" y="82" width="72" height="6" rx="3" fill={C.greenSoft} />
      <rect x="136" y="96" width="64" height="6" rx="3" fill={C.greenSoft} />
      <rect x="136" y="110" width="50" height="6" rx="3" fill={C.greenSoft} />
      <path
        d="M250 50 L298 68 V108 C298 138 277 157 250 167 C223 157 202 138 202 108 V68 Z"
        fill={C.green}
        stroke={C.white}
        strokeWidth="3"
      />
      <path
        d="M232 108 l12 13 l24 -28"
        fill="none"
        stroke={C.white}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
