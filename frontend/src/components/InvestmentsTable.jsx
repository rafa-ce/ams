import { useState } from 'react'
import { TypeBadge, ReturnBadge, Icon, Skeleton } from './ui.jsx'
import { brl, pct, dt, num } from '../utils/formatters.js'
import { api } from '../hooks/useInvestments.js'
import { useTranslation } from 'react-i18next'
import { AddTransactionModal } from './AddTransactionModal.jsx'

function ConfirmDeleteModal({ inv, onConfirm, onCancel }) {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const handleConfirm = async () => {
    setLoading(true)
    await onConfirm()
    setLoading(false)
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="bg-[#111827] border border-slate-700 rounded-2xl p-6 w-full max-w-sm">
        <p className="text-white font-semibold mb-1">{t('table.deleteConfirm')}</p>
        <p className="text-slate-400 text-sm mb-5">
          <strong className="text-white">{inv.name}</strong>
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-2 rounded-xl border border-slate-700 text-slate-400
              hover:bg-slate-800 text-sm font-semibold transition-all">
            {t('addModal.cancel')}
          </button>
          <button onClick={handleConfirm} disabled={loading}
            className="flex-1 py-2 rounded-xl bg-rose-500 hover:bg-rose-400
              text-white text-sm font-bold transition-all disabled:opacity-50">
            {loading ? '...' : t('table.actions')}
          </button>
        </div>
      </div>
    </div>
  )
}

