import { useState } from 'react'
import { X, Trash2 } from 'lucide-react'

export default function EditValueModal({ accountName, monthLabel, value, onSave, onClose }) {
  const hasValue = value !== undefined && value !== null
  const [text, setText] = useState(hasValue ? String(value).replace('.', ',') : '')

  function handleSave(e) {
    e.preventDefault()
    const trimmed = text.trim()
    if (trimmed === '') {
      onSave(null)
      onClose()
      return
    }
    const parsed = parseFloat(trimmed.replace(/\./g, '').replace(',', '.'))
    if (Number.isNaN(parsed)) return
    onSave(parsed)
    onClose()
  }

  function handleClear() {
    onSave(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-5">
        <div className="flex items-start justify-between mb-1">
          <h2 className="text-base font-semibold text-gray-900 pr-4">{accountName}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 flex-shrink-0"><X size={18} /></button>
        </div>
        <p className="text-xs text-gray-400 mb-4">{monthLabel}</p>
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Valor (R$)</label>
            <input
              autoFocus
              inputMode="decimal"
              placeholder="0,00"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-lg font-semibold tabular-nums focus:outline-none focus:ring-2 focus:ring-brand/30"
              value={text}
              onChange={e => setText(e.target.value)}
            />
            <p className="text-[11px] text-gray-400 mt-1">Deixe em branco para remover o valor deste mês.</p>
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="btn-ghost flex-1 border border-gray-200">Cancelar</button>
            <button type="submit" className="btn-primary flex-1">Salvar</button>
          </div>
        </form>
        {hasValue && (
          <button
            onClick={handleClear}
            className="mt-3 w-full flex items-center justify-center gap-2 text-xs text-gray-400 hover:text-rose-500 transition-colors py-2"
          >
            <Trash2 size={13} /> Remover valor deste mês
          </button>
        )}
      </div>
    </div>
  )
}
