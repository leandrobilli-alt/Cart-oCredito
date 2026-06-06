import { useState } from 'react'
import { X } from 'lucide-react'
import { useApp, useCategories } from '../context/AppContext'
import { formatCurrency } from '../utils/format'

export default function EditTransactionModal({ transaction, onClose }) {
  const { dispatch } = useApp()
  const { categories } = useCategories()
  const [category, setCategory] = useState(transaction.category)
  const [description, setDescription] = useState(transaction.description)

  function save() {
    dispatch({ type: 'UPDATE_TRANSACTION', payload: { ...transaction, category, description } })
    onClose()
  }

  function remove() {
    if (confirm('Excluir este lançamento?')) {
      dispatch({ type: 'DELETE_TRANSACTION', id: transaction.id })
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Editar lançamento</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <div className="text-xs text-gray-500 mb-1">Valor</div>
            <div className="text-xl font-bold text-gray-900">{formatCurrency(transaction.amount)}</div>
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1">Descrição</label>
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nu-purple/30"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-2">Categoria</label>
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                    category === cat.id
                      ? 'border-nu-purple bg-nu-light text-nu-purple font-medium'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span className="truncate">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2 px-5 pb-5">
          <button onClick={remove} className="btn-ghost text-red-500 hover:bg-red-50 flex-1">Excluir</button>
          <button onClick={save} className="btn-primary flex-1">Salvar</button>
        </div>
      </div>
    </div>
  )
}
