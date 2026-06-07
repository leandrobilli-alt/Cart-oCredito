// Dados iniciais extraídos da aba "Finanças 2026" da planilha do usuário.
// `null` representa um mês sem lançamento (em branco na planilha).
const YEAR = 2026

function vals(arr) {
  const out = {}
  arr.forEach((v, i) => {
    if (v !== null) out[`${YEAR}-${String(i + 1).padStart(2, '0')}`] = v
  })
  return out
}

export const SEED_EXPENSES = [
  { id: 'nubank', name: 'Cartão de Crédito - Nubank', values: vals([5172.69, 4376.03, 4320.33, 3388.68, 4571.04, 5836.25, 2396.02, 1180.23, 1160.89, 1160.89, 1001.29, 294.88]) },
  { id: 'pagbank', name: 'Cartão de Crédito - PagBank', values: vals([null, null, null, 126.40, null, 98.90, 0, 0, 0, 0, 0, 0]) },
  { id: 'petlove', name: 'Petlove', values: vals([null, null, null, null, null, null, 109.10, 109.10, 109.10, 109.10, 109.10, 109.10]) },
  { id: 'celular-isabele', name: 'Celular Isabele', values: vals([null, null, null, null, null, null, 100, 100, 100, 100, 100, 100]) },
  { id: 'moveis-mae-isa', name: 'Móveis Mãe Isa (Março/2027)', values: vals([null, null, null, 461.11, 461.11, 461.11, 461.11, 461.11, 461.11, 461.11, 461.11, 461.11]) },
  { id: 'emprestimo-moveis-mae-isa', name: 'Empréstimo Móveis Mãe Isa (48x)', values: vals([null, null, null, 225.30, 224.32, 225.30, 225.30, 225.30, 225.30, 225.30, 225.30, 225.30]) },
  { id: 'emprestimo-sim', name: 'Empréstimo SIM', values: vals([null, null, null, null, null, 444.62, 444.62, 444.62, 444.62, null, null, null]) },
  { id: 'condominio', name: 'Condomínio', values: vals([933, 910.47, 944.83, 920.98, 916.20, 940, 940, 940, 940, 940, 940, 940]) },
  { id: 'vivo', name: 'Vivo', values: vals([320, 319.87, 319.87, 329.87, 329.87, 319.87, 319.87, 319.87, 319.87, 319.87, 319.87, 319.87]) },
  { id: 'gas', name: 'Gás', values: vals([73.27, 53.91, 53.51, 59.27, 53.71, 60, 60, 60, 60, 60, 60, 60]) },
  { id: 'enel', name: 'Enel', values: vals([178.90, 168.10, 176.63, 156.59, 174.24, 170, 170, 170, 170, 170, 170, 170]) },
  { id: 'net-mae-isa', name: 'Net Mãe Isa', values: vals([120, 119.34, 116.36, 130.04, 130.04, 120, 120, 120, 120, 120, 120, 120]) },
  { id: 'psicologa', name: 'Psicóloga', values: vals([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]) },
  { id: 'cea', name: 'C&A', values: vals([116.65, 293.65, 221.65, 104.99, 104.99, null, null, null, null, null, null, null]) },
  { id: 'outros', name: 'Outros', values: vals([null, null, null, null, null, -200, null, null, null, null, null, null]) },
]

export const SEED_REVENUES = [
  { id: 'ferias-plr-ajuda-isa', name: 'Férias / PLR / Ajuda Isa', values: vals([90, 480, null, 830, null, 1300, 500, null, null, null, null, null]) },
  { id: 'salario-estacionamento', name: 'Salário + Estacionamento', values: vals([5550, 5550, 5654.66, 5500, 5500, 5650, 5650, 5650, 5650, 5650, 5650, 5650]) },
  { id: 'alugueis-sitio', name: 'Aluguéis + Parte do Sítio até 06/28', values: vals([1250, 300, null, -426.77, null, 1868.40, 2348.40, 2348.40, 2348.40, 2348.40, 2348.40, 2348.40]) },
]
