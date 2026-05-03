import { useState, useEffect } from 'react'
import { Modal, Field, Input, Select, Icon } from './ui.jsx'
import { api } from '../hooks/useInvestments.js'
import { useTranslation } from 'react-i18next'

const CATEGORY_OPTIONS = [
  { label: 'CDB', investmentType: 'FixedIncome' },
  { label: 'Treasury Selic', investmentType: 'FixedIncome' },
  { label: 'Treasury IPCA+', investmentType: 'FixedIncome' },
  { label: 'Treasury Prefixed', investmentType: 'FixedIncome' },
  { label: 'LCI', investmentType: 'FixedIncome' },
  { label: 'LCA', investmentType: 'FixedIncome' },
  { label: 'CRI', investmentType: 'FixedIncome' },
  { label: 'CRA', investmentType: 'FixedIncome' },
  { label: 'Debenture', investmentType: 'FixedIncome' },
  { label: 'Stocks', investmentType: 'VariableIncome' },
  { label: 'REITs', investmentType: 'VariableIncome' },
  { label: 'ETFs', investmentType: 'VariableIncome' },
  { label: 'BDRs', investmentType: 'VariableIncome' },
  { label: 'Crypto', investmentType: 'VariableIncome' },
]
const INDEXERS_FI = ['CDI', 'IPCA', 'SELIC', 'Prefixed']

function today() {
  return new Date().toISOString().split('T')[0]
}

function formatDateForInput(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toISOString().split('T')[0];
}

const normalizeText = (text) => text?.trim().toLowerCase() || ''
const findCategoryOption = (value) => CATEGORY_OPTIONS.find(option => normalizeText(option.label) === normalizeText(value))

