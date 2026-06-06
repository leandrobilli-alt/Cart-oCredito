import { useState } from 'react'
import { LayoutDashboard, List, FileText, BarChart2, Settings, RotateCcw, Tag } from 'lucide-react'
import { AppProvider, useApp } from './context/AppContext'
import CategoryManagerModal from './components/CategoryManagerModal'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Invoices from './pages/Invoices'
import Reports from './pages/Reports'

const TABS = [
  { id: 'dashboard',    label: 'Início',       icon: LayoutDashboard },
  { id: 'transactions', label: 'Lançamentos',  icon: List },
  { id: 'invoices',     label: 'Faturas',      icon: FileText },
  { id: 'reports',      label: 'Relatórios',   icon: BarChart2 },
]

function SettingsModal({ onClose, onOpenCategories }) {
  const { state, dispatch } = useApp()
  const [form, setForm] = useState({ ...state.settings })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  function save(e) {
    e.preventDefault()
    dispatch({ type: 'UPDATE_SETTINGS', payload: { ...form, creditLimit: parseFloat(form.creditLimit) } })
    onClose()
  }

  function reset() {
    if (confirm('Restaurar dados de exemplo? Isso apagará todos os dados atuais.')) {
      dispatch({ type: 'RESET' })
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-5">
        <h2 className="text-base font-semibold mb-4">Configurações</h2>
        <form onSubmit={save} className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Seu nome</label>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nu-purple/30"
              value={form.ownerName} onChange={e => set('ownerName', e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Nome do cartão</label>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nu-purple/30"
              value={form.cardName} onChange={e => set('cardName', e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Limite (R$)</label>
              <input type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nu-purple/30"
                value={form.creditLimit} onChange={e => set('creditLimit', e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Fecha dia</label>
              <input type="number" min="1" max="31" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nu-purple/30"
                value={form.closeDay} onChange={e => set('closeDay', parseInt(e.target.value))} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Vence dia</label>
              <input type="number" min="1" max="31" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nu-purple/30"
                value={form.dueDay} onChange={e => set('dueDay', parseInt(e.target.value))} />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1 border border-gray-200">Cancelar</button>
            <button type="submit" className="btn-primary flex-1">Salvar</button>
          </div>
        </form>
        <button
          onClick={reset}
          className="mt-3 w-full flex items-center justify-center gap-2 text-xs text-gray-400 hover:text-red-500 transition-colors py-2"
        >
          <RotateCcw size={13} /> Restaurar dados de exemplo
        </button>
        <button
          onClick={() => { onClose(); onOpenCategories() }}
          className="mt-1 w-full flex items-center justify-center gap-2 text-xs text-gray-500 hover:text-nu-purple transition-colors py-2"
        >
          <Tag size={13} /> Gerenciar categorias
        </button>
      </div>
    </div>
  )
}

function AppContent() {
  const [tab, setTab] = useState('dashboard')
  const [showSettings, setShowSettings] = useState(false)
  const [showCategories, setShowCategories] = useState(false)
  const { state } = useApp()

  const pages = {
    dashboard:    <Dashboard />,
    transactions: <Transactions />,
    invoices:     <Invoices />,
    reports:      <Reports />,
  }

  const currentTab = TABS.find(t => t.id === tab)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-lg mx-auto">
      {/* Top header */}
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div>
          <div className="text-xs text-gray-400">Olá, {state.settings.ownerName} 👋</div>
          <div className="text-sm font-bold text-gray-900">{state.settings.cardName}</div>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ background: 'linear-gradient(135deg, #8A05BE, #3D0066)' }}
          >
            {state.settings.ownerName?.[0] || 'L'}
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
            title="Configurações"
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* Page title */}
      <div className="px-4 py-3 bg-gray-50">
        <h1 className="text-lg font-bold text-gray-900">{currentTab?.label}</h1>
      </div>

      {/* Main content */}
      <main className="flex-1 px-4 pb-24 overflow-y-auto">
        {pages[tab]}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-white border-t border-gray-100 z-40">
        <div className="flex">
          {TABS.map(t => {
            const Icon = t.icon
            const active = tab === t.id
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors ${
                  active ? 'text-nu-purple' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                <span className={`text-[10px] font-medium ${active ? 'text-nu-purple' : ''}`}>{t.label}</span>
              </button>
            )
          })}
        </div>
      </nav>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} onOpenCategories={() => setShowCategories(true)} />}
      {showCategories && <CategoryManagerModal onClose={() => setShowCategories(false)} />}
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
