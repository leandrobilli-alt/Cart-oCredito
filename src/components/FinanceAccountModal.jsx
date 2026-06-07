import { useState } from 'react'
import { X } from 'lucide-react'
import { useApp } from '../context/AppContext'

let nextFinanceId = Date.now()

export default function FinanceAccountModal({ kind, account, onClose }) {
  const { dispatch } = useApp()
  const [name, setName] = useState(account?.name || '')
  const [error, setError] = useState('')
  const isEdit = !!account
  const noun = kind === 'expense' ? 'conta' : 'receita'

  function save(e) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) { setError('Informe um nome.'); return }

    if (isEdit) {
      dispatch({ type: 'RENAME_FINANCE_ACCOUNT', payload: { kind, id: account.id, name: trimmed } })
    } else {
      const id = `${kind === 'expense' ? 'exp' : 'rev'}_${nextFinanceId++}`
      dispatch({ type: 'ADD_FINANCE_ACCOUNT', payload: { kind, account: { id, name: trimmed, values: {} } } })
    }
    onClose()
  }

  function remove() {
    if (confirm(`Excluir "${account.name}"? Todos os valores cadastrados nela serão apagados.`)) {
      dispatch({ type: 'DELETE_FINANCE_ACCOUNT', payload: { kind, id: account.id } })
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">
            {isEdit ? `Editar ${noun}` : `Nova ${noun}`}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={save} className="p-5 space-y-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Nome</label>
            <input
              type="text"
              autoFocus
              placeholder={kind === 'expense' ? 'Ex: Aluguel, Internet, Faculdade…' : 'Ex: Salário, Freelas, Aluguel recebido…'}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nu-purple/30"
              value={name}
              onChange={e => { setName(e.target.value); setError('') }}
            />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            {!isEdit && <p className="text-[11px] text-gray-400 mt-1">Você poderá preencher os valores de cada mês depois, tocando nas células da tabela.</p>}
          </div>

          <div className="flex gap-2">
            {isEdit && (
              <button type="button" onClick={remove} className="btn-ghost text-red-500 hover:bg-red-50">Excluir</button>
            )}
            <button type="button" onClick={onClose} className="btn-ghost flex-1 border border-gray-200">Cancelar</button>
            <button type="submit" className="btn-primary flex-1">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  )
}
