import { useState } from 'react'
import { X } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { MONTHS_FULL, monthKey, hasValue } from '../utils/finance'

export default function EditFinanceValueModal({ kind, account, year, monthIndex, onClose }) {
  const { dispatch } = useApp()
  const key = monthKey(year, monthIndex)
  const current = account.values[key]
  const [value, setValue] = useState(hasValue(current) ? String(current).replace('.', ',') : '')

  function save(e) {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) { clear(); return }
    const num = parseFloat(trimmed.replace(/\./g, '').replace(',', '.'))
    if (isNaN(num)) return
    dispatch({ type: 'SET_FINANCE_VALUE', payload: { kind, id: account.id, month: key, value: num } })
    onClose()
  }

  function clear() {
    dispatch({ type: 'SET_FINANCE_VALUE', payload: { kind, id: account.id, month: key, value: null } })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">{account.name}</h2>
            <div className="text-xs text-gray-400">{MONTHS_FULL[monthIndex]} de {year}</div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={save} className="p-5 space-y-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Valor (R$)</label>
            <input
              type="text"
              inputMode="decimal"
              autoFocus
              placeholder="0,00"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-lg font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-nu-purple/30"
              value={value}
              onChange={e => setValue(e.target.value)}
            />
            <p className="text-[11px] text-gray-400 mt-1">Deixe em branco para remover o valor deste mês.</p>
          </div>

          <div className="flex gap-2">
            {hasValue(current) && (
              <button type="button" onClick={clear} className="btn-ghost text-red-500 hover:bg-red-50">Limpar</button>
            )}
            <button type="button" onClick={onClose} className="btn-ghost flex-1 border border-gray-200">Cancelar</button>
            <button type="submit" className="btn-primary flex-1">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  )
}
