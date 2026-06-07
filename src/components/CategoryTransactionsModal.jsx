import { useMemo, useState } from 'react'
import { X } from 'lucide-react'
import { formatCurrency } from '../utils/format'
import TransactionItem from './TransactionItem'
import EditTransactionModal from './EditTransactionModal'

export default function CategoryTransactionsModal({ category, transactions, onClose }) {
  const [selected, setSelected] = useState(null)

  const items = useMemo(() =>
    transactions
      .filter(t => t.category === category.id)
      .sort((a, b) => b.date.localeCompare(a.date)),
    [transactions, category]
  )
  const total = items.reduce((s, t) => s + t.amount, 0)

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
        <div className="bg-white rounded-2xl w-full max-w-md shadow-xl max-h-[85vh] flex flex-col">
          <div className="flex items-center gap-3 px-5 pt-5 pb-3 border-b border-gray-100 flex-shrink-0">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
              style={{ backgroundColor: category.color + '20' }}
            >
              {category.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-semibold text-gray-900 truncate">{category.name}</h2>
              <p className="text-xs text-gray-400">
                {items.length} lançamento{items.length !== 1 ? 's' : ''} · {formatCurrency(total)}
              </p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 flex-shrink-0"><X size={20} /></button>
          </div>

          <div className="overflow-y-auto flex-1">
            {items.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {items.map(t => (
                  <TransactionItem key={t.id} transaction={t} onClick={setSelected} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-10">Nenhum lançamento nessa categoria.</p>
            )}
          </div>
        </div>
      </div>

      {selected && <EditTransactionModal transaction={selected} onClose={() => setSelected(null)} />}
    </>
  )
}
