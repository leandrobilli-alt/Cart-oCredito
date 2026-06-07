import { useMemo, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, ReferenceLine, Cell,
} from 'recharts'
import { Download, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { useApp, useCategories } from '../context/AppContext'
import {
  formatCurrency, formatDate, groupByDay, groupByWeek, groupByMonth,
  groupByCategory, downloadCSV, formatWeekLabel, formatShortDate, getCurrentInvoiceId,
} from '../utils/format'

const PERIODS = [
  { id: 'daily',   label: 'Diário'   },
  { id: 'weekly',  label: 'Semanal'  },
  { id: 'monthly', label: 'Mensal'   },
]

function StatCard({ label, value, sub, highlight }) {
  return (
    <div className="card text-center">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className={`text-base font-bold truncate ${highlight ? 'text-nu-purple' : 'text-gray-900'}`}>{value}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5 truncate">{sub}</div>}
    </div>
  )
}

function TrendBadge({ current, previous }) {
  if (!previous || previous === 0) return null
  const pct = ((current - previous) / previous) * 100
  const up = pct > 0
  const Icon = Math.abs(pct) < 1 ? Minus : up ? TrendingUp : TrendingDown
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
      up ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
    }`}>
      <Icon size={11} />
      {up ? '+' : ''}{pct.toFixed(1)}%
    </span>
  )
}

export default function Reports() {
  const { state } = useApp()
  const { categories, getCat } = useCategories()
  const [period, setPeriod]     = useState('daily')
  const [invoiceId, setInvoiceId] = useState(() => getCurrentInvoiceId(state.invoices) || 'all')
  const [showAllMerchants, setShowAllMerchants] = useState(false)
  const [showAllPurchases, setShowAllPurchases] = useState(false)

  // ── Transações do período selecionado ─────────────────────────────────────
  const filtered = useMemo(() => {
    const txs = invoiceId === 'all'
      ? state.transactions
      : state.transactions.filter(t => t.invoiceId === invoiceId)
    return txs.filter(t => t.amount > 0)
  }, [state.transactions, invoiceId])

  // ── Período anterior (para comparação) ────────────────────────────────────
  const previousFiltered = useMemo(() => {
    if (invoiceId === 'all') return []
    const inv = state.invoices.find(i => i.id === invoiceId)
    if (!inv) return []
    const [year, mon] = inv.month.split('-').map(Number)
    const prevMon  = mon === 1 ? 12 : mon - 1
    const prevYear = mon === 1 ? year - 1 : year
    const prevId   = `inv-${prevYear}-${String(prevMon).padStart(2, '0')}`
    return state.transactions.filter(t => t.invoiceId === prevId && t.amount > 0)
  }, [state.transactions, invoiceId, state.invoices])

  // ── Totais ────────────────────────────────────────────────────────────────
  const grandTotal   = useMemo(() => filtered.reduce((s, t) => s + t.amount, 0), [filtered])
  const previousTotal = useMemo(() => previousFiltered.reduce((s, t) => s + t.amount, 0), [previousFiltered])
  const biggestTx    = useMemo(() => filtered.reduce((m, t) => t.amount > (m?.amount || 0) ? t : m, null), [filtered])

  // ── Dados do gráfico ──────────────────────────────────────────────────────
  const chartData = useMemo(() => {
    if (period === 'daily')   return groupByDay(filtered).map(d => ({ ...d, label: formatShortDate(d.date) }))
    if (period === 'weekly')  return groupByWeek(filtered).map(d => ({ ...d, label: formatWeekLabel(d.date) }))
    return groupByMonth(filtered).map(d => ({
      ...d, label: new Date(d.date + '-15').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
    }))
  }, [filtered, period])

  const avgPerPeriod = chartData.length ? grandTotal / chartData.length : 0
  const maxPeriod    = chartData.reduce((m, d) => d.total > m.total ? d : m, { total: 0, label: '—' })

  // ── Categorias ────────────────────────────────────────────────────────────
  const catData = useMemo(() => {
    const map  = groupByCategory(filtered)
    const total = Object.values(map).reduce((s, v) => s + v, 0) || 1
    return categories
      .map(cat => ({
        ...cat,
        value: map[cat.id] || 0,
        count: filtered.filter(t => t.category === cat.id).length,
        pct:   ((map[cat.id] || 0) / total) * 100,
      }))
      .filter(c => c.value > 0)
      .sort((a, b) => b.value - a.value)
  }, [filtered, categories])

  // ── Top estabelecimentos ──────────────────────────────────────────────────
  const topMerchants = useMemo(() => {
    const map = {}
    filtered.forEach(t => {
      const key = t.description.replace(/\s*-\s*parcela.*/i, '').trim()
      if (!map[key]) map[key] = { name: key, total: 0, count: 0, category: t.category }
      map[key].total += t.amount
      map[key].count++
    })
    return Object.values(map).sort((a, b) => b.total - a.total)
  }, [filtered])

  // ── Top compras individuais ───────────────────────────────────────────────
  const topPurchases = useMemo(() =>
    [...filtered].sort((a, b) => b.amount - a.amount),
    [filtered]
  )

  // ── Compromissos futuros (parcelas) ───────────────────────────────────────
  const futureCommitments = useMemo(() => {
    const today = new Date().toISOString().slice(0, 7)
    return state.invoices
      .filter(inv => inv.month > today)
      .map(inv => {
        const txs  = state.transactions.filter(t => t.invoiceId === inv.id && t.amount > 0)
        const total = txs.reduce((s, t) => s + t.amount, 0)
        return { ...inv, total, count: txs.length }
      })
      .filter(inv => inv.total > 0)
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(0, 6)
  }, [state.invoices, state.transactions])

  const periodLabel = { daily: 'dia', weekly: 'semana', monthly: 'mês' }[period]

  function handleExport() {
    const txs   = invoiceId === 'all' ? state.transactions : state.transactions.filter(t => t.invoiceId === invoiceId)
    const label = invoiceId === 'all' ? 'todos' : state.invoices.find(i => i.id === invoiceId)?.label || invoiceId
    downloadCSV(txs, `relatorio-${label.replace(/\s/g, '-')}.csv`)
  }

  return (
    <div className="space-y-5">

      {/* ── Controles ── */}
      <div className="flex flex-col gap-2">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {PERIODS.map(p => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all ${
                period === p.id ? 'bg-white text-nu-purple shadow-sm' : 'text-gray-500'
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
          {state.invoices.map(inv => <option key={inv.id} value={inv.id}>{inv.label}</option>)}
        </select>
      </div>

      {/* ── Cards de resumo ── */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500 mb-0.5">Total gasto</div>
              <div className="text-3xl font-bold text-gray-900">{formatCurrency(grandTotal)}</div>
            </div>
            <div className="text-right">
              {previousTotal > 0 && (
                <>
                  <TrendBadge current={grandTotal} previous={previousTotal} />
                  <div className="text-xs text-gray-400 mt-1">Anterior: {formatCurrency(previousTotal)}</div>
                </>
              )}
            </div>
          </div>
        </div>

        <StatCard
          label="Nº de lançamentos"
          value={filtered.length}
          sub={`${formatCurrency(avgPerPeriod)} / ${periodLabel}`}
        />
        <StatCard
          label="Maior compra"
          value={biggestTx ? formatCurrency(biggestTx.amount) : '—'}
          sub={biggestTx?.description || ''}
        />
        <StatCard
          label={`Maior ${periodLabel}`}
          value={formatCurrency(maxPeriod.total)}
          sub={maxPeriod.label}
        />
        <StatCard
          label="Categorias usadas"
          value={catData.length}
          sub={catData[0] ? `Top: ${catData[0].icon} ${catData[0].name}` : ''}
          highlight
        />
      </div>

      {/* ── Gráfico principal ── */}
      {chartData.length > 0 ? (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">
              Gastos {period === 'daily' ? 'por dia' : period === 'weekly' ? 'por semana' : 'por mês'}
            </h3>
            <span className="text-xs text-gray-400">Média: {formatCurrency(avgPerPeriod)}</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            {period === 'monthly' ? (
              <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={v => [formatCurrency(v), 'Total']} />
                <ReferenceLine y={avgPerPeriod} stroke="#8A05BE" strokeDasharray="4 4" strokeOpacity={0.5} label={{ value: 'média', position: 'right', fontSize: 9, fill: '#8A05BE' }} />
                <Line type="monotone" dataKey="total" stroke="#8A05BE" strokeWidth={2.5} dot={{ r: 4, fill: '#8A05BE' }} name="Total" />
              </LineChart>
            ) : (
              <BarChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={period === 'daily' ? 'preserveStartEnd' : 0} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `R$${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}`} />
                <Tooltip formatter={(v, _, p) => [formatCurrency(v), 'Total']} labelFormatter={l => `${l} · ${p?.payload?.count || 0} lançamentos`} />
                <ReferenceLine y={avgPerPeriod} stroke="#8A05BE" strokeDasharray="4 4" strokeOpacity={0.5} />
                <Bar dataKey="total" radius={[4, 4, 0, 0]} name="Gasto">
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.total > avgPerPeriod ? '#ef4444' : '#8A05BE'} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-nu-purple inline-block" /> Abaixo da média</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> Acima da média</span>
            <span className="flex items-center gap-1"><span className="w-4 border-t-2 border-dashed border-nu-purple/50 inline-block" /> Média</span>
          </div>
        </div>
      ) : (
        <div className="card text-center py-10 text-gray-400 text-sm">Sem dados para o período</div>
      )}

      {/* ── Categorias ── */}
      {catData.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Por categoria</h3>
          <div className="space-y-2.5">
            {catData.map(cat => (
              <div key={cat.id}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-gray-700">{cat.icon} {cat.name}</span>
                  <div className="flex items-center gap-2 text-gray-500">
                    <span>{cat.count} lanç.</span>
                    <span className="font-semibold text-gray-800">{formatCurrency(cat.value)}</span>
                    <span className="w-9 text-right font-bold" style={{ color: cat.color }}>{cat.pct.toFixed(0)}%</span>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${(cat.value / catData[0].value) * 100}%`, backgroundColor: cat.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Top estabelecimentos ── */}
      {topMerchants.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Top estabelecimentos</h3>
            {topMerchants.length > 5 && (
              <button onClick={() => setShowAllMerchants(v => !v)} className="text-xs text-nu-purple">
                {showAllMerchants ? 'Ver menos' : `Ver todos (${topMerchants.length})`}
              </button>
            )}
          </div>
          <div className="space-y-2">
            {(showAllMerchants ? topMerchants : topMerchants.slice(0, 5)).map((m, i) => {
              const cat = getCat(m.category)
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-base w-6 flex-shrink-0">{cat.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-800 truncate">{m.name}</div>
                    <div className="text-xs text-gray-400">{m.count} vez{m.count !== 1 ? 'es' : ''}</div>
                  </div>
                  <div className="flex-shrink-0 text-sm font-semibold text-gray-900">{formatCurrency(m.total)}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Top compras ── */}
      {topPurchases.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Maiores compras</h3>
            {topPurchases.length > 5 && (
              <button onClick={() => setShowAllPurchases(v => !v)} className="text-xs text-nu-purple">
                {showAllPurchases ? 'Ver menos' : `Ver todas (${topPurchases.length})`}
              </button>
            )}
          </div>
          <div className="divide-y divide-gray-50">
            {(showAllPurchases ? topPurchases : topPurchases.slice(0, 5)).map((t, i) => {
              const cat = getCat(t.category)
              return (
                <div key={t.id} className="flex items-center gap-3 py-2">
                  <span className="text-xs font-bold text-gray-300 w-4">#{i + 1}</span>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-base flex-shrink-0"
                    style={{ backgroundColor: cat.color + '20' }}
                  >
                    {cat.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-800 truncate">{t.description}</div>
                    <div className="text-xs text-gray-400">{formatDate(t.date)}{t.installment ? ` · Parcela ${t.installment}` : ''}</div>
                  </div>
                  <div className="text-sm font-bold text-gray-900 flex-shrink-0">{formatCurrency(t.amount)}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Compromissos futuros ── */}
      {futureCommitments.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 mb-1">Compromissos futuros</h3>
          <p className="text-xs text-gray-400 mb-3">Parcelas já lançadas nas próximas faturas</p>
          <div className="space-y-2">
            {futureCommitments.map(inv => (
              <div key={inv.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-nu-purple flex-shrink-0" />
                  <span className="text-sm text-gray-700">{inv.label}</span>
                  <span className="text-xs text-gray-400">{inv.count} lanç.</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{formatCurrency(inv.total)}</span>
              </div>
            ))}
            <div className="border-t border-gray-100 pt-2 flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">Total comprometido</span>
              <span className="text-sm font-bold text-nu-purple">
                {formatCurrency(futureCommitments.reduce((s, i) => s + i.total, 0))}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Export ── */}
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
