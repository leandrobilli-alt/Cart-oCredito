import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { useApp } from '../context/AppContext'
import { formatCurrency } from '../utils/format'
import { MONTHS_ABBR, monthTotal, yearTotal, yearsInFinances } from '../utils/finance'
import FinanceTable from '../components/FinanceTable'
import EditFinanceValueModal from '../components/EditFinanceValueModal'
import FinanceAccountModal from '../components/FinanceAccountModal'

const SECTIONS = [
  { id: 'expense', label: 'Despesas' },
  { id: 'revenue', label: 'Receitas' },
]

export default function Financas() {
  const { state } = useApp()
  const finances = state.finances
  const years = useMemo(() => yearsInFinances(finances), [finances])

  const [year, setYear] = useState(() => years[years.length - 1])
  const [section, setSection] = useState('expense')
  const [editCell, setEditCell] = useState(null)       // { account, monthIndex }
  const [accountModal, setAccountModal] = useState(null) // { account? } — kind vem de `section`

  const accounts = section === 'expense' ? finances.expenses : finances.revenues

  const totalExpenses = useMemo(() => yearTotal(finances.expenses, year), [finances.expenses, year])
  const totalRevenues = useMemo(() => yearTotal(finances.revenues, year), [finances.revenues, year])
  const balance = totalRevenues - totalExpenses

  const balanceData = useMemo(() => MONTHS_ABBR.map((label, i) => {
    const receitas = monthTotal(finances.revenues, year, i)
    const despesas = monthTotal(finances.expenses, year, i)
    return { label, saldo: receitas - despesas, receitas, despesas }
  }), [finances, year])
  const hasYearData = useMemo(() => balanceData.some(d => d.receitas !== 0 || d.despesas !== 0), [balanceData])

  function changeYear(delta) {
    setYear(y => y + delta)
  }

  return (
    <div className="space-y-5">
      {/* Navegação por ano */}
      <div className="flex items-center justify-center gap-4">
        <button onClick={() => changeYear(-1)} className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors">
          <ChevronLeft size={20} />
        </button>
        <span className="text-base font-bold text-gray-900 w-16 text-center">{year}</span>
        <button onClick={() => changeYear(1)} className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Resumo do ano */}
      <div className="rounded-2xl p-5 text-white" style={{ background: 'linear-gradient(135deg, #8A05BE 0%, #3D0066 100%)' }}>
        <div className="text-sm opacity-80 mb-1">Saldo previsto em {year}</div>
        <div className="text-3xl font-bold mb-4">{formatCurrency(balance)}</div>
        <div className="flex gap-6">
          <div>
            <div className="text-xs opacity-70">Receitas</div>
            <div className="text-base font-semibold">{formatCurrency(totalRevenues)}</div>
          </div>
          <div>
            <div className="text-xs opacity-70">Despesas</div>
            <div className="text-base font-semibold">{formatCurrency(totalExpenses)}</div>
          </div>
        </div>
      </div>

      {/* Gráfico: saldo mensal (sobrou/faltou) */}
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Sobrou / faltou por mês</h3>
        {hasYearData ? (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={balanceData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `R$${v >= 1000 || v <= -1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
              <Tooltip
                formatter={(v, n) => [formatCurrency(v), n === 'saldo' ? 'Saldo' : n]}
                labelFormatter={l => l}
              />
              <Bar dataKey="saldo" radius={[4, 4, 4, 4]} name="saldo">
                {balanceData.map((d, i) => (
                  <Cell key={i} fill={d.saldo >= 0 ? '#22c55e' : '#ef4444'} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-gray-400 text-center py-8">Nenhum valor lançado para {year} ainda.</p>
        )}
      </div>

      {/* Alternância Despesas / Receitas */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {SECTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all ${
              section === s.id ? 'bg-white text-nu-purple shadow-sm' : 'text-gray-500'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Tabela detalhada mês a mês */}
      <div className="card !p-0 overflow-hidden">
        <div className="px-4 pt-4 pb-1">
          <h3 className="text-sm font-semibold text-gray-700">
            {section === 'expense' ? 'Contas mês a mês' : 'Receitas mês a mês'}
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5">Toque em um valor para editar, ou no nome para renomear/excluir.</p>
        </div>
        {accounts.length > 0 ? (
          <FinanceTable
            kind={section}
            accounts={accounts}
            year={year}
            onCellClick={(account, monthIndex) => setEditCell({ account, monthIndex })}
            onAccountClick={(account) => setAccountModal({ account })}
            onAddAccount={() => setAccountModal({})}
          />
        ) : (
          <div className="px-4 pb-4">
            <p className="text-sm text-gray-400 text-center py-6">
              Nenhuma {section === 'expense' ? 'conta' : 'receita'} cadastrada ainda.
            </p>
            <button
              onClick={() => setAccountModal({})}
              className="btn-primary w-full"
            >
              {section === 'expense' ? '+ Nova conta' : '+ Nova receita'}
            </button>
          </div>
        )}
      </div>

      {editCell && (
        <EditFinanceValueModal
          kind={section}
          account={editCell.account}
          year={year}
          monthIndex={editCell.monthIndex}
          onClose={() => setEditCell(null)}
        />
      )}
      {accountModal && (
        <FinanceAccountModal
          kind={section}
          account={accountModal.account}
          onClose={() => setAccountModal(null)}
        />
      )}
    </div>
  )
}
