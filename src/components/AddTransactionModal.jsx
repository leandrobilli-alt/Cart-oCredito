import { useState, useMemo } from 'react'
import { X, CreditCard, Layers } from 'lucide-react'
import { useApp, useCategories } from '../context/AppContext'
import { format } from 'date-fns'

let nextId = Date.now()

const PT_MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]
const YEARS = [2024, 2025, 2026, 2027, 2028]

function makeInvoiceId(month, year) {
  return `inv-${year}-${String(month).padStart(2, '0')}`
}

function makeInvoicePayload(month, year, settings) {
  const monthStr = String(month).padStart(2, '0')
  const monthKey = `${year}-${monthStr}`
  const close = `${monthKey}-${String(settings.closeDay).padStart(2, '0')}`
  const nextMon = month === 12 ? 1 : month + 1
  const nextYear = month === 12 ? year + 1 : year
  const due = `${nextYear}-${String(nextMon).padStart(2, '0')}-${String(settings.dueDay).padStart(2, '0')}`
  return {
    id: makeInvoiceId(month, year),
    month: monthKey,
    label: `${PT_MONTHS[month - 1]} ${year}`,
    closeDate: close,
    dueDate: due,
    totalAmount: 0,
    totalPurchases: 0,
    creditLimit: settings.creditLimit,
    status: 'open',
  }
}

// Avança N meses a partir de (month, year)
function addMonths(month, year, n) {
  const total = (month - 1) + n
  return { month: (total % 12) + 1, year: year + Math.floor(total / 12) }
}

