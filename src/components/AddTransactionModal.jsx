import { useState, useMemo } from 'react'
import { X } from 'lucide-react'
import { CATEGORIES } from '../data/categories'
import { useApp } from '../context/AppContext'
import { format } from 'date-fns'

let nextId = Date.now()

const PT_MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

function buildMonthOptions() {
  const options = []
  const currentYear = new Date().getFullYear()
  // Gera anos anteriores, atual e próximo
  for (const year of [currentYear - 1, currentYear, currentYear + 1]) {
    for (let m = 0; m < 12; m++) {
      const month = String(m + 1).padStart(2, '0')
      options.push({
        id: `inv-${year}-${month}`,
        month: `${year}-${month}`,
        label: `${PT_MONTHS[m]} ${year}`,
      })
    }
  }
  return options
}

export default function AddTransactionModal({ onClose }) {
  const { dispatch, state } = useApp()

  // Mês atual como padrão da fatura
  const defaultMonth = format(new Date(), 'yyyy-MM')
  const defaultInvoiceId = `inv-${defaultMonth}`

  const [form, setForm] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    description: '',
    amount: '',
    category: 'outros',
    installment: '',
    invoiceId: defaultInvoiceId,
  })

  const monthOptions = useMemo(() => buildMonthOptions(), [])

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }))
  }

  function save(e) {
    e.preventDefault()
    if (!form.description || !form.amount) return

    // Cria a fatura automaticamente se ainda não existir
    const exists = state.invoices.some(i => i.id === form.invoiceId)
    if (!exists) {
      const opt = monthOptions.find(o => o.id === form.invoiceId)
      const [year, mon] = opt.month.split('-').map(Number)
      const close = `${opt.month}-${String(state.settings.closeDay).padStart(2, '0')}`
      const dueMonth = mon === 12
        ? `${year + 1}-01`
        : `${year}-${String(mon + 1).padStart(2, '0')}`
      const due = `${dueMonth}-${String(state.settings.dueDay).padStart(2, '0')}`

      dispatch({
        type: 'ADD_INVOICE',
        payload: {
          id: opt.id,
          month: opt.month,
          label: opt.label,
          closeDate: close,
          dueDate: due,
          totalAmount: 0,
          totalPurchases: 0,
          creditLimit: state.settings.creditLimit,
          status: 'open',
        },
      })
    }

    dispatch({
      type: 'ADD_TRANSACTION',
      payload: {
        id: String(nextId++),
        date: form.date,
        description: form.description,
        amount: parseFloat(form.amount.replace(',', '.')),
        category: form.category,
        installment: form.installment || undefined,
        invoiceId: form.invoiceId,
      },
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Novo lançamento</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <form onSubmit={save} className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Data</label>
              <input
                type="date"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nu-purple/30"
                value={form.date}
                onChange={e => set('date', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Valor (R$)</label>
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Parcela (ex: 1/12)</label>
              <input
                type="text"
                placeholder="opcional"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nu-purple/30"
                value={form.installment}
                onChange={e => set('installment', e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Fatura</label>
              <select
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nu-purple/30"
                value={form.invoiceId}
                onChange={e => set('invoiceId', e.target.value)}
              >
                {monthOptions.map(opt => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                    {state.invoices.some(i => i.id === opt.id) ? ' ✓' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-2">Categoria</label>
            <div className="grid grid-cols-2 gap-1.5 max-h-52 overflow-y-auto">
              {CATEGORIES.map(cat => (
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

          <button type="submit" className="btn-primary w-full mt-2">Adicionar lançamento</button>
        </form>
      </div>
    </div>
  )
}
