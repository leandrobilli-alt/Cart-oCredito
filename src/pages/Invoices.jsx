import { useMemo, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { Plus, ChevronDown, Upload, Trash2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { formatCurrency, groupByCategory } from '../utils/format'
import { useCategories } from '../context/AppContext'
import TransactionItem from '../components/TransactionItem'
import EditTransactionModal from '../components/EditTransactionModal'
import ImportInvoiceModal from '../components/ImportInvoiceModal'

function StatusBadge({ status }) {
  const map = {
    open:   { label: 'Aberta',   cls: 'bg-blue-100 text-blue-700' },
    closed: { label: 'Fechada',  cls: 'bg-orange-100 text-orange-700' },
    paid:   { label: 'Paga',     cls: 'bg-green-100 text-green-700' },
  }
  const s = map[status] || map.open
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.cls}`}>{s.label}</span>
}

function AddInvoiceModal({ onClose }) {
  const { dispatch } = useApp()
  const [form, setForm] = useState({ label: '', month: '', dueDate: '', closeDate: '', creditLimit: '29750' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  function save(e) {
    e.preventDefault()
    dispatch({
      type: 'ADD_INVOICE',
      payload: {
        id: `inv-${form.month}`,
        month: form.month,
        label: form.label,
        dueDate: form.dueDate,
        closeDate: form.closeDate,
        totalAmount: 0,
        totalPurchases: 0,
        creditLimit: parseFloat(form.creditLimit),
        status: 'open',
      },
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-5">
        <h2 className="text-base font-semibold mb-4">Nova fatura</h2>
        <form onSubmit={save} className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Nome (ex: Junho 2026)</label>
            <input required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nu-purple/30"
              value={form.label} onChange={e => set('label', e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Mês (YYYY-MM)</label>
            <input required type="month" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nu-purple/30"
              value={form.month} onChange={e => set('month', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Fechamento</label>
              <input required type="date" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nu-purple/30"
                value={form.closeDate} onChange={e => set('closeDate', e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Vencimento</label>
              <input required type="date" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nu-purple/30"
                value={form.dueDate} onChange={e => set('dueDate', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Limite (R$)</label>
            <input type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nu-purple/30"
              value={form.creditLimit} onChange={e => set('creditLimit', e.target.value)} />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1 border border-gray-200">Cancelar</button>
            <button type="submit" className="btn-primary flex-1">Criar fatura</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Invoices() {
  const { state, dispatch } = useApp()
  const { getCat } = useCategories()

  function deleteInvoice(inv, e) {
    e.stopPropagation()
    const count = state.transactions.filter(t => t.invoiceId === inv.id).length
    const msg = count > 0
      ? `Excluir a fatura "${inv.label}"?\n\nEla possui ${count} lançamentos. Deseja excluir os lançamentos também?\n\nOK = excluir fatura e lançamentos\nCancelar = apenas excluir a fatura`
      : `Excluir a fatura "${inv.label}"?`

    if (count > 0) {
      const withTx = window.confirm(msg)
      // Se o usuário cancelou o confirm, não faz nada
      // confirm retorna false em "Cancelar", true em "OK"
      dispatch({ type: 'DELETE_INVOICE', id: inv.id, deleteTransactions: withTx })
    } else {
      if (window.confirm(`Excluir a fatura "${inv.label}"?`)) {
        dispatch({ type: 'DELETE_INVOICE', id: inv.id, deleteTransactions: false })
      }
    }
    setExpanded(e2 => e2 === inv.id ? null : e2)
  }
  const [expanded, setExpanded] = useState(state.invoices[0]?.id || null)
  const [selected, setSelected] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [showImport, setShowImport] = useState(false)

  const invoicesWithTotals = useMemo(() =>
    state.invoices.map(inv => {
      const txs = state.transactions.filter(t => t.invoiceId === inv.id && t.amount > 0)
      const total = txs.reduce((s, t) => s + t.amount, 0)
      const catMap = groupByCategory(txs)
      const topCats = Object.entries(catMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([id, value]) => ({ id, value, cat: getCat(id) }))
      return { ...inv, computedTotal: total, count: txs.length, topCats }
    }),
    [state.invoices, state.transactions]
  )

  // Bar chart data: monthly totals
  const chartData = useMemo(() =>
    [...invoicesWithTotals]
      .sort((a, b) => a.month.localeCompare(b.month))
      .map(inv => ({ name: inv.label.split(' ')[0], total: inv.computedTotal })),
    [invoicesWithTotals]
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">Histórico de faturas</h2>
        <div className="flex gap-2">
          <button onClick={() => setShowImport(true)} className="btn-ghost border border-gray-200 flex items-center gap-1.5">
            <Upload size={15} /> Importar CSV
          </button>
          <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-1.5">
            <Plus size={15} /> Nova
          </button>
        </div>
      </div>

      {/* Monthly comparison */}
      {chartData.length > 1 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Comparativo mensal</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `R$${(v / 1000).toFixed(1)}k`} />
              <Tooltip formatter={v => formatCurrency(v)} />
              <Bar dataKey="total" fill="#8A05BE" radius={[4, 4, 0, 0]} name="Total" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Invoice cards */}
      {invoicesWithTotals.map(inv => {
        const isOpen = expanded === inv.id
        const invTransactions = state.transactions
          .filter(t => t.invoiceId === inv.id)
          .sort((a, b) => b.date.localeCompare(a.date))
        const limitPct = (inv.computedTotal / inv.creditLimit) * 100

        return (
          <div key={inv.id} className="card !p-0 overflow-hidden">
            {/* Header */}
            <div className="flex items-center">
              <button
                className="flex-1 flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors text-left"
                onClick={() => setExpanded(isOpen ? null : inv.id)}
              >
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-gray-900">{inv.label}</span>
                    <StatusBadge status={inv.status} />
                  </div>
                  <div className="text-xs text-gray-400">
                    Fecha {inv.closeDate ? new Date(inv.closeDate + 'T12:00:00').toLocaleDateString('pt-BR') : '--'} ·
                    Vence {inv.dueDate ? new Date(inv.dueDate + 'T12:00:00').toLocaleDateString('pt-BR') : '--'}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-bold text-gray-900">{formatCurrency(inv.computedTotal)}</div>
                    <div className="text-xs text-gray-400">{inv.count} compras</div>
                  </div>
                  <ChevronDown size={18} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
              </button>
              <button
                onClick={e => deleteInvoice(inv, e)}
                className="px-3 py-4 text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                title="Excluir fatura"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {/* Expanded content */}
            {isOpen && (
              <div className="border-t border-gray-100">
                {/* Mini limit bar */}
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Limite utilizado</span>
                    <span>{limitPct.toFixed(1)}% de {formatCurrency(inv.creditLimit)}</span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(limitPct, 100)}%`,
                        backgroundColor: limitPct > 80 ? '#ef4444' : limitPct > 60 ? '#f97316' : '#8A05BE',
                      }}
                    />
                  </div>
                </div>

                {/* Top categories */}
                {inv.topCats.length > 0 && (
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="text-xs font-medium text-gray-500 mb-2">Top categorias</div>
                    <div className="space-y-1.5">
                      {inv.topCats.map(({ id, value, cat }) => (
                        <div key={id} className="flex items-center gap-2">
                          <span className="text-sm">{cat.icon}</span>
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${(value / inv.computedTotal) * 100}%`,
                                backgroundColor: cat.color,
                              }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 w-16 text-right">{formatCurrency(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Transaction list */}
                <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
                  {invTransactions.map(t => (
                    <TransactionItem key={t.id} transaction={t} onClick={setSelected} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })}

      {selected && <EditTransactionModal transaction={selected} onClose={() => setSelected(null)} />}
      {showAdd && <AddInvoiceModal onClose={() => setShowAdd(false)} />}
      {showImport && <ImportInvoiceModal onClose={() => setShowImport(false)} />}
    </div>
  )
}
