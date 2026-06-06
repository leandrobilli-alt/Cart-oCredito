import { getCategoryById } from '../data/categories'
import { formatCurrency, formatDate } from '../utils/format'

export default function TransactionItem({ transaction, onClick }) {
  const cat = getCategoryById(transaction.category)
  const isRefund = transaction.amount < 0

  return (
    <button
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
      onClick={() => onClick?.(transaction)}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
        style={{ backgroundColor: cat.color + '20' }}
      >
        {cat.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 truncate">{transaction.description}</div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-gray-400">{formatDate(transaction.date)}</span>
          {transaction.installment && (
            <span className="text-xs text-gray-400">· Parcela {transaction.installment}</span>
          )}
        </div>
      </div>
      <div className={`text-sm font-semibold flex-shrink-0 ${isRefund ? 'text-green-600' : 'text-gray-900'}`}>
        {isRefund ? '-' : ''}{formatCurrency(Math.abs(transaction.amount))}
      </div>
    </button>
  )
}
