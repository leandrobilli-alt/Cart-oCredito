import { ChevronLeft, ChevronRight } from 'lucide-react'
import { MONTHS } from '../utils/months'

export default function MonthNav({ year, monthIndex, onPrev, onNext }) {
  return (
    <div className="flex items-center justify-between py-3">
      <button
        onClick={onPrev}
        aria-label="Mês anterior"
        className="w-11 h-11 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-500 hover:text-brand hover:border-brand/30 transition-colors active:scale-95"
      >
        <ChevronLeft size={22} />
      </button>
      <div className="text-center leading-tight">
        <div className="text-2xl font-bold text-gray-900">{MONTHS[monthIndex]}</div>
        <div className="text-sm text-gray-400">{year}</div>
      </div>
      <button
        onClick={onNext}
        aria-label="Próximo mês"
        className="w-11 h-11 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-500 hover:text-brand hover:border-brand/30 transition-colors active:scale-95"
      >
        <ChevronRight size={22} />
      </button>
    </div>
  )
}
