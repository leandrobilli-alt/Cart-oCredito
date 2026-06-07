import { useMemo, useState } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import { useApp } from '../context/AppContext'
import { useCategories } from '../context/AppContext'
import { formatCurrency, formatShortDate, groupByDay, groupByCategory, getCurrentInvoiceId } from '../utils/format'
import StatsCard from '../components/StatsCard'
import TransactionItem from '../components/TransactionItem'
import EditTransactionModal from '../components/EditTransactionModal'

const RADIAN = Math.PI / 180
function CustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  if (percent < 0.05) return null
  const r = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + r * Math.cos(-midAngle * RADIAN)
  const y = cy + r * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export default function Dashboard() {
  const { state } = useApp()
  const { getCat } = useCategories()
  const [selected, setSelected] = useState(null)
  const [activeInvoice, setActiveInvoice] = useState(() => getCurrentInvoiceId(state.invoices) || state.invoices[0]?.id || '')

  const invoice = state.invoices.find(i => i.id === activeInvoice) || state.invoices[0]

  const transactions = useMemo(() =>
    state.transactions.filter(t => t.invoiceId === invoice?.id),
    [state.transactions, invoice]
  )

  const purchases = useMemo(() => transactions.filter(t => t.amount > 0), [transactions])
  const total = useMemo(() => purchases.reduce((s, t) => s + t.amount, 0), [purchases])
  const avgDay = useMemo(() => {
    const days = groupByDay(purchases)
    return days.length ? total / days.length : 0
  }, [purchases, total])

  const catMap = useMemo(() => groupByCategory(purchases), [purchases])
  const pieData = useMemo(() =>
    Object.entries(catMap)
      .map(([id, val]) => ({ id, name: getCat(id).name, value: val, color: getCat(id).color }))
      .sort((a, b) => b.value - a.value),
    [catMap]
  )

  const topCat = pieData[0]
  const limitPct = invoice ? (total / invoice.creditLimit) * 100 : 0

  const dailyData = useMemo(() =>
    groupByDay(purchases).map(d => ({ ...d, label: formatShortDate(d.date) })),
    [purchases]
  )

  const recent = useMemo(() =>
    [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6),
    [transactions]
  )

  return (
    <div className="space-y-5">
      {/* Invoice selector */}
      {state.invoices.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {state.invoices.map(inv => (
            <button
              key={inv.id}
              onClick={() => setActiveInvoice(inv.id)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                activeInvoice === inv.id
                  ? 'bg-nu-purple text-white border-nu-purple'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {inv.label}
            </button>
          ))}
        </div>
      )}

      {/* Hero card */}
      <div className="rounded-2xl p-5 text-white" style={{ background: 'linear-gradient(135deg, #8A05BE 0%, #3D0066 100%)' }}>
        <div className="text-sm opacity-80 mb-1">Fatura {invoice?.label}</div>
        <div className="text-4xl font-bold mb-1">{formatCurrency(total)}</div>
        <div className="text-sm opacity-70">
          Vence em {invoice?.dueDate ? new Date(invoice.dueDate + 'T12:00:00').toLocaleDateString('pt-BR') : '--'} ·
          Limite {formatCurrency(invoice?.creditLimit || 0)}
        </div>
        {/* Limit bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs opacity-70 mb-1">
            <span>Limite utilizado</span>
            <span>{limitPct.toFixed(1)}%</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(limitPct, 100)}%`,
                backgroundColor: limitPct > 80 ? '#ef4444' : limitPct > 60 ? '#f97316' : '#22c55e',
              }}
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatsCard
          label="Total de compras"
          value={formatCurrency(total)}
          sub={`${purchases.length} lançamentos`}
          icon="💳"
          color="#8A05BE"
        />
        <StatsCard
          label="Média diária"
          value={formatCurrency(avgDay)}
          sub="no período da fatura"
          icon="📅"
          color="#3b82f6"
        />
        <StatsCard
          label="Top categoria"
          value={topCat ? getCat(topCat.id).icon + ' ' + topCat.name : '—'}
          sub={topCat ? formatCurrency(topCat.value) : ''}
          icon="🏆"
          color="#f97316"
        />
        <StatsCard
          label="Limite disponível"
          value={formatCurrency((invoice?.creditLimit || 0) - total)}
          sub={`${(100 - limitPct).toFixed(1)}% livre`}
          icon="✅"
          color="#22c55e"
        />
      </div>

      {/* Category pie */}
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Gastos por categoria</h3>
        {pieData.length > 0 ? (
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={95}
                  dataKey="value"
                  labelLine={false}
                  label={<CustomLabel />}
                >
                  {pieData.map(entry => (
                    <Cell key={entry.id} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={v => formatCurrency(v)} />
              </PieChart>
            </ResponsiveContainer>

            <div className="w-full sm:w-auto space-y-1.5 min-w-0">
              {pieData.slice(0, 8).map(entry => (
                <div key={entry.id} className="flex items-center gap-2 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                  <span className="text-gray-600 truncate flex-1">{getCat(entry.id).icon} {entry.name}</span>
                  <span className="font-semibold text-gray-800 flex-shrink-0">{formatCurrency(entry.value)}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-8">Nenhum lançamento ainda.</p>
        )}
      </div>

      {/* Daily spending bar */}
      {dailyData.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Gastos diários</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={dailyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `R$${v}`} />
              <Tooltip formatter={v => formatCurrency(v)} labelFormatter={l => `Dia ${l}`} />
              <Bar dataKey="total" fill="#8A05BE" radius={[4, 4, 0, 0]} name="Gasto" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent */}
      <div className="card !p-0 overflow-hidden">
        <h3 className="text-sm font-semibold text-gray-700 px-4 pt-4 pb-3">Últimos lançamentos</h3>
        <div className="divide-y divide-gray-50">
          {recent.map(t => (
            <TransactionItem key={t.id} transaction={t} onClick={setSelected} />
          ))}
        </div>
      </div>

      {selected && <EditTransactionModal transaction={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
