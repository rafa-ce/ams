import { useState, useEffect } from 'react'
import { Modal, Field, Input, Select, Icon } from './ui.jsx'
import { api } from '../hooks/useInvestments.js'
import { useTranslation } from 'react-i18next'

const MODALITIES_FI = ['CDB', 'Treasury Selic', 'Treasury IPCA+', 'Treasury Prefixed', 'LCI', 'LCA', 'CRI', 'CRA', 'Debenture']
const INDEXERS_FI = ['CDI', 'IPCA', 'SELIC', 'Prefixed']
const CATEGORIES_VI  = ['Stocks', 'REITs', 'ETFs', 'BDRs', 'Crypto']

function today() {
  return new Date().toISOString().split('T')[0]
}

function formatDateForInput(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toISOString().split('T')[0];
}

export function AddModal({ onClose, onSuccess, initialData }) {
  const { t } = useTranslation()
  const isEdit = !!initialData
  
  const [type, setType]       = useState(initialData?.investmentType || 'FixedIncome')
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')

  const [form, setForm] = useState({
    name: initialData?.name || '', 
    institution: initialData?.institution || '', 
    investedAmount: initialData?.investedAmount || '', 
    currentValue: initialData?.currentValue || '',
    investmentDate: initialData ? formatDateForInput(initialData.investmentDate) : today(), 
    maturityDate: initialData?.maturityDate ? formatDateForInput(initialData.maturityDate) : '', 
    notes: initialData?.notes || '',
    type: initialData?.type || 'CDB', 
    indexer: initialData?.indexer || 'CDI', 
    contractedRate: initialData?.contractedRate || '', 
    indexerPercentage: initialData?.indexerPercentage || '',
    category: initialData?.category || 'Stocks', 
    ticker: initialData?.ticker || '', 
    currentPrice: initialData?.currentPrice || '', 
    shares: initialData?.shares || '', 
    dividendsReceived: initialData?.dividendsReceived || '0',
  })

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      if (type === 'FixedIncome') {
        const payload = {
          name:               form.name,
          institution:        form.institution,
          investedAmount:      parseFloat(form.investedAmount),
          currentValue:         parseFloat(form.currentValue) || parseFloat(form.investedAmount),
          investmentDate:      form.investmentDate,
          maturityDate:     form.maturityDate || null,
          type:         form.type,
          indexer:          form.indexer,
          contractedRate:     parseFloat(form.contractedRate) || 0,
          indexerPercentage:form.indexerPercentage ? parseFloat(form.indexerPercentage) : null,
          notes:        form.notes,
        };
        if (isEdit) await api.updateFixedIncome(initialData.id, payload);
        else await api.createFixedIncome(payload);
      } else {
        const payload = {
          name:               form.name,
          institution:        form.institution,
          investedAmount:      parseFloat(form.investedAmount),
          currentPrice:       parseFloat(form.currentPrice),
          shares:         parseFloat(form.shares),
          investmentDate:      form.investmentDate,
          category:          form.category,
          ticker:             form.ticker,
          dividendsReceived:parseFloat(form.dividendsReceived) || 0,
          notes:        form.notes,
        };
        if (isEdit) await api.updateVariableIncome(initialData.id, payload);
        else await api.createVariableIncome(payload);
      }
      onSuccess()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const modalTitle = isEdit 
    ? (type === 'FixedIncome' ? t('addModal.editFixedIncome', 'Edit Fixed Income') : t('addModal.editVariableIncome', 'Edit Variable Income'))
    : (type === 'FixedIncome' ? t('addModal.titleFixedIncome') : t('addModal.titleVariableIncome'));

  return (
    <Modal title={modalTitle} onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-4">

        {/* Type */}
        <div className="flex gap-2 p-1 bg-slate-800/60 rounded-xl">
          {['FixedIncome', 'VariableIncome'].map(tType => (
            <button key={tType} type="button"
              disabled={isEdit}
              onClick={() => setType(tType)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all
                ${type === tType
                  ? tType === 'FixedIncome' ? 'bg-sky-500 text-white' : 'bg-violet-500 text-white'
                  : 'text-slate-400 hover:text-white'} 
                ${isEdit ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {tType === 'FixedIncome' ? t('addModal.fixedIncome') : t('addModal.variableIncome')}
            </button>
          ))}
        </div>

        {/* Common fields */}
        <div className="grid grid-cols-2 gap-3">
          <Field label={t('addModal.name')}>
            <Input value={form.name} onChange={set('name')} required />
          </Field>
          <Field label={t('addModal.institution')}>
            <Input value={form.institution} onChange={set('institution')} required />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label={t('addModal.investedAmount')}>
            <Input type="number" step="0.01" min="0" value={form.investedAmount}
              onChange={set('investedAmount')} placeholder="0.00" required />
          </Field>
          {type === 'FixedIncome' ? (
            <Field label={t('addModal.currentValue')}>
              <Input type="number" step="0.01" min="0" value={form.currentValue}
                onChange={set('currentValue')} placeholder="0.00" />
            </Field>
          ) : (
            <Field label={t('addModal.currentPrice')}>
              <Input type="number" step="0.000001" min="0" value={form.currentPrice}
                onChange={set('currentPrice')} placeholder="0.000000" required />
            </Field>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label={t('addModal.investmentDate')}>
            <Input type="date" value={form.investmentDate} onChange={set('investmentDate')} required />
          </Field>
          {type === 'FixedIncome' ? (
            <Field label="Vencimento / Maturity">
              <Input type="date" value={form.maturityDate} onChange={set('maturityDate')} />
            </Field>
          ) : (
            <Field label={t('addModal.shares')}>
              <Input type="number" step="0.000001" min="0" value={form.shares}
                onChange={set('shares')} placeholder="0" required />
            </Field>
          )}
        </div>

        {/* Specific fields */}
        {type === 'FixedIncome' ? (
          <div className="grid grid-cols-2 gap-3">
            <Field label={t('addModal.type')}>
              <Select value={form.type} onChange={set('type')}>
                {MODALITIES_FI.map(m => <option key={m}>{m}</option>)}
              </Select>
            </Field>
            <Field label="Indexer">
              <Select value={form.indexer} onChange={set('indexer')}>
                {INDEXERS_FI.map(i => <option key={i}>{i}</option>)}
              </Select>
            </Field>
            <Field label="Rate (% p.a.)">
              <Input type="number" step="0.01" value={form.contractedRate}
                onChange={set('contractedRate')} placeholder="Ex: 12.5" />
            </Field>
            <Field label="% of Indexer">
              <Input type="number" step="0.01" value={form.indexerPercentage}
                onChange={set('indexerPercentage')} placeholder="Ex: 110" />
            </Field>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <Field label={t('addModal.category')}>
              <Select value={form.category} onChange={set('category')}>
                {CATEGORIES_VI.map(c => <option key={c}>{c}</option>)}
              </Select>
            </Field>
            <Field label={t('addModal.ticker')}>
              <Input value={form.ticker} onChange={set('ticker')}
                placeholder="Ex: PETR4" style={{ textTransform: 'uppercase' }} required />
            </Field>
            <Field label="Dividends Received">
              <Input type="number" step="0.01" min="0" value={form.dividendsReceived}
                onChange={set('dividendsReceived')} placeholder="0.00" />
            </Field>
          </div>
        )}

        <Field label="Notes / Observações">
          <Input value={form.notes} onChange={set('notes')} placeholder="Optional" />
        </Field>

        {error && <p className="text-xs text-rose-400 bg-rose-500/10 px-3 py-2 rounded-lg">{error}</p>}

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose}
            className="flex-1 py-2 rounded-xl border border-slate-700 text-slate-400
              hover:bg-slate-800 text-sm font-semibold transition-all">
            {t('addModal.cancel')}
          </button>
          <button type="submit" disabled={saving}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all
              ${type === 'FixedIncome'
                ? 'bg-sky-500 hover:bg-sky-400 text-white'
                : 'bg-violet-500 hover:bg-violet-400 text-white'}
              disabled:opacity-50 disabled:cursor-not-allowed`}>
            {saving ? (isEdit ? t('addModal.updating', 'Updating...') : t('addModal.saving')) : (isEdit ? t('addModal.update', 'Update') : t('addModal.save'))}
          </button>
        </div>
      </form>
    </Modal>
  )
}
