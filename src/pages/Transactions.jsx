import { useMemo, useState } from 'react'
import { Search, Plus, SlidersHorizontal } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { CATEGORIES } from '../data/categories'
import { formatCurrency } from '../utils/format'
import TransactionItem from '../components/TransactionItem'
import EditTransactionModal from '../components/EditTransactionModal'
import AddTransactionModal from '../components/AddTransactionModal'
import CategoryBadge from '../components/CategoryBadge'

export default function Transactions() {
  const { state } = useApp()
  const [query, setQuery] = useState('')
  const [catFilter, setCatFilter] = useState('all')
  const [invoiceFilter, setInvoiceFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [selected, setSelected] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [sortAsc, setSortAsc] = useState(false)

  const filtered = useMemo(() => {
    let txs = state.transactions
    if (invoiceFilter !== 'all') txs = txs.filter(t => t.invoiceId === invoiceFilter)
    if (catFilter !== 'all') txs = txs.filter(t => t.category === catFilter)
    if (query) txs = txs.filter(t => t.description.toLowerCase().includes(query.toLowerCase()))
    return [...txs].sort((a, b) =>
      sortAsc ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date)
    )
  }, [state.transactions, catFilter, invoiceFilter, query, sortAsc])

  const total = useMemo(() =>
    filtered.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0),
    [filtered]
  )

  // Group by date for display
  const grouped = useMemo(() => {
    const map = {}
    filtered.forEach(t => {
      if (!map[t.date]) map[t.date] = []
      map[t.date].push(t)
    })
    const keys = Object.keys(map).sort((a, b) => sortAsc ? a.localeCompare(b) : b.localeCompare(a))
    return keys.map(date => ({ date, items: map[date] }))
  }, [filtered, sortAsc])

  function formatGroupDate(dateStr) {
    const d = new Date(dateStr + 'T12:00:00')
    return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-nu-purple/30 bg-white"
            placeholder="Buscar lançamento..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <button
          onClick={() => setShowFilters(f => !f)}
          className={`p-2.5 rounded-xl border transition-colors ${showFilters ? 'bg-nu-purple border-nu-purple text-white' : 'bg-white border-gray-200 text-gray-600'}`}
        >
          <SlidersHorizontal size={18} />
        </button>
        <button
          onClick={() => setShowAdd(true)}
          className="p-2.5 rounded-xl bg-nu-purple text-white hover:bg-nu-hover transition-colors"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="card space-y-3">
          <div>
            <div className="text-xs text-gray-500 mb-2">Fatura</div>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setInvoiceFilter('all')}
                className={`flex-shrink-0 px-3 py-1 rounded-full text-xs border transition-colors ${invoiceFilter === 'all' ? 'bg-nu-purple text-white border-nu-purple' : 'border-gray-200 text-gray-600'}`}
              >
                Todas
              </button>
              {state.invoices.map(inv => (
                <button
                  key={inv.id}
                  onClick={() => setInvoiceFilter(inv.id)}
                  className={`flex-shrink-0 px-3 py-1 rounded-full text-xs border transition-colors ${invoiceFilter === inv.id ? 'bg-nu-purple text-white border-nu-purple' : 'border-gray-200 text-gray-600'}`}
                >
                  {inv.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs text-gray-500 mb-2">Categoria</div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCatFilter('all')}
                className={`px-3 py-1 rounded-full text-xs border transition-colors ${catFilter === 'all' ? 'bg-nu-purple text-white border-nu-purple' : 'border-gray-200 text-gray-600'}`}
              >
                Todas
              </button>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCatFilter(cat.id)}
                  className={`px-3 py-1 rounded-full text-xs border transition-colors ${catFilter === cat.id ? 'text-white border-transparent' : 'border-gray-200 text-gray-600'}`}
                  style={catFilter === cat.id ? { backgroundColor: cat.color } : {}}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Ordenação</span>
            <button
              onClick={() => setSortAsc(v => !v)}
              className="text-xs text-nu-purple font-medium"
            >
              {sortAsc ? '↑ Mais antigos' : '↓ Mais recentes'}
            </button>
          </div>
        </div>
      )}

      {/* Summary row */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">{filtered.length} lançamentos</span>
        <span className="font-semibold text-gray-900">{formatCurrency(total)}</span>
      </div>

      {/* Grouped list */}
      {grouped.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">
          <div className="text-3xl mb-2">🔍</div>
          <div className="text-sm">Nenhum lançamento encontrado</div>
        </div>
      ) : (
        <div className="space-y-3">
          {grouped.map(({ date, items }) => {
            const dayTotal = items.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0)
            return (
              <div key={date} className="card !p-0 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-100">
                  <span className="text-xs font-medium text-gray-500 capitalize">{formatGroupDate(date)}</span>
                  {dayTotal > 0 && <span className="text-xs font-semibold text-gray-700">{formatCurrency(dayTotal)}</span>}
                </div>
                <div className="divide-y divide-gray-50">
                  {items.map(t => (
                    <TransactionItem key={t.id} transaction={t} onClick={setSelected} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {selected && <EditTransactionModal transaction={selected} onClose={() => setSelected(null)} />}
      {showAdd && <AddTransactionModal onClose={() => setShowAdd(false)} />}
    </div>
  )
}
