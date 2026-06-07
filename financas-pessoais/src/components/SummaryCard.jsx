import { TrendingUp, TrendingDown } from 'lucide-react'
import { formatCurrency } from '../utils/format'

export default function SummaryCard({ receitas, despesas }) {
  const saldo = receitas - despesas
  const positive = saldo >= 0

  return (
    <div
      className="rounded-3xl p-6 text-white shadow-lg shadow-gray-200"
      style={{
        background: positive
          ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
          : 'linear-gradient(135deg, #e11d48 0%, #9f1239 100%)',
      }}
    >
      <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider font-medium opacity-80">
        {positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        {positive ? 'Sobrou no mês' : 'Faltou no mês'}
      </div>
      <div className="text-4xl font-bold mt-1.5 tabular-nums">{formatCurrency(Math.abs(saldo))}</div>

      <div className="flex gap-8 mt-5 pt-4 border-t border-white/25">
        <div>
          <div className="text-[11px] uppercase tracking-wide opacity-70">Receitas</div>
          <div className="font-semibold text-lg tabular-nums">{formatCurrency(receitas)}</div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wide opacity-70">Despesas</div>
          <div className="font-semibold text-lg tabular-nums">{formatCurrency(despesas)}</div>
        </div>
      </div>
    </div>
  )
}
