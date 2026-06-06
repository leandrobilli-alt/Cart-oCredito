import { useMemo, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line,
} from 'recharts'
import { Download } from 'lucide-react'
import { useApp } from '../context/AppContext'
import {
  formatCurrency, formatShortDate, formatWeekLabel,
  groupByDay, groupByWeek, groupByMonth, groupByCategory, downloadCSV,
} from '../utils/format'
import { getCategoryById, CATEGORIES } from '../data/categories'
import CategoryBadge from '../components/CategoryBadge'

const PERIODS = [
  { id: 'daily',   label: 'Diário'   },
  { id: 'weekly',  label: 'Semanal'  },
  { id: 'monthly', label: 'Mensal'   },
]

function TableRow({ label, value, count, pct, color }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
      <span className="flex-1 text-sm text-gray-700 truncate">{label}</span>
      <span className="text-xs text-gray-400">{count} lanç.</span>
      <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-sm font-semibold text-gray-900 w-24 text-right">{formatCurrency(value)}</span>
    </div>
  )
}

export default function Reports() {
  const { state } = useApp()
  const [period, setPeriod] = useState('daily')
  const [invoiceId, setInvoiceId] = useState(state.invoices[0]?.id || 'all')

  const filtered = useMemo(() => {
    const txs = invoiceId === 'all'
      ? state.transactions
      : state.transactions.filter(t => t.invoiceId === invoiceId)
    return txs.filter(t => t.amount > 0)
  }, [state.transactions, invoiceId])

  const chartData = useMemo(() => {
    if (period === 'daily') {
      return groupByDay(filtered).map(d => ({
        ...d, label: formatShortDate(d.date),
        avg: d.total / (d.count || 1),
      }))
    }
    if (period === 'weekly') {
      return groupByWeek(filtered).map(d => ({
        ...d, label: formatWeekLabel(d.date),
      }))
    }
    return groupByMonth(filtered).map(d => ({
      ...d,
      label: new Date(d.date + '-15').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
    }))
  }, [filtered, period])

  const catData = useMemo(() => {
    const map = groupByCategory(filtered)
    const total = Object.values(map).reduce((s, v) => s + v, 0) || 1
    return CATEGORIES
      .map(cat => {
        const value = map[cat.id] || 0
        const count = filtered.filter(t => t.category === cat.id).length
        return { ...cat, value, count, pct: (value / total) * 100 }
      })
      .filter(c => c.value > 0)
      .sort((a, b) => b.value - a.value)
  }, [filtered])

  const grandTotal = useMemo(() => filtered.reduce((s, t) => s + t.amount, 0), [filtered])
  const avgPerPeriod = chartData.length ? grandTotal / chartData.length : 0
  const maxPeriod = chartData.reduce((m, d) => d.total > m.total ? d : m, { total: 0, label: '—' })

  function handleExport() {
    const txs = invoiceId === 'all'
      ? state.transactions
      : state.transactions.filter(t => t.invoiceId === invoiceId)
    const label = invoiceId === 'all' ? 'todos' : state.invoices.find(i => i.id === invoiceId)?.label || invoiceId
    downloadCSV(txs, `relatorio-${label.replace(/\s/g, '-')}.csv`)
  }

  const periodLabel = { daily: 'dia', weekly: 'semana', monthly: 'mês' }[period]

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 flex-1">
          {PERIODS.map(p => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all ${
                period === p.id ? 'bg-white text-nu-purple shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <select
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nu-purple/30 bg-white"
          value={invoiceId}
          onChange={e => setInvoiceId(e.target.value)}
        >
          <option value="all">Todas as faturas</option>
          {state.invoices.map(inv => (
            <option key={inv.id} value={inv.id}>{inv.label}</option>
          ))}
        </select>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card text-center">
          <div className="text-xs text-gray-500 mb-1">Total</div>
          <div className="text-lg font-bold text-gray-900">{formatCurrency(grandTotal)}</div>
        </div>
        <div className="card text-center">
          <div className="text-xs text-gray-500 mb-1">Média / {periodLabel}</div>
          <div className="text-lg font-bold text-nu-purple">{formatCurrency(avgPerPeriod)}</div>
        </div>
        <div className="card text-center">
          <div className="text-xs text-gray-500 mb-1">Maior {periodLabel}</div>
          <div className="text-base font-bold text-orange-600">{formatCurrency(maxPeriod.total)}</div>
          <div className="text-xs text-gray-400 truncate">{maxPeriod.label}</div>
        </div>
      </div>

      {/* Main chart */}
      {chartData.length > 0 ? (
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            Gastos {period === 'daily' ? 'por dia' : period === 'weekly' ? 'por semana' : 'por mês'}
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            {period === 'monthly' ? (
              <LineChart data={chartData} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={v => formatCurrency(v)} />
                <Line type="monotone" dataKey="total" stroke="#8A05BE" strokeWidth={2.5} dot={{ r: 4, fill: '#8A05BE' }} name="Total" />
              </LineChart>
            ) : (
              <BarChart data={chartData} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={period === 'daily' ? 'preserveStartEnd' : 0} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `R$${v}`} />
                <Tooltip formatter={v => formatCurrency(v)} />
                <Bar dataKey="total" fill="#8A05BE" radius={[4, 4, 0, 0]} name="Gasto" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="card text-center py-10 text-gray-400 text-sm">Sem dados para o período</div>
      )}

      {/* Category breakdown */}
      {catData.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Breakdown por categoria</h3>
          <div className="divide-y divide-gray-50">
            {catData.map(cat => (
              <TableRow
                key={cat.id}
                label={`${cat.icon} ${cat.name}`}
                value={cat.value}
                count={cat.count}
                pct={cat.pct}
                color={cat.color}
              />
            ))}
          </div>
        </div>
      )}

      {/* Export */}
      <button
        onClick={handleExport}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 hover:border-nu-purple hover:text-nu-purple transition-colors text-sm font-medium"
      >
        <Download size={16} />
        Exportar relatório em CSV
      </button>
    </div>
  )
}
