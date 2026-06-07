export const MONTHS_FULL = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

export const MONTHS_ABBR = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

export function monthKey(year, monthIndex) {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}`
}

export function hasValue(value) {
  return value !== null && value !== undefined
}

export function accountYearTotal(account, year) {
  return MONTHS_ABBR.reduce((sum, _, i) => {
    const v = account.values[monthKey(year, i)]
    return hasValue(v) ? sum + v : sum
  }, 0)
}

export function monthTotal(accounts, year, monthIndex) {
  const key = monthKey(year, monthIndex)
  return accounts.reduce((sum, a) => {
    const v = a.values[key]
    return hasValue(v) ? sum + v : sum
  }, 0)
}

export function yearTotal(accounts, year) {
  return MONTHS_ABBR.reduce((sum, _, i) => sum + monthTotal(accounts, year, i), 0)
}

// Anos presentes nos dados (a partir das chaves "AAAA-MM" de todas as contas)
export function yearsInFinances(finances) {
  const set = new Set()
  ;[...finances.expenses, ...finances.revenues].forEach(acc => {
    Object.keys(acc.values).forEach(k => set.add(Number(k.slice(0, 4))))
  })
  if (!set.size) set.add(new Date().getFullYear())
  return [...set].sort((a, b) => a - b)
}

// Formato compacto sem casas decimais, usado nas células da grade
export function formatCompact(value) {
  if (!hasValue(value)) return '–'
  return value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })
}
