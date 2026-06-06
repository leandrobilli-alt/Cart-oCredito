import { useState } from 'react'
import { X, Trash2, Plus } from 'lucide-react'
import { useApp, useCategories } from '../context/AppContext'

const EMOJI_SUGGESTIONS = ['🍽️','🛒','🛵','🚗','🐾','👗','📚','💊','🏠','📺','💡','💼','🛍️','🔒','💰','❓','🎮','✈️','🎓','💈','🏋️','🎁','🍺','☕','🐶','🐱','🌿','🧴','🎵','📱']

let nextCatId = Date.now()

export default function CategoryManagerModal({ onClose }) {
  const { dispatch, state } = useApp()
  const { categories } = useCategories()
  const [form, setForm] = useState({ name: '', icon: '❓', color: '#8A05BE' })
  const [error, setError] = useState('')

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  function usageCount(catId) {
    return state.transactions.filter(t => t.category === catId).length
  }

  function handleDelete(cat) {
    const count = usageCount(cat.id)
    const msg = count > 0
      ? `Excluir a categoria "${cat.name}"?\n\n${count} lançamentos usam essa categoria e serão movidos para "Outros".`
      : `Excluir a categoria "${cat.name}"?`

    if (!window.confirm(msg)) return

    // Reclassifica lançamentos para "outros"
    if (count > 0) {
      state.transactions
        .filter(t => t.category === cat.id)
        .forEach(t => dispatch({ type: 'UPDATE_TRANSACTION', payload: { ...t, category: 'outros' } }))
    }
    dispatch({ type: 'DELETE_CATEGORY', id: cat.id })
  }

  function handleAdd(e) {
    e.preventDefault()
    if (!form.name.trim()) { setError('Informe um nome.'); return }
    const id = 'cat_' + String(nextCatId++)
    dispatch({
      type: 'ADD_CATEGORY',
      payload: { id, name: form.name.trim(), icon: form.icon, color: form.color },
    })
    setForm({ name: '', icon: '❓', color: '#8A05BE' })
    setError('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-base font-semibold text-gray-900">Gerenciar categorias</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-5">

          {/* Lista de categorias */}
          <div className="space-y-1">
            {categories.map(cat => {
              const count = usageCount(cat.id)
              return (
                <div
                  key={cat.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 group"
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                    style={{ backgroundColor: cat.color + '20' }}
                  >
                    {cat.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800">{cat.name}</div>
                    <div className="text-xs text-gray-400">{count} lançamento{count !== 1 ? 's' : ''}</div>
                  </div>
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                  <button
                    onClick={() => handleDelete(cat)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-red-500 p-1 flex-shrink-0"
                    title="Excluir categoria"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              )
            })}
          </div>

          {/* Formulário nova categoria */}
          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Nova categoria</h3>
            <form onSubmit={handleAdd} className="space-y-3">

              {/* Emoji */}
              <div>
                <label className="text-xs text-gray-500 block mb-2">Ícone</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {EMOJI_SUGGESTIONS.map(e => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => set('icon', e)}
                      className={`w-9 h-9 rounded-lg text-lg transition-all ${
                        form.icon === e
                          ? 'bg-nu-light ring-2 ring-nu-purple'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  maxLength={2}
                  placeholder="Ou cole um emoji aqui"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nu-purple/30"
                  value={form.icon}
                  onChange={e => set('icon', e.target.value)}
                />
              </div>

              {/* Nome + Cor */}
              <div className="grid grid-cols-[1fr_auto] gap-2 items-end">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Nome</label>
                  <input
                    type="text"
                    placeholder="Ex: Viagem"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nu-purple/30"
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Cor</label>
                  <input
                    type="color"
                    className="w-10 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                    value={form.color}
                    onChange={e => set('color', e.target.value)}
                  />
                </div>
              </div>

              {/* Preview */}
              {form.name && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Prévia:</span>
                  <span
                    className="inline-flex items-center gap-1 rounded-full text-xs px-2.5 py-1 font-medium"
                    style={{ backgroundColor: form.color + '20', color: form.color }}
                  >
                    {form.icon} {form.name}
                  </span>
                </div>
              )}

              {error && <p className="text-xs text-red-500">{error}</p>}

              <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
                <Plus size={15} /> Adicionar categoria
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  )
}
