import { useState } from 'react'
import { X, Trash2 } from 'lucide-react'

export default function AccountFormModal({ mode, label, initialName, onSave, onDelete, onClose }) {
  const [name, setName] = useState(initialName || '')
  const isEdit = mode === 'edit'

  function handleSave(e) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onSave(trimmed)
    onClose()
  }

  function handleDelete() {
    if (confirm(`Excluir "${initialName}" e todos os valores cadastrados nela?`)) {
      onDelete()
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">{isEdit ? 'Editar conta' : `Nova ${label}`}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Nome</label>
            <input
              autoFocus
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={`Ex.: ${label === 'receita' ? 'Freelance' : 'Academia'}`}
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="btn-ghost flex-1 border border-gray-200">Cancelar</button>
            <button type="submit" className="btn-primary flex-1">Salvar</button>
          </div>
        </form>
        {isEdit && (
          <button
            onClick={handleDelete}
            className="mt-3 w-full flex items-center justify-center gap-2 text-xs text-gray-400 hover:text-rose-500 transition-colors py-2"
          >
            <Trash2 size={13} /> Excluir conta
          </button>
        )}
      </div>
    </div>
  )
}
