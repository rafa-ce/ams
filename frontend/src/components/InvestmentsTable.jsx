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

function EditTransactionModal({ investment, transaction, onClose, onSuccess }) {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const isVariableIncome = investment.investmentType === 'VariableIncome'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.target)
    const amount = parseFloat(formData.get('amount'))
    const purchaseDate = new Date(formData.get('purchaseDate')).toISOString()
    
    let body = {
      amount,
      purchaseDate,
    }

    if (isVariableIncome) {
      const shares = parseFloat(formData.get('shares'))
      const unitPrice = amount / shares
      body.shares = shares
      body.unitPrice = unitPrice
    }

    try {
      await api.updateTransaction(investment.id, transaction.id, body)
      onSuccess()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="bg-[#111827] border border-slate-700 rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-white">
            {t('transactionModal.editTitle')}
          </h2>
          <button onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 mb-4">
            <p className="text-rose-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                {t('transactionModal.amount')}
              </label>
              <input
                type="number"
                name="amount"
                step="0.01"
                min="0"
                required
                defaultValue={transaction.amount}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700
                  text-white text-sm placeholder-slate-500
                  focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/25"
                placeholder="0,00"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                {t('transactionModal.date')}
              </label>
              <input
                type="date"
                name="purchaseDate"
                required
                defaultValue={new Date(transaction.purchaseDate).toISOString().split('T')[0]}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700
                  text-white text-sm
                  focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/25"
              />
            </div>

            {isVariableIncome && (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  {t('transactionModal.shares')}
                </label>
                <input
                  type="number"
                  name="shares"
                  step="0.000001"
                  min="0"
                  required
                  defaultValue={transaction.shares || ''}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700
                    text-white text-sm placeholder-slate-500
                    focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/25"
                  placeholder="0"
                />
                <p className="text-xs text-slate-500 mt-1">
                  {t('transactionModal.unitPriceHint')}
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400
                hover:bg-slate-800 text-sm font-semibold transition-all">
              {t('addModal.cancel')}
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400
                text-white text-sm font-bold transition-all disabled:opacity-50">
              {loading ? t('addModal.saving') : t('addModal.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Sub-table component for transactions
function TransactionSubTable({ transactions, investmentType, investmentId, onRefresh }) {
  const { t } = useTranslation()
  const [deletingId, setDeletingId] = useState(null)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [viewingTransaction, setViewingTransaction] = useState(null)

  const handleDelete = async (transactionId) => {
    setDeletingId(transactionId)
    try {
      await api.removeTransaction(investmentId, transactionId)
      onRefresh()
    } catch (error) {
      console.error('Failed to delete transaction:', error)
      // Could show error message here
    } finally {
      setDeletingId(null)
    }
  }

  const handleView = (transaction) => {
    setViewingTransaction(transaction)
  }

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction)
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
    <>
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
                    <td className="px-6 py-2.5 text-center space-x-1">
                      <button
                        onClick={() => handleView(tx)}
                        className="text-slate-500 hover:text-sky-400 transition-colors p-1 rounded"
                        title={t('table.view')}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleEdit(tx)}
                        className="text-slate-500 hover:text-emerald-400 transition-colors p-1 rounded"
                        title={t('table.edit')}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeletingId(tx.id)}
                        disabled={deletingId === tx.id}
                        className="text-slate-500 hover:text-rose-400 transition-colors p-1 rounded disabled:opacity-50"
                        title={t('table.delete')}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </td>
      </tr>

      {/* View Transaction Modal */}
      {viewingTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
             style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="bg-[#111827] border border-slate-700 rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">
                {t('transactionModal.viewTitle')}
              </h2>
              <button onClick={() => setViewingTransaction(null)}
                className="text-slate-500 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-slate-500">{t('transactionModal.date')}</div>
                <div className="text-white">{dt(viewingTransaction.purchaseDate)}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">{t('transactionModal.amount')}</div>
                <div className="text-white font-semibold">{brl(viewingTransaction.amount)}</div>
              </div>
              {investmentType === 'VariableIncome' && (
                <>
                  <div>
                    <div className="text-xs text-slate-500">{t('transactionModal.shares')}</div>
                    <div className="text-white">{viewingTransaction.shares ? num(viewingTransaction.shares) : '—'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">{t('transactionModal.unitPrice')}</div>
                    <div className="text-white">{viewingTransaction.unitPrice ? brl(viewingTransaction.unitPrice) : '—'}</div>
                  </div>
                </>
              )}
            </div>
            <button onClick={() => setViewingTransaction(null)}
              className="w-full mt-6 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold transition-all">
              {t('addModal.close')}
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
             style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="bg-[#111827] border border-slate-700 rounded-2xl p-6 w-full max-w-sm">
            <p className="text-white font-semibold mb-1">{t('table.deleteTransactionConfirm')}</p>
            <p className="text-slate-400 text-sm mb-5">
              {t('table.deleteTransactionMessage')}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeletingId(null)}
                className="flex-1 py-2 rounded-xl border border-slate-700 text-slate-400
                  hover:bg-slate-800 text-sm font-semibold transition-all">
                {t('addModal.cancel')}
              </button>
              <button onClick={() => handleDelete(deletingId)} disabled={deletingId === null}
                className="flex-1 py-2 rounded-xl bg-rose-500 hover:bg-rose-400
                  text-white text-sm font-bold transition-all disabled:opacity-50">
                {t('table.actions')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Transaction Modal */}
      {editingTransaction && (
        <EditTransactionModal
          investment={{ id: investmentId, investmentType }}
          transaction={editingTransaction}
          onClose={() => setEditingTransaction(null)}
          onSuccess={() => {
            setEditingTransaction(null)
            onRefresh()
          }}
        />
      )}
    </>
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
                          investmentId={inv.id}
                          onRefresh={onRefresh}
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
