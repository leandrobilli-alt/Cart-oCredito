import { format, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, eachWeekOfInterval, startOfMonth, endOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function formatDate(dateStr) {
  return format(parseISO(dateStr), "dd 'de' MMM", { locale: ptBR })
}

export function formatShortDate(dateStr) {
  return format(parseISO(dateStr), 'dd/MM', { locale: ptBR })
}

export function formatMonthYear(dateStr) {
  return format(parseISO(dateStr + '-01'), "MMM 'de' yyyy", { locale: ptBR })
}

export function formatWeekLabel(dateStr) {
  const d = parseISO(dateStr)
  const start = startOfWeek(d, { weekStartsOn: 1 })
  const end = endOfWeek(d, { weekStartsOn: 1 })
  return `${format(start, 'dd/MM')} – ${format(end, 'dd/MM')}`
}

export function groupByDay(transactions) {
  const map = {}
  transactions.forEach(t => {
    const day = t.date
    if (!map[day]) map[day] = { date: day, total: 0, count: 0 }
    if (t.amount > 0) {
      map[day].total += t.amount
      map[day].count++
    }
  })
  return Object.values(map).sort((a, b) => a.date.localeCompare(b.date))
}

export function groupByWeek(transactions) {
  const map = {}
  transactions.forEach(t => {
    const weekStart = format(startOfWeek(parseISO(t.date), { weekStartsOn: 1 }), 'yyyy-MM-dd')
    if (!map[weekStart]) map[weekStart] = { date: weekStart, total: 0, count: 0 }
    if (t.amount > 0) {
      map[weekStart].total += t.amount
      map[weekStart].count++
    }
  })
  return Object.values(map).sort((a, b) => a.date.localeCompare(b.date))
}

export function groupByMonth(transactions) {
  const map = {}
  transactions.forEach(t => {
    const month = t.date.slice(0, 7)
    if (!map[month]) map[month] = { date: month, total: 0, count: 0 }
    if (t.amount > 0) {
      map[month].total += t.amount
      map[month].count++
    }
  })
  return Object.values(map).sort((a, b) => a.date.localeCompare(b.date))
}

export function groupByCategory(transactions) {
  const map = {}
  transactions.forEach(t => {
    if (t.amount <= 0) return
    if (!map[t.category]) map[t.category] = 0
    map[t.category] += t.amount
  })
  return map
}

export function downloadCSV(transactions, filename = 'relatorio.csv') {
  const header = 'Data,Descrição,Categoria,Valor,Parcela\n'
  const rows = transactions.map(t =>
    `${t.date},"${t.description}",${t.category},${t.amount.toFixed(2)},${t.installment || ''}`
  ).join('\n')
  const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
