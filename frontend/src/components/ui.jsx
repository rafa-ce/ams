// ── Ícones ────────────────────────────────────────────────────────────────────
export const Icon = {
  TrendUp: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  TrendDown: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
      <polyline points="17 18 23 18 23 12" />
    </svg>
  ),
  Wallet: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 12V22H4V12" /><path d="M22 7H2v5h20V7z" />
      <path d="M12 22V7" /><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </svg>
  ),
  BarChart: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  ),
  Building: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="9" width="18" height="13" /><path d="M8 22V12h8v10" />
      <path d="M3 9l9-7 9 7" />
    </svg>
  ),
  Star: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  Plus: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Trash: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  ),
  Edit: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  X: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Refresh: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  ),
}

// ── Type Badge ─────────────────────────────────────────────────────────────
export function TypeBadge({ type, typeName, category }) {
  const isFixed = type === 'FixedIncome'
  const label = isFixed ? (typeName ?? 'Fixed Income') : (category ?? 'Variable Inc.')
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide
      ${isFixed
        ? 'bg-sky-500/15 text-sky-300 border border-sky-500/25'
        : 'bg-violet-500/15 text-violet-300 border border-violet-500/25'}`}>
      {label}
    </span>
  )
}

// ── Return Badge ───────────────────────────────────────────────────────
export function ReturnBadge({ value, percentage }) {
  const pos = (value ?? 0) >= 0
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold
      ${pos ? 'bg-emerald-500/10 text-emerald-300' : 'bg-rose-500/10 text-rose-300'}`}>
      {pos ? <Icon.TrendUp /> : <Icon.TrendDown />}
      {percentage != null ? `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%` : '—'}
    </span>
  )
}

// ── Summary card ──────────────────────────────────────────────────────────────
const accentStyles = {
  blue:   { wrap: 'from-sky-500/15 to-sky-500/5 border-sky-500/20',     icon: 'text-sky-400'     },
  violet: { wrap: 'from-violet-500/15 to-violet-500/5 border-violet-500/20', icon: 'text-violet-400' },
  green:  { wrap: 'from-emerald-500/15 to-emerald-500/5 border-emerald-500/20', icon: 'text-emerald-400' },
  amber:  { wrap: 'from-amber-500/15 to-amber-500/5 border-amber-500/20', icon: 'text-amber-400' },
}

export function SummaryCard({ label, value, sub, icon, positive, accent = 'blue' }) {
  const s = accentStyles[accent]
  return (
    <div className={`rounded-2xl border bg-gradient-to-br p-5 flex flex-col gap-3 ${s.wrap}`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</span>
        <span className={`${s.icon} opacity-70`}>{icon}</span>
      </div>
      <div>
        <p className="text-xl font-bold text-white tracking-tight tabular">{value}</p>
        {sub && (
          <p className={`mt-1 text-xs font-semibold flex items-center gap-1
            ${positive === undefined ? 'text-slate-500'
              : positive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {positive !== undefined && (positive ? <Icon.TrendUp /> : <Icon.TrendDown />)}
            {sub}
          </p>
        )}
      </div>
    </div>
  )
}

// ── Skeleton loader ───────────────────────────────────────────────────────────
export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-slate-800 rounded ${className}`} />
}

// ── Modal base ────────────────────────────────────────────────────────────────
export function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ background: 'rgba(0,0,0,0.7)' }}
         onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#111827] border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <button onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800">
            <Icon.X />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

// ── Campo de formulário ───────────────────────────────────────────────────────
export function Field({ label, children, error }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</label>
      {children}
      {error && <span className="text-xs text-rose-400">{error}</span>}
    </div>
  )
}

export function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700
        text-sm text-white placeholder-slate-500
        focus:outline-none focus:border-sky-500/60 focus:ring-1 focus:ring-sky-500/25
        transition-all ${className}`}
      {...props}
    />
  )
}

export function Select({ className = '', children, ...props }) {
  return (
    <select
      className={`w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700
        text-sm text-white
        focus:outline-none focus:border-sky-500/60 focus:ring-1 focus:ring-sky-500/25
        transition-all ${className}`}
      {...props}>
      {children}
    </select>
  )
}
