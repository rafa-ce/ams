import { useState } from 'react'
import { useInvestments } from './hooks/useInvestments.js'
import { SummaryCard, Skeleton, Icon } from './components/ui.jsx'
import { AllocationBar }               from './components/AllocationBar.jsx'
import { InvestmentsTable }          from './components/InvestmentsTable.jsx'
import { AddModal }              from './components/AddModal.jsx'
import { brl, pct }                    from './utils/formatters.js'
import { useTranslation } from 'react-i18next'

export default function App() {
  const { t, i18n } = useTranslation()
  const { data, loading, error, reload } = useInvestments()
  const [showModal, setShowModal] = useState(false)

  const summary        = data?.summary
  const investments = data?.investments ?? []

  const toggleLanguage = (lng) => {
    i18n.changeLanguage(lng);
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      {/* Glow */}
      <div className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(56,189,248,0.07) 0%, transparent 65%)',
        }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <header className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sky-400"><Icon.Star /></span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-sky-400">
                {t('header.personalPortfolio')}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">
              {t('header.investmentManagement')}
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              {t('header.subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select 
              value={i18n.language} 
              onChange={(e) => toggleLanguage(e.target.value)}
              className="bg-slate-800 text-slate-300 text-xs rounded border border-slate-700 px-2 py-1 mr-2 outline-none">
              <option value="en">English</option>
              <option value="pt">Português</option>
            </select>
            <button
              onClick={reload}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 rounded-xl
                bg-slate-800 hover:bg-slate-700 border border-slate-700
                text-slate-400 hover:text-white text-xs font-semibold
                transition-all disabled:opacity-40">
              <span className={loading ? 'animate-spin' : ''}><Icon.Refresh /></span>
              {t('header.refresh')}
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl
                bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold
                transition-all shadow-lg shadow-sky-500/20">
              <Icon.Plus />
              {t('header.add')}
            </button>
          </div>
        </header>

        {/* ── Error ───────────────────────────────────────────────────────────── */}
        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10
            px-4 py-3 text-rose-300 text-xs flex gap-3 items-start">
            <span className="text-base mt-0.5">⚠</span>
            <div>
              <strong className="font-semibold">{t('error.apiConnection')}</strong> {error}
              <span className="block text-rose-400/60 mt-0.5">
                {t('error.checkApi')}
              </span>
            </div>
          </div>
        )}

        {/* ── Summary Cards ─────────────────────────────────────────────────── */}
        {loading && !summary
          ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-2xl" />
              ))}
            </div>
          )
          : summary && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <SummaryCard
                label={t('summary.totalInvested')}
                icon={<Icon.Wallet />}
                accent="blue"
                value={brl(summary.totalInvested)}
                sub={`${summary.totalAssets} ${summary.totalAssets === 1 ? t('summary.assets_one', { count: '' }) : t('summary.assets_other', { count: '' })}`.trim()}
              />
              <SummaryCard
                label={t('summary.currentValue')}
                icon={<Icon.BarChart />}
                accent="violet"
                value={brl(summary.totalCurrent)}
                sub={pct(summary.totalReturnPercentage)}
                positive={summary.totalReturn >= 0}
              />
              <SummaryCard
                label={t('summary.fixedIncome')}
                icon={<Icon.Building />}
                accent="green"
                value={brl(summary.totalFixedIncome)}
                sub={t('summary.portfolioPercentage', { percentage: summary.fixedIncomePercentage.toFixed(1) })}
              />
              <SummaryCard
                label={t('summary.variableIncome')}
                icon={<Icon.Star />}
                accent="amber"
                value={brl(summary.totalVariableIncome)}
                sub={t('summary.portfolioPercentage', { percentage: summary.variableIncomePercentage.toFixed(1) })}
              />
            </div>
          )
        }

        {/* ── Allocation Bar ───────────────────────────────────────────────── */}
        {summary && (
          <AllocationBar
            pctRF={summary.fixedIncomePercentage}
            pctRV={summary.variableIncomePercentage}
          />
        )}

        {/* ── Table ──────────────────────────────────────────────────────────── */}
        <InvestmentsTable
          investments={investments}
          loading={loading}
          onRefresh={reload}
          onEdit={(inv) => setShowModal(inv)}
        />

        <footer className="text-center text-[10px] text-slate-700 pb-2 mt-8">
          Personal Investments • .NET 9 + React 18 + Tailwind CSS + i18next
        </footer>
      </div>

      {/* ── Modal ───────────────────────────────────────────────────────────── */}
      {showModal && (
        <AddModal
          initialData={showModal !== true ? showModal : null}
          onClose={() => setShowModal(false)}
          onSuccess={reload}
        />
      )}
    </div>
  )
}