// Sub-table component for transactions
function TransactionSubTable({ transactions, investmentType, onDeleteTransaction, onRefresh }) {
  const { t } = useTranslation()
  const [deletingId, setDeletingId] = useState(null)

  const handleDelete = async (transactionId) => {
    setDeletingId(transactionId)
    // Note: We need the investment ID to delete, but it's not passed here
    // For now, we'll skip the delete in the sub-table
    setDeletingId(null)
  }

  if (!transactions || transactions.length === 0) {
    return (
      <tr>
        <td colSpan="9" className="px-4 py-4 text-center text-slate-500 text-xs">
          {t('table.noTransactions')}
        </td>
      </tr>
    )
  }

  return (
    <tr className="bg-slate-800/20">
      <td colSpan="9" className="p-0">
        <div className="bg-slate-900/50 border-t border-slate-700">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-800">
                <th className="px-6 py-2 text-left">{t('table.transactionDate')}</th>
                <th className="px-6 py-2 text-right">{t('table.transactionAmount')}</th>
                {investmentType === 'VariableIncome' && (
                  <>
                    <th className="px-6 py-2 text-right">{t('table.shares')}</th>
                    <th className="px-6 py-2 text-right">{t('table.unitPrice')}</th>
                  </>
                )}
                <th className="px-6 py-2 text-center">{t('table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, idx) => (
                <tr key={tx.id} className={`border-b border-slate-800/40 ${idx % 2 === 0 ? '' : 'bg-slate-900/20'}`}>
                  <td className="px-6 py-2.5 text-slate-400">
                    {dt(tx.purchaseDate)}
                  </td>
                  <td className="px-6 py-2.5 text-right text-white font-medium tabular">
                    {brl(tx.amount)}
                  </td>
                  {investmentType === 'VariableIncome' && (
                    <>
                      <td className="px-6 py-2.5 text-right text-slate-400 tabular">
                        {tx.shares ? num(tx.shares) : '—'}
                      </td>
                      <td className="px-6 py-2.5 text-right text-slate-400 tabular">
                        {tx.unitPrice ? brl(tx.unitPrice) : '—'}
                      </td>
                    </>
                  )}
                  <td className="px-6 py-2.5 text-center">
                    <span className="text-slate-600 text-xs">
                      {t('table.viewOnly')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </td>
    </tr>
  )
}

export function InvestmentsTable({ investments = [], loading, onRefresh, onEdit }) {
  const { t } = useTranslation()
  const [filter,  setFilter]  = useState('All')
  const [search,   setSearch]   = useState('')
  const [toDelete, setToDelete] = useState(null)
  const [expandedRows, setExpandedRows] = useState(new Set())
  const [addTransactionFor, setAddTransactionFor] = useState(null)

  const FILTERS = [
    { id: 'All', label: t('table.allTypes') },
    { id: 'FixedIncome', label: t('table.fixedIncome') },
    { id: 'VariableIncome', label: t('table.variableIncome') }
  ]

  const filtered = investments.filter(inv => {
    const matchFilter =
      filter === 'All' ||
      inv.investmentType === filter
    const q = search.toLowerCase()
    const matchSearch =
      !search ||
      inv.name.toLowerCase().includes(q) ||
      inv.institution.toLowerCase().includes(q) ||
      (inv.ticker ?? '').toLowerCase().includes(q)
    return matchFilter && matchSearch
  })

  const totalAp = filtered.reduce((a, i) => a + i.investedAmount, 0)
  const totalAt = filtered.reduce((a, i) => a + i.currentValue, 0)
  const totalRd = totalAt - totalAp
  const totalPc = totalAp > 0 ? (totalRd / totalAp) * 100 : 0

  const handleDelete = async () => {
    await api.remove(toDelete.id)
    setToDelete(null)
    onRefresh()
  }

  const toggleExpand = (id) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  return (
    <>
      {toDelete && (
        <ConfirmDeleteModal
          inv={toDelete}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)} />
      )}

      <section className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden">
        {/* Toolbar */}
        <div className="px-5 py-4 border-b border-slate-800 flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-1 bg-slate-800/60 rounded-xl p-1">
            {FILTERS.map(f => (
              <button key={f.id} onClick={() => setFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                  ${filter === f.id ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}>
                {f.label}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder={t('table.search')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700
              text-xs text-white placeholder-slate-500
              focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/25
              transition-all w-48" />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3 text-center w-10"></th>
                <th className="px-4 py-3 text-left">{t('table.asset')}</th>
                <th className="px-4 py-3 text-center hidden sm:table-cell">{t('table.type')}</th>
                <th className="px-4 py-3 text-right">{t('table.invested')}</th>
                <th className="px-4 py-3 text-right">{t('table.current')}</th>
                <th className="px-4 py-3 text-right hidden md:table-cell">{t('table.return')}</th>
                <th className="px-4 py-3 text-right">%</th>
                <th className="px-4 py-3 text-center hidden lg:table-cell">Ticker</th>
                <th className="px-4 py-3 text-center hidden xl:table-cell">Data</th>
                <th className="px-4 py-3 text-center">{t('table.actions')}</th>
              </tr>
            </thead>

            <tbody>
              {loading && investments.length === 0
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-slate-800/60">
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j} className="px-4 py-3.5">
                          <Skeleton className="h-4 w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                : filtered.length === 0
                ? (
                  <tr>
                    <td colSpan="10" className="px-4 py-16 text-center text-slate-500 text-xs">
                      {search ? t('table.empty') : t('table.empty')}
                    </td>
                  </tr>
                )
                : filtered.map((inv, idx) => {
                  const pos = inv.investedAmount >= 0
                  const isExpanded = expandedRows.has(inv.id)
                  const hasTransactions = inv.transactions && inv.transactions.length > 0
                  const isVariableIncome = inv.investmentType === 'VariableIncome'
                  
                  return (
                    <>{/* Use React Fragment to return multiple rows */}
                      <tr key={`row-${inv.id}`}
                        className={`border-b border-slate-800/60 transition-colors hover:bg-slate-800/30
                          ${idx % 2 === 0 ? '' : 'bg-slate-900/20'}`}>
                        <td className="px-2 py-3.5 text-center">
                          {hasTransactions && (
                            <button
                              onClick={() => toggleExpand(inv.id)}
                              className="text-slate-500 hover:text-sky-400 transition-colors p-1"
                              title={isExpanded ? t('table.collapse') : t('table.expand')}
                            >
                              <svg 
                                className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-white leading-tight">{inv.name}</div>
                          <div className="text-slate-500 mt-0.5">{inv.institution}</div>
                        </td>
                        <td className="px-4 py-3.5 text-center hidden sm:table-cell">
                          <TypeBadge type={inv.investmentType}
                            typeName={inv.type} category={inv.category} />
                        </td>
                        <td className="px-4 py-3.5 text-right text-slate-400 tabular">
                          {brl(inv.investedAmount)}
                          {isVariableIncome && inv.averagePrice && (
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              {t('table.avgPrice')}: {brl(inv.averagePrice)}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right text-white font-semibold tabular">
                          {brl(inv.currentValue)}
                        </td>
                        <td className={`px-4 py-3.5 text-right font-semibold tabular hidden md:table-cell
                          ${pos ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {pos ? '+' : ''}{brl(inv.return)}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <ReturnBadge value={inv.return} percentage={inv.returnPercentage} />
                        </td>
                        <td className="px-4 py-3.5 text-center text-slate-500 hidden lg:table-cell">
                          {inv.ticker ?? '—'}
                        </td>
                        <td className="px-4 py-3.5 text-center text-slate-500 hidden xl:table-cell">
                          {dt(inv.maturityDate)}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <button onClick={() => setAddTransactionFor(inv)}
                            className="text-slate-600 hover:text-emerald-400 transition-colors p-1
                              rounded-lg hover:bg-emerald-500/10 mr-1"
                            title={t('table.addTransaction')}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                          <button onClick={() => onEdit(inv)}
                            className="text-slate-600 hover:text-sky-400 transition-colors p-1
                              rounded-lg hover:bg-sky-500/10 mr-1">
                            <Icon.Edit />
                          </button>
                          <button onClick={() => setToDelete(inv)}
                            className="text-slate-600 hover:text-rose-400 transition-colors p-1
                              rounded-lg hover:bg-rose-500/10">
                            <Icon.Trash />
                          </button>
                        </td>
                      </tr>
                      {isExpanded && hasTransactions && (
                        <TransactionSubTable
                          key={`sub-${inv.id}`}
                          transactions={inv.transactions}
                          investmentType={inv.investmentType}
                        />
                      )}
                    </>
                  )
                })
              }
            </tbody>

            {/* Totals */}
            {filtered.length > 0 && (
              <tfoot>
                <tr className="border-t border-slate-700 bg-slate-800/30
                  text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3" colSpan="2">
                    Total ({filtered.length})
                  </td>
                  <td className="px-4 py-3 text-right text-white tabular">{brl(totalAp)}</td>
                  <td className="px-4 py-3 text-right text-white font-bold tabular">{brl(totalAt)}</td>
                  <td className={`px-4 py-3 text-right font-bold tabular hidden md:table-cell
                    ${totalRd >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {totalRd >= 0 ? '+' : ''}{brl(totalRd)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-bold ${totalPc >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {pct(totalPc)}
                    </span>
                  </td>
                  <td colSpan="3" />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </section>

      {addTransactionFor && (
        <AddTransactionModal
          investment={addTransactionFor}
          onClose={() => setAddTransactionFor(null)}
          onSuccess={() => {
            setAddTransactionFor(null)
            onRefresh()
          }}
        />
      )}
    </>
  )
}
