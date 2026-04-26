import { useTranslation } from 'react-i18next'

export function AllocationBar({ pctRF = 0, pctRV = 0 }) {
  const { t } = useTranslation()
  
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">
        {t('summary.allocationTitle')}
      </p>
      <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold mb-2">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-sky-400 inline-block" />
          {t('summary.fixedIncome')} {pctRF.toFixed(1)}%
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-violet-400 inline-block" />
          {t('summary.variableIncome')} {pctRV.toFixed(1)}%
        </span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-slate-800 overflow-hidden flex">
        <div className="bg-sky-500 h-full transition-all duration-700 ease-out"
             style={{ width: `${pctRF}%` }} />
        <div className="bg-violet-500 h-full transition-all duration-700 ease-out"
             style={{ width: `${pctRV}%` }} />
      </div>
    </div>
  )
}
