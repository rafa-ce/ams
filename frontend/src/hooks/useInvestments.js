import { useState, useEffect, useCallback } from 'react'

const API_BASE = import.meta.env.VITE_API_URL ?? '/api'

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message ?? `HTTP ${res.status}`)
  }
  if (res.status === 204) return null
  return res.json()
}

export const api = {
  list:            ()       => apiFetch('/investments'),
  get:             (id)     => apiFetch(`/investments/${id}`),
  createFixedIncome:    (body)   => apiFetch('/investments/fixed-income',    { method: 'POST',  body: JSON.stringify(body) }),
  createVariableIncome:(body)   => apiFetch('/investments/variable-income', { method: 'POST',  body: JSON.stringify(body) }),
  updateFixedIncome:    (id, body) => apiFetch(`/investments/${id}/fixed-income`, { method: 'PUT', body: JSON.stringify(body) }),
  updateVariableIncome: (id, body) => apiFetch(`/investments/${id}/variable-income`, { method: 'PUT', body: JSON.stringify(body) }),
  updateValue:    (id, v)  => apiFetch(`/investments/${id}/value`,    { method: 'PATCH', body: JSON.stringify({ newValue: v }) }),
  updatePrice:  (id, v)  => apiFetch(`/investments/${id}/price`,  { method: 'PATCH', body: JSON.stringify({ newPrice: v }) }),
  registerDividend: (id, v)  => apiFetch(`/investments/${id}/dividends`,{ method: 'POST',  body: JSON.stringify({ amount: v }) }),
  remove:           (id)     => apiFetch(`/investments/${id}`,          { method: 'DELETE' }),
  // Transaction methods
  createTransaction:    (id, body) => apiFetch(`/investments/${id}/transactions`, { method: 'POST', body: JSON.stringify(body) }),
  updateTransaction: (id, transactionId, body) => apiFetch(`/investments/${id}/transactions/${transactionId}`, { method: 'PUT', body: JSON.stringify(body) }),
  removeTransaction:  (id, transactionId) => apiFetch(`/investments/${id}/transactions/${transactionId}`, { method: 'DELETE' }),
}

// ── Main hook ────────────────────────────────────────────────────────────
export function useInvestments() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const json = await api.list()
      setData(json)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return { data, loading, error, reload: load }
}
