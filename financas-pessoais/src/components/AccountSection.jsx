import { Plus } from 'lucide-react'
import { formatCurrency } from '../utils/format'

export default function AccountSection({
  title, subtitle, icon: Icon, accent, accounts, monthKey, addLabel,
  onTapValue, onTapName, onAdd,
}) {
  const total = accounts.reduce((sum, acc) => sum + (acc.values[monthKey] || 0), 0)
  const isRose = accent === 'rose'

  return (
    <section className="mt-7">
      <div className="flex items-end justify-between mb-3 px-0.5">
        <div className="flex items-center gap-2">
          {Icon && (
            <span className={`w-8 h-8 rounded-xl flex items-center justify-center ${isRose ? 'bg-rose-50 text-rose-500' : 'bg-brand-soft text-brand-dark'}`}>
              <Icon size={16} />
            </span>
          )}
          <div>
            <h3 className="font-bold text-gray-900 leading-tight">{title}</h3>
            <p className="text-xs text-gray-400">{subtitle}</p>
          </div>
        </div>
        <div className={`text-right font-bold tabular-nums ${isRose ? 'text-rose-600' : 'text-brand-dark'}`}>
          {formatCurrency(total)}
        </div>
      </div>

      {accounts.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-8">Nenhuma conta cadastrada ainda.</p>
      )}

      <div className="space-y-3">
        {accounts.map(acc => {
          const val = acc.values[monthKey]
          const hasValue = val !== undefined && val !== null
          return (
            <div key={acc.id} className="card flex items-center gap-3">
              <button
                onClick={() => onTapName(acc)}
                className="flex-1 min-w-0 text-left group"
                title="Editar nome ou excluir conta"
              >
                <div className="font-semibold text-gray-800 group-hover:text-brand-dark transition-colors leading-snug">{acc.name}</div>
                <div className="text-[11px] text-gray-400">Toque para editar conta</div>
              </button>
              <button
                onClick={() => onTapValue(acc)}
                className={`flex-shrink-0 px-3.5 py-2.5 rounded-xl font-bold tabular-nums transition-colors ${
                  hasValue
                    ? `text-base ${isRose ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' : 'bg-brand-soft text-brand-dark hover:bg-brand-light'}`
                    : 'text-sm font-medium text-gray-300 hover:text-gray-400 hover:bg-gray-50'
                }`}
              >
                {hasValue ? formatCurrency(val) : (
                  <span className="flex items-center gap-1"><Plus size={14} /> Adicionar</span>
                )}
              </button>
            </div>
          )
        })}
      </div>

      <button
        onClick={onAdd}
        className={`mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed text-sm font-medium transition-colors ${
          isRose
            ? 'border-rose-200 text-rose-500 hover:bg-rose-50'
            : 'border-brand/30 text-brand-dark hover:bg-brand-soft'
        }`}
      >
        <Plus size={16} /> {addLabel}
      </button>
    </section>
  )
}
