import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '../hooks/useInvestments.js'

export function AddTransactionModal({ investment, onClose, onSuccess }) {
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
      await api.createTransaction(investment.id, body)
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
            {t('transactionModal.title')}
          </h2>
          <button onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Investment Info */}
        <div className="bg-slate-800/50 rounded-xl p-3 mb-5">
          <div className="text-xs text-slate-500 mb-1">{t('transactionModal.asset')}</div>
          <div className="text-white font-semibold">{investment.name}</div>
          <div className="text-slate-400 text-sm">{investment.institution}</div>
          {isVariableIncome && investment.ticker && (
            <div className="text-sky-400 text-sm mt-1">{investment.ticker}</div>
          )}
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
                defaultValue={new Date().toISOString().split('T')[0]}
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