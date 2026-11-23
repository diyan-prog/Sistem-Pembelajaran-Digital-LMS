

export function SchoolIllustration() {
  return (
    <svg viewBox="0 0 480 300" className="w-full max-w-[460px]" aria-hidden>
      <ellipse cx="240" cy="262" rx="220" ry="22" fill="rgba(0,0,0,.12)" />
      <circle cx="400" cy="60" r="34" fill="#FDE68A" /><g fill="#fff" opacity=".9"><ellipse cx="90" cy="58" rx="40" ry="14" /><ellipse cx="116" cy="48" rx="26" ry="13" /><ellipse cx="330" cy="100" rx="34" ry="11" /></g>
      <rect x="90" y="130" width="300" height="130" rx="6" fill="#fff" /><rect x="190" y="90" width="100" height="170" rx="6" fill="#F3F4F6" /><path d="M180 92l60-40 60 40z" fill="#0E86C7" /><circle cx="240" cy="116" r="14" fill="#fff" stroke="#0B3D5F" strokeWidth="4" /><path d="M240 108v8h6" stroke="#0B3D5F" strokeWidth="3" fill="none" strokeLinecap="round" />
      <rect x="222" y="196" width="36" height="64" rx="4" fill="#0B3D5F" />
      {[110, 140, 316, 346].map((x) => <rect key={x} x={x} y="160" width="26" height="34" rx="4" fill="#BBE5C6" />)}{[110, 140, 316, 346].map((x) => <rect key={x + 1} x={x} y="214" width="26" height="30" rx="4" fill="#BBE5C6" />)}
      <rect x="216" y="30" width="2.5" height="36" fill="#fff" /><path d="M218 30h26l-6 7 6 7h-26z" fill="#F59E0B" />
      <g><circle cx="60" cy="226" r="12" fill="#FBBF77" /><rect x="48" y="238" width="24" height="34" rx="10" fill="#2563EB" /><rect x="56" y="268" width="8" height="0" /></g>
      <g><circle cx="430" cy="226" r="12" fill="#F2B28C" /><rect x="418" y="238" width="24" height="34" rx="10" fill="#F59E0B" /></g>
      <rect x="20" y="236" width="40" height="30" rx="4" fill="none" /><g fill="#0B3D5F"><circle cx="40" cy="250" r="22" opacity=".0" /></g>
      <g><rect x="30" y="200" width="22" height="48" rx="11" fill="#0E86C7" opacity=".0" /><circle cx="448" cy="180" r="18" fill="#0E86C7" /><circle cx="466" cy="196" r="14" fill="#0B3D5F" /><rect x="445" y="196" width="6" height="60" fill="#8B5E34" /></g>
    </svg>
  )
}