export default function AddTransactionModal({ onClose }) {
  const { dispatch, state } = useApp()
  const { categories } = useCategories()
  const now = new Date()

  const [mode, setMode] = useState('single') // 'single' | 'installment'
  const [form, setForm] = useState({
    date: format(now, 'yyyy-MM-dd'),
    description: '',
    amount: '',
    amountType: 'per',   // 'per' = valor da parcela | 'total' = valor total
    category: 'outros',
    installments: 2,
    invoiceMonth: now.getMonth() + 1,
    invoiceYear: now.getFullYear(),
  })

  function set(key, val) { setForm(f => ({ ...f, [key]: val })) }

  const parsedAmount = parseFloat(String(form.amount).replace(',', '.')) || 0

  const perInstallment = useMemo(() => {
    if (!parsedAmount) return 0
    return mode === 'installment' && form.amountType === 'total'
      ? parsedAmount / form.installments
      : parsedAmount
  }, [parsedAmount, mode, form.amountType, form.installments])

  const totalValue = useMemo(() =>
    mode === 'installment' ? perInstallment * form.installments : parsedAmount,
    [perInstallment, form.installments, parsedAmount, mode]
  )

  // Preview das faturas que serão geradas
  const installmentPreview = useMemo(() => {
    if (mode !== 'installment' || !form.installments) return []
    return Array.from({ length: form.installments }, (_, i) => {
      const { month, year } = addMonths(form.invoiceMonth, form.invoiceYear, i)
      return { month, year, label: `${PT_MONTHS[month - 1].slice(0, 3)}/${year}` }
    })
  }, [mode, form.installments, form.invoiceMonth, form.invoiceYear])

  function fmt(v) {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  function save(e) {
    e.preventDefault()
    if (!form.description || !parsedAmount) return

    if (mode === 'single') {
      // Lançamento único
      const invoiceId = makeInvoiceId(form.invoiceMonth, form.invoiceYear)
      const exists = state.invoices.some(i => i.id === invoiceId)
      if (!exists) {
        dispatch({ type: 'ADD_INVOICE', payload: makeInvoicePayload(form.invoiceMonth, form.invoiceYear, state.settings) })
      }
      dispatch({
        type: 'ADD_TRANSACTION',
        payload: {
          id: String(nextId++),
          date: form.date,
          description: form.description,
          amount: parsedAmount,
          category: form.category,
          invoiceId,
        },
      })
    } else {
      // Parcelamento: gera todas as parcelas de uma vez
      const newInvoices = []
      const newTransactions = []

      for (let i = 0; i < form.installments; i++) {
        const { month, year } = addMonths(form.invoiceMonth, form.invoiceYear, i)
        const invoiceId = makeInvoiceId(month, year)
        newInvoices.push(makeInvoicePayload(month, year, state.settings))
        newTransactions.push({
          id: String(nextId++),
          date: form.date,
          description: form.description,
          amount: parseFloat(perInstallment.toFixed(2)),
          category: form.category,
          installment: `${i + 1}/${form.installments}`,
          invoiceId,
        })
      }

      dispatch({ type: 'ADD_INSTALLMENTS', payload: { newInvoices, newTransactions } })
    }

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-base font-semibold text-gray-900">Novo lançamento</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <form onSubmit={save} className="overflow-y-auto flex-1">
          <div className="p-5 space-y-4">

            {/* Modo: único ou parcelado */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMode('single')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  mode === 'single'
                    ? 'bg-nu-purple text-white border-nu-purple'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <CreditCard size={15} /> Único
              </button>
              <button
                type="button"
                onClick={() => setMode('installment')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  mode === 'installment'
                    ? 'bg-nu-purple text-white border-nu-purple'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <Layers size={15} /> Parcelado
              </button>
            </div>

            {/* Data + Valor */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Data da compra</label>
                <input
                  type="date"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nu-purple/30"
                  value={form.date}
                  onChange={e => set('date', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">
                  {mode === 'installment' && form.amountType === 'total'
                    ? 'Valor total (R$)'
                    : mode === 'installment'
                    ? 'Valor da parcela (R$)'
                    : 'Valor (R$)'}
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0,00"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nu-purple/30"
                  value={form.amount}
                  onChange={e => set('amount', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Opções extras do parcelamento */}
            {mode === 'installment' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Número de parcelas</label>
                  <input
                    type="number"
                    min="2"
                    max="48"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nu-purple/30"
                    value={form.installments}
                    onChange={e => set('installments', Math.max(2, parseInt(e.target.value) || 2))}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">O valor informado é</label>
                  <select
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nu-purple/30"
                    value={form.amountType}
                    onChange={e => set('amountType', e.target.value)}
                  >
                    <option value="per">Por parcela</option>
                    <option value="total">Total da compra</option>
                  </select>
                </div>
              </div>
            )}

            {/* Descrição */}
            <div>
              <label className="text-xs text-gray-500 block mb-1">Descrição</label>
              <input
                type="text"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nu-purple/30"
                value={form.description}
                onChange={e => set('description', e.target.value)}
                required
              />
            </div>

            {/* Fatura inicial */}
            <div>
              <label className="text-xs text-gray-500 block mb-1">
                {mode === 'installment' ? 'Fatura da 1ª parcela' : 'Fatura'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nu-purple/30"
                  value={form.invoiceMonth}
                  onChange={e => set('invoiceMonth', Number(e.target.value))}
                >
                  {PT_MONTHS.map((name, i) => (
                    <option key={i + 1} value={i + 1}>{name}</option>
                  ))}
                </select>
                <select
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nu-purple/30"
                  value={form.invoiceYear}
                  onChange={e => set('invoiceYear', Number(e.target.value))}
                >
                  {YEARS.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Preview do parcelamento */}
            {mode === 'installment' && parsedAmount > 0 && (
              <div className="bg-nu-light rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-nu-dark font-medium">
                    {form.installments}x de {fmt(perInstallment)}
                  </span>
                  <span className="text-nu-dark font-bold">= {fmt(totalValue)}</span>
                </div>
                <div className="text-xs text-nu-purple">
                  {installmentPreview[0]?.label} → {installmentPreview[installmentPreview.length - 1]?.label}
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {installmentPreview.map((p, i) => (
                    <span key={i} className="text-xs bg-white text-nu-purple px-2 py-0.5 rounded-full border border-nu-purple/20">
                      {i + 1}/{form.installments} · {p.label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Categoria */}
            <div>
              <label className="text-xs text-gray-500 block mb-2">Categoria</label>
              <div className="grid grid-cols-2 gap-1.5">
                {categories.map(cat => (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => set('category', cat.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                      form.category === cat.id
                        ? 'border-nu-purple bg-nu-light text-nu-purple font-medium'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span className="truncate text-xs">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="px-5 pb-5 flex-shrink-0">
            <button type="submit" className="btn-primary w-full py-3">
              {mode === 'installment'
                ? `Lançar ${form.installments} parcelas`
                : 'Adicionar lançamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
