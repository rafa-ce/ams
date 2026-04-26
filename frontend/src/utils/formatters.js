export const brl = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v ?? 0)

export const pct = (v) => {
  const val = v ?? 0
  return `${val >= 0 ? '+' : ''}${val.toFixed(2)}%`
}

export const dt = (d) =>
  d ? new Date(d).toLocaleDateString('pt-BR') : '—'

export const num = (v, decimais = 2) =>
  v != null
    ? new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: decimais,
        maximumFractionDigits: decimais,
      }).format(v)
    : '—'
