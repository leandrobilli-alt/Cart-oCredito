import { Plus } from 'lucide-react'
import { MONTHS_ABBR, monthKey, hasValue, accountYearTotal, monthTotal, yearTotal, formatCompact } from '../utils/finance'

const NAME_COL = 'w-28'
const MONTH_COL = 'w-14'
const TOTAL_COL = 'w-16'

export default function FinanceTable({ kind, accounts, year, onCellClick, onAccountClick, onAddAccount }) {
  const totalLabel = kind === 'expense' ? 'Despesas' : 'Receitas'

  return (
    <div>
      <div className="overflow-x-auto scrollbar-hide">
        <div className="min-w-max">
          {/* Cabeçalho */}
          <div className="flex border-b border-gray-100">
            <div className={`sticky left-0 z-10 bg-white ${NAME_COL} flex-shrink-0 px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wide`}>
              Conta
            </div>
            {MONTHS_ABBR.map(m => (
              <div key={m} className={`${MONTH_COL} flex-shrink-0 text-right px-1.5 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wide`}>
                {m}
              </div>
            ))}
            <div className={`${TOTAL_COL} flex-shrink-0 text-right px-2 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wide`}>
              Total
            </div>
          </div>

          {/* Linhas de contas */}
          {accounts.map(acc => (
            <div key={acc.id} className="flex border-b border-gray-50 text-xs group">
              <button
                onClick={() => onAccountClick(acc)}
                className={`sticky left-0 z-10 bg-white group-hover:bg-gray-50 ${NAME_COL} flex-shrink-0 px-4 py-2.5 text-left font-medium text-gray-700 truncate transition-colors`}
                title={acc.name}
              >
                {acc.name}
              </button>
              {MONTHS_ABBR.map((_, i) => {
                const v = acc.values[monthKey(year, i)]
                const filled = hasValue(v)
                return (
                  <button
                    key={i}
                    onClick={() => onCellClick(acc, i)}
                    className={`${MONTH_COL} flex-shrink-0 text-right px-1.5 py-2.5 tabular-nums hover:bg-nu-light/60 transition-colors ${
                      !filled ? 'text-gray-300' : v < 0 ? 'text-red-500 font-medium' : 'text-gray-700'
                    }`}
                  >
                    {formatCompact(v)}
                  </button>
                )
              })}
              <div className={`${TOTAL_COL} flex-shrink-0 text-right px-2 py-2.5 font-semibold text-gray-800 tabular-nums`}>
                {formatCompact(accountYearTotal(acc, year))}
              </div>
            </div>
          ))}

          {/* Linha de totais */}
          <div className="flex text-xs font-bold bg-gray-50">
            <div className={`sticky left-0 z-10 bg-gray-50 ${NAME_COL} flex-shrink-0 px-4 py-2.5 text-gray-700 truncate`}>
              {totalLabel}
            </div>
            {MONTHS_ABBR.map((_, i) => (
              <div key={i} className={`${MONTH_COL} flex-shrink-0 text-right px-1.5 py-2.5 text-gray-700 tabular-nums`}>
                {formatCompact(monthTotal(accounts, year, i))}
              </div>
            ))}
            <div className={`${TOTAL_COL} flex-shrink-0 text-right px-2 py-2.5 text-nu-purple tabular-nums`}>
              {formatCompact(yearTotal(accounts, year))}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onAddAccount}
        className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-nu-purple hover:bg-nu-light/50 transition-colors py-3 border-t border-gray-50"
      >
        <Plus size={14} /> {kind === 'expense' ? 'Nova conta' : 'Nova receita'}
      </button>
    </div>
  )
}