export function AddModal({ onClose, onSuccess, initialData }) {
  const { t } = useTranslation()
  const isEdit = !!initialData
  
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')
  const initialCategory = initialData?.category || initialData?.type || 'Stocks'
  const [categoryInput, setCategoryInput] = useState(initialCategory)
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false)

  const [form, setForm] = useState({
    name: initialData?.name || '', 
    institution: initialData?.institution || '', 
    investmentDate: initialData ? formatDateForInput(initialData.investmentDate) : today(), 
    notes: initialData?.notes || '',
    // Fixed Income specific
    investedAmount: initialData?.investedAmount || '', 
    currentValue: initialData?.currentValue || '',
    maturityDate: initialData?.maturityDate ? formatDateForInput(initialData.maturityDate) : '', 
    indexer: initialData?.indexer || 'CDI', 
    contractedRate: initialData?.contractedRate || '', 
    indexerPercentage: initialData?.indexerPercentage || '',
    // Variable Income specific
    investedAmountVI: initialData?.investedAmount || '', 
    shares: initialData?.shares || '', 
    ticker: initialData?.ticker || '', 
    dividendsReceived: initialData?.dividendsReceived || '0',
  })
  const [currentValueTouched, setCurrentValueTouched] = useState(false)

  const set = (k) => (e) => {
    if (k === 'currentValue') setCurrentValueTouched(true)
    setForm(f => ({ ...f, [k]: e.target.value }))
  }

  const selectedCategory = findCategoryOption(form.category) || findCategoryOption(categoryInput) || CATEGORY_OPTIONS[0]
  const isFixedIncome = selectedCategory.investmentType === 'FixedIncome'
  const filteredCategories = CATEGORY_OPTIONS.filter(option =>
    normalizeText(t(`categories.${option.label}`, option.label)).includes(normalizeText(categoryInput))
  )

  const investedAmount = isFixedIncome ? form.investedAmount : form.investedAmountVI
  const calculatedUnitPrice = form.shares && parseFloat(form.shares) > 0 && investedAmount && parseFloat(investedAmount) > 0
    ? (parseFloat(investedAmount) / parseFloat(form.shares)).toFixed(6)
    : '0.000000'

  useEffect(() => {
    if (isEdit || currentValueTouched) return

    if (isFixedIncome) {
      const invested = parseFloat(form.investedAmount)
      if (!Number.isNaN(invested)) {
        const value = invested.toFixed(2)
        if (form.currentValue !== value) setForm(f => ({ ...f, currentValue: value }))
      }
      return
    }

    const invested = parseFloat(form.investedAmountVI)
    if (!Number.isNaN(invested)) {
      const value = invested.toFixed(2)
      if (form.currentValue !== value) setForm(f => ({ ...f, currentValue: value }))
    }
  }, [isEdit, isFixedIncome, currentValueTouched, form.investedAmount, form.investedAmountVI, form.currentValue])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const selected = findCategoryOption(form.category) || findCategoryOption(categoryInput)
      if (!selected) {
        setError(t('addModal.selectValidCategory'))
        return
      }

      if (selected.investmentType === 'FixedIncome') {
        const payload = {
          name:               form.name,
          institution:        form.institution,
          investedAmount:      parseFloat(form.investedAmount),
          investmentDate:      form.investmentDate,
          type:               selected.label,
          currentValue:         parseFloat(form.currentValue) || parseFloat(form.investedAmount),
          indexer:          form.indexer,
          contractedRate:     parseFloat(form.contractedRate) || 0,
          indexerPercentage:  form.indexerPercentage ? parseFloat(form.indexerPercentage) : null,
          maturityDate:     form.maturityDate || null,
          notes:        form.notes,
        };
        if (isEdit) await api.updateFixedIncome(initialData.id, payload);
        else await api.createFixedIncome(payload);
      } else {
        const investedAmount = parseFloat(form.investedAmountVI);
        const shares = parseFloat(form.shares);
        const currentValue = parseFloat(form.currentValue);
        const unitPrice = shares > 0 ? investedAmount / shares : 0;
        const currentPrice = !Number.isNaN(currentValue) && shares > 0
          ? currentValue / shares
          : unitPrice;

        const payload = {
          name:               form.name,
          institution:        form.institution,
          [isEdit ? 'currentPrice' : 'unitPrice']: currentPrice,
          shares:             shares,
          investmentDate:      form.investmentDate,
          category:          selected.label,
          ticker:             form.ticker,
          dividendsReceived:  parseFloat(form.dividendsReceived) || 0,
          notes:               form.notes,
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
    ? (isFixedIncome ? t('addModal.editFixedIncome', 'Edit Fixed Income') : t('addModal.editVariableIncome', 'Edit Variable Income'))
    : (isFixedIncome ? t('addModal.titleFixedIncome') : t('addModal.titleVariableIncome'));

  return (
    <Modal title={modalTitle} onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-4">

        {/* Category autocomplete */}
        <Field label={t('addModal.category')}>
          <div className="relative">
            <Input
              value={categoryInput}
              onChange={(e) => {
                setCategoryInput(e.target.value)
                setCategoryMenuOpen(true)
              }}
              onFocus={() => setCategoryMenuOpen(true)}
              onBlur={() => setTimeout(() => setCategoryMenuOpen(false), 120)}
              placeholder={t('addModal.searchCategory')}
              autoComplete="off"
            />
            {categoryMenuOpen && filteredCategories.length > 0 && (
              <div className="absolute z-20 mt-1 w-full max-h-52 overflow-auto rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
                {filteredCategories.map(option => (
                  <button key={option.label} type="button"
                    onMouseDown={(e) => {
                      e.preventDefault()
                      setCategoryInput(option.label)
                      setForm(f => ({ ...f, category: option.label }))
                      setCategoryMenuOpen(false)
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-white transition-colors hover:bg-slate-800">
                    {t(`categories.${option.label}`, option.label)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </Field>

        {/* Common Fields */}
        <div className="border-t border-slate-700 pt-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">{t('addModal.commonInfo')}</h3>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t('addModal.name')}>
              <Input value={form.name} onChange={set('name')} required />
            </Field>
            <Field label={t('addModal.institution')}>
              <Input value={form.institution} onChange={set('institution')} required />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t('addModal.investmentDate')}>
              <Input type="date" value={form.investmentDate} onChange={set('investmentDate')} required />
            </Field>
            {isFixedIncome && (
              <Field label={t('addModal.maturityDate')}>
                <Input type="date" value={form.maturityDate} onChange={set('maturityDate')} />
              </Field>
            )}
          </div>
        </div>

        {/* Type-Specific Fields */}
        <div className="border-t border-slate-700 pt-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">
            {isFixedIncome ? t('addModal.fixedIncomeDetails') : t('addModal.variableIncomeDetails')}
          </h3>
          
          {isFixedIncome ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Field label={t('addModal.investedAmount')}>
                  <Input type="number" step="0.01" min="0" value={form.investedAmount}
                    onChange={set('investedAmount')} placeholder="0.00" required />
                </Field>
                <Field label={t('addModal.currentValue')}>
                  <Input type="number" step="0.01" min="0" value={form.currentValue}
                    onChange={set('currentValue')} placeholder="0.00" />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label={t('addModal.indexer')}>
                  <Select value={form.indexer} onChange={set('indexer')}>
                    {INDEXERS_FI.map(i => <option key={i}>{i}</option>)}
                  </Select>
                </Field>
                <Field label={t('addModal.rate')}>
                  <Input type="number" step="0.01" value={form.contractedRate}
                    onChange={set('contractedRate')} placeholder="Ex: 12.5" />
                </Field>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <Field label={t('addModal.indexerPercentage')}>
                  <Input type="number" step="0.01" value={form.indexerPercentage}
                    onChange={set('indexerPercentage')} placeholder="Ex: 110" />
                </Field>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Field label={t('addModal.ticker')}>
                  <Input value={form.ticker} onChange={set('ticker')}
                    placeholder="Ex: PETR4" style={{ textTransform: 'uppercase' }} required />
                </Field>
                <Field label={t('addModal.investedAmount')}>
                  <Input type="number" step="0.01" min="0" value={form.investedAmountVI}
                    onChange={set('investedAmountVI')} placeholder="0.00" required />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label={t('addModal.currentValue')}>
                  <Input type="number" step="0.01" min="0" value={form.currentValue}
                    onChange={set('currentValue')} placeholder="0.00" />
                </Field>
                <Field label={t('addModal.dividendsReceived')}>
                  <Input type="number" step="0.01" min="0" value={form.dividendsReceived}
                    onChange={set('dividendsReceived')} placeholder="0.00" />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label={t('addModal.quantityLabel')}>
                  <Input type="number" step="0.000001" min="0" value={form.shares}
                    onChange={set('shares')} placeholder="0" required disabled={isEdit} />
                </Field>
                <Field label={t('addModal.unitPriceLabel')}>
                  <Input type="number" step="0.000001" value={calculatedUnitPrice} readOnly placeholder="0.000000" />
                </Field>
              </div>
              <div className="text-xs text-slate-500 mt-2">
                {t('addModal.unitPriceCalculation')}
              </div>
            </>
          )}
        </div>

        <Field label={t('addModal.notes')}>
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
              ${isFixedIncome
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
