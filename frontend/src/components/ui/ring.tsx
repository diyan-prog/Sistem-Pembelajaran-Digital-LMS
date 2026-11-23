

export function Ring({ value, size = 120, stroke = 12, label, sub, color = '#0B3D5F' }: { value: number; size?: number; stroke?: number; label?: string; sub?: string; color?: string }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90"><circle cx={size / 2} cy={size / 2} r={r} stroke="#E5E7EB" strokeWidth={stroke} fill="none" /><circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (c * Math.min(100, value)) / 100} style={{ transition: 'stroke-dashoffset .8s' }} /></svg>
      <div className="absolute text-center"><div className="font-extrabold leading-none" style={{ fontSize: size / 3.4 }}>{label ?? value}</div>{sub && <div className="text-xs text-muted mt-1">{sub}</div>}</div>
    </div>
  )
}
