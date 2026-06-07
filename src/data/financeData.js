// Dados iniciais do módulo "Finanças", extraídos da aba "💰 FINANÇAS 2026"
// da planilha pessoal do usuário (contas/despesas e receitas mês a mês).
import { monthKey } from '../utils/finance'

function buildValues(year, monthlyValues) {
  const values = {}
  monthlyValues.forEach((v, i) => {
    if (v !== null && v !== undefined) values[monthKey(year, i)] = v
  })
  return values
}

function buildAccounts(prefix, year, list) {
  return list.map(([name, monthlyValues], i) => ({
    id: `${prefix}_${i + 1}`,
    name,
    values: buildValues(year, monthlyValues),
  }))
}

// Cada array de valores segue Jan→Dez de 2026; `null` = sem lançamento no mês.
export const INITIAL_FINANCES = {
  expenses: buildAccounts('exp', 2026, [
    ['Cartão de Crédito - Nubank',          [5172.69, 4376.03, 4320.33, 3388.68, 4571.04, 5836.25, 2396.02, 1180.23, 1160.89, 1160.89, 1001.29, 294.88]],
    ['Cartão de Crédito - PagBank',         [null, null, null, 126.40, null, 98.90, 0, 0, 0, 0, 0, 0]],
    ['Petlove',                             [null, null, null, null, null, null, 109.10, 109.10, 109.10, 109.10, 109.10, 109.10]],
    ['Celular Isabele',                     [null, null, null, null, null, null, 100, 100, 100, 100, 100, 100]],
    ['Móveis Mãe Isa (Março/2027)',         [null, null, null, 461.11, 461.11, 461.11, 461.11, 461.11, 461.11, 461.11, 461.11, 461.11]],
    ['Empréstimo Móveis Mãe Isa (48x)',     [null, null, null, 225.30, 224.32, 225.30, 225.30, 225.30, 225.30, 225.30, 225.30, 225.30]],
    ['Empréstimo SIM',                      [null, null, null, null, null, 444.62, 444.62, 444.62, 444.62, null, null, null]],
    ['Condomínio',                          [933, 910.47, 944.83, 920.98, 916.20, 940, 940, 940, 940, 940, 940, 940]],
    ['Vivo',                                [320, 319.87, 319.87, 329.87, 329.87, 319.87, 319.87, 319.87, 319.87, 319.87, 319.87, 319.87]],
    ['Gás',                                 [73.27, 53.91, 53.51, 59.27, 53.71, 60, 60, 60, 60, 60, 60, 60]],
    ['Enel',                                [178.90, 168.10, 176.63, 156.59, 174.24, 170, 170, 170, 170, 170, 170, 170]],
    ['Net Mãe Isa',                         [120, 119.34, 116.36, 130.04, 130.04, 120, 120, 120, 120, 120, 120, 120]],
    ['Psicóloga',                           [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
    ['C&A',                                 [116.65, 293.65, 221.65, 104.99, 104.99, null, null, null, null, null, null, null]],
    ['Outros',                              [null, null, null, null, null, -200, null, null, null, null, null, null]],
  ]),
  revenues: buildAccounts('rev', 2026, [
    ['Férias / PLR / Ajuda Isa',                [90, 480, null, 830, null, 1300, 500, null, null, null, null, null]],
    ['Salário + Estacionamento',                [5550, 5550, 5654.66, 5500, 5500, 5650, 5650, 5650, 5650, 5650, 5650, 5650]],
    ['Aluguéis + Parte do Sítio até 06/28',     [1250, 300, null, -426.77, null, 1868.40, 2348.40, 2348.40, 2348.40, 2348.40, 2348.40, 2348.40]],
  ]),
}
