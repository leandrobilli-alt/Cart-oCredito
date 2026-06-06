import { useState } from 'react'
import { X } from 'lucide-react'
import { CATEGORIES } from '../data/categories'
import { useApp } from '../context/AppContext'
import { format } from 'date-fns'

let nextId = Date.now()

export default function AddTransactionModal({ onClose }) {
  const { dispatch, state } = useApp()
  const [form, setForm] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    description: '',
    amount: '',
    category: 'outros',
    installment: '',
    invoiceId: state.invoices[0]?.id || '',
  })

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }))
  }

  function save(e) {
    e.preventDefault()
    if (!form.description || !form.amount) return
    dispatch({
      type: 'ADD_TRANSACTION',
      payload: {
        id: String(nextId++),
        date: form.date,
        description: form.description,
        amount: parseFloat(form.amount.replace(',', '.')),
        category: form.category,
        installment: form.installment || undefined,
        invoiceId: form.invoiceId || undefined,
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
                {state.invoices.map(inv => (
                  <option key={inv.id} value={inv.id}>{inv.label}</option>
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
