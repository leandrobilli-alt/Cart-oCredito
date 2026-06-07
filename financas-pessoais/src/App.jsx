import { useState } from 'react'
import { Wallet, ArrowDownCircle, ArrowUpCircle, RotateCcw } from 'lucide-react'
import { FinanceProvider, useFinance } from './context/FinanceContext'
import MonthNav from './components/MonthNav'
import SummaryCard from './components/SummaryCard'
import AccountSection from './components/AccountSection'
import EditValueModal from './components/EditValueModal'
import AccountFormModal from './components/AccountFormModal'
import { MONTHS, monthKey, shiftMonth } from './utils/months'

const now = new Date()

function AppContent() {
  const { state, dispatch } = useFinance()
  const [year, setYear] = useState(now.getFullYear())
  const [monthIndex, setMonthIndex] = useState(now.getMonth())
  const [valueTarget, setValueTarget] = useState(null)
  const [accountModal, setAccountModal] = useState(null)

  const mKey = monthKey(year, monthIndex)
  const monthLabel = `${MONTHS[monthIndex]} de ${year}`

  function goPrev() {
    const next = shiftMonth(year, monthIndex, -1)
    setYear(next.year); setMonthIndex(next.monthIndex)
  }
  function goNext() {
    const next = shiftMonth(year, monthIndex, 1)
    setYear(next.year); setMonthIndex(next.monthIndex)
  }

  const receitas = state.revenues.reduce((sum, acc) => sum + (acc.values[mKey] || 0), 0)
  const despesas = state.expenses.reduce((sum, acc) => sum + (acc.values[mKey] || 0), 0)

  function handleSaveValue(value) {
    const { kind, account } = valueTarget
    dispatch({ type: 'SET_VALUE', payload: { kind, id: account.id, monthKey: mKey, value } })
  }

  function handleSaveAccount(name) {
    const { kind, mode, account } = accountModal
    if (mode === 'add') dispatch({ type: 'ADD_ACCOUNT', payload: { kind, name } })
    else dispatch({ type: 'RENAME_ACCOUNT', payload: { kind, id: account.id, name } })
  }

  function handleDeleteAccount() {
    const { kind, account } = accountModal
    dispatch({ type: 'DELETE_ACCOUNT', payload: { kind, id: account.id } })
  }

  function handleReset() {
    if (confirm('Restaurar os dados originais da planilha? Isso vai apagar todas as suas alterações.')) {
      dispatch({ type: 'RESET' })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 pb-12">
        <header className="flex items-center justify-between pt-6 pb-1">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #059669, #047857)' }}
            >
              <Wallet size={20} />
            </div>
            <div>
              <div className="text-base font-bold text-gray-900 leading-tight">Minhas Finanças</div>
              <div className="text-xs text-gray-400">Contas e receitas, mês a mês</div>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="p-2 text-gray-300 hover:text-gray-500 transition-colors"
            title="Restaurar dados originais da planilha"
          >
            <RotateCcw size={16} />
          </button>
        </header>

        <MonthNav year={year} monthIndex={monthIndex} onPrev={goPrev} onNext={goNext} />
        <SummaryCard receitas={receitas} despesas={despesas} />

        <AccountSection
          title="Despesas"
          subtitle="Contas e cartões do mês"
          icon={ArrowDownCircle}
          accent="rose"
          accounts={state.expenses}
          monthKey={mKey}
          addLabel="Nova conta"
          onTapValue={(account) => setValueTarget({ kind: 'expenses', account })}
          onTapName={(account) => setAccountModal({ kind: 'expenses', mode: 'edit', label: 'conta', account })}
          onAdd={() => setAccountModal({ kind: 'expenses', mode: 'add', label: 'conta' })}
        />

        <AccountSection
          title="Receitas"
          subtitle="Entradas previstas no mês"
          icon={ArrowUpCircle}
          accent="brand"
          accounts={state.revenues}
          monthKey={mKey}
          addLabel="Nova receita"
          onTapValue={(account) => setValueTarget({ kind: 'revenues', account })}
          onTapName={(account) => setAccountModal({ kind: 'revenues', mode: 'edit', label: 'receita', account })}
          onAdd={() => setAccountModal({ kind: 'revenues', mode: 'add', label: 'receita' })}
        />
      </div>

      {valueTarget && (
        <EditValueModal
          accountName={valueTarget.account.name}
          monthLabel={monthLabel}
          value={valueTarget.account.values[mKey]}
          onSave={handleSaveValue}
          onClose={() => setValueTarget(null)}
        />
      )}

      {accountModal && (
        <AccountFormModal
          mode={accountModal.mode}
          label={accountModal.label}
          initialName={accountModal.account?.name}
          onSave={handleSaveAccount}
          onDelete={handleDeleteAccount}
          onClose={() => setAccountModal(null)}
        />
      )}
    </div>
  )
}

export default function App() {
  return (
    <FinanceProvider>
      <AppContent />
    </FinanceProvider>
  )
}
