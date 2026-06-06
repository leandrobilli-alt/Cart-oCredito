// Fatura Nubank – Leandro Longo Billi – Maio 2026
// Período: 21/ABR/2026 a 21/MAI/2026 · Vencimento: 28/MAI/2026

let _id = 1
const id = () => String(_id++)

export const INITIAL_INVOICE = {
  id: 'inv-2026-05',
  month: '2026-05',
  label: 'Maio 2026',
  dueDate: '2026-05-28',
  closeDate: '2026-05-21',
  totalAmount: 4571.04,
  totalPurchases: 8174.25,
  creditLimit: 29750.00,
  status: 'closed',
}

export const INITIAL_TRANSACTIONS = [
  // ── 21 ABR – parcelas e compras do fechamento ──
  { id: id(), date: '2026-04-21', description: 'Pet Love*Clube',           amount:   2.90, category: 'pet',         installment: '2/12', invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-04-21', description: 'Agencia Zait (App)',        amount:   9.91, category: 'assinaturas', installment: '5/12', invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-04-21', description: 'Inditex Brasil',            amount: 196.50, category: 'vestuario',   installment: '3/3',  invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-04-21', description: 'Centauro',                  amount: 174.99, category: 'vestuario',   installment: '2/2',  invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-04-21', description: 'Breeds Petshop',            amount:  86.89, category: 'pet',         installment: '2/2',  invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-04-21', description: 'Estratégia Concursos',      amount: 329.89, category: 'educacao',    installment: '6/12', invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-04-21', description: 'Alexandra Basto',           amount:  19.34, category: 'saude',       installment: '9/12', invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-04-21', description: 'IBMEC',                     amount: 223.92, category: 'educacao',    installment: '6/12', invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-04-21', description: 'Treino Lapa Team',          amount:  39.80, category: 'saude',       installment: '6/12', invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-04-21', description: 'Lojas Suvinil',             amount: 104.66, category: 'casa',        installment: '6/6',  invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-04-21', description: 'Ordem dos Advogados (OAB)', amount: 112.80, category: 'trabalho',    installment: '4/10', invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-04-21', description: 'Monopoly Comércio',         amount: 163.84, category: 'casa',        installment: '2/3',  invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-04-21', description: 'Padovani Pizzaria',         amount: 152.49, category: 'alimentacao',                      invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-04-21', description: 'Petlove',                   amount: 186.08, category: 'pet',         installment: '2/3',  invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-04-21', description: 'Amazon Marketplace',        amount:  64.96, category: 'compras',     installment: '3/3',  invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-04-21', description: 'Amazon',                    amount: 209.99, category: 'compras',     installment: '2/10', invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-04-21', description: 'Uber',                      amount:  29.98, category: 'transporte',                       invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-04-21', description: 'Grupo Madero',              amount:  81.40, category: 'alimentacao',                      invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-04-21', description: 'Pg *Cns',                   amount: 147.11, category: 'outros',      installment: '3/3',  invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-04-21', description: 'Shopee – Hatteker',         amount: 114.78, category: 'compras',     installment: '3/5',  invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-04-21', description: 'Ecoassist',                 amount:  84.00, category: 'casa',        installment: '2/2',  invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-04-21', description: 'Casa do Pão de Queijo',     amount:  19.90, category: 'alimentacao',                      invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-04-21', description: 'Hospital Vet São Pedro',    amount: 221.25, category: 'pet',         installment: '2/2',  invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-04-21', description: 'Petlove',                   amount: 170.68, category: 'pet',         installment: '2/3',  invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-04-21', description: 'Inditex Brasil',            amount: 249.75, category: 'vestuario',   installment: '2/2',  invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-04-21', description: 'Kiwify – Blackbruzz',       amount: 116.01, category: 'educacao',    installment: '6/7',  invoiceId: 'inv-2026-05' },

  // ── 22 ABR ──
  { id: id(), date: '2026-04-22', description: 'Petlove',                   amount: 110.67, category: 'pet',                              invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-04-22', description: 'Baciodilatte',              amount:  24.95, category: 'alimentacao',                      invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-04-22', description: 'Auto Shopping SP',          amount:  17.50, category: 'transporte',                       invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-04-22', description: 'Vend Perto Machines',       amount:  28.97, category: 'outros',                           invoiceId: 'inv-2026-05' },

  // ── 23 ABR ──
  { id: id(), date: '2026-04-23', description: 'Swift Vila Prudente',       amount:  16.90, category: 'supermercado',                     invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-04-23', description: 'Supermercado Yamauchi',     amount: 272.27, category: 'supermercado',                     invoiceId: 'inv-2026-05' },

  // ── 24 ABR ──
  { id: id(), date: '2026-04-24', description: 'Produtosuol',               amount:  37.80, category: 'outros',                           invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-04-24', description: 'Breeds Petshop',            amount: 181.97, category: 'pet',                              invoiceId: 'inv-2026-05' },

  // ── 25 ABR ──
  { id: id(), date: '2026-04-25', description: 'Padovani Pizzaria',         amount: 121.49, category: 'alimentacao',                      invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-04-25', description: 'Vend Perto Machines',       amount:  28.97, category: 'outros',                           invoiceId: 'inv-2026-05' },

  // ── 26 ABR ──
  { id: id(), date: '2026-04-26', description: 'Padovani Pizzaria',         amount: 100.99, category: 'alimentacao',                      invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-04-26', description: 'Amazon',                    amount:  69.80, category: 'compras',                          invoiceId: 'inv-2026-05' },

  // ── 27 ABR ──
  { id: id(), date: '2026-04-27', description: 'Shopee – Papelaria Silva',  amount:  43.20, category: 'compras',                          invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-04-27', description: 'Sonda Supermercado',        amount: 102.36, category: 'supermercado',                     invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-04-27', description: 'Shopee',                    amount:  83.85, category: 'compras',                          invoiceId: 'inv-2026-05' },

  // ── 28 ABR ──
  { id: id(), date: '2026-04-28', description: 'Editora / Livraria Conf.',  amount: 462.50, category: 'educacao',    installment: '1/3',  invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-04-28', description: 'COMGÁS',                    amount: 105.13, category: 'contas',                           invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-04-28', description: 'ENEL SP',                   amount:  27.67, category: 'contas',                           invoiceId: 'inv-2026-05' },

  // ── 29 ABR ──
  { id: id(), date: '2026-04-29', description: 'Gêmeos Esfiha',             amount:  85.68, category: 'alimentacao',                      invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-04-29', description: 'Vend Perto Machines',       amount:  37.96, category: 'outros',                           invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-04-29', description: 'Estorno – Estratégia',      amount: -131.95, category: 'educacao',                        invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-04-29', description: 'Google',                    amount:  12.50, category: 'assinaturas',                      invoiceId: 'inv-2026-05' },

  // ── 30 ABR ──
  { id: id(), date: '2026-04-30', description: 'Estorno – Shopee',          amount: -13.90, category: 'compras',                          invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-04-30', description: 'Desafio EDV',               amount: 105.99, category: 'educacao',    installment: '1/3',  invoiceId: 'inv-2026-05' },

  // ── 01 MAI ──
  { id: id(), date: '2026-05-01', description: 'Raia (Farmácia)',            amount:  62.21, category: 'saude',       installment: '1/2',  invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-05-01', description: 'Lojas Mel',                  amount:  49.97, category: 'vestuario',                        invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-05-01', description: 'ODP Tech',                   amount:  32.68, category: 'trabalho',                         invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-05-01', description: 'Armarinhos Kinjo',           amount:  51.93, category: 'casa',                             invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-05-01', description: 'DLKNet / Internet',          amount:  23.30, category: 'contas',                           invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-05-01', description: 'Smart Coworking',            amount:  99.00, category: 'trabalho',                         invoiceId: 'inv-2026-05' },

  // ── 02 MAI ──
  { id: id(), date: '2026-05-02', description: 'ODP Tech',                   amount:  30.88, category: 'trabalho',                         invoiceId: 'inv-2026-05' },

  // ── 03 MAI ──
  { id: id(), date: '2026-05-03', description: 'Petlove Saúde',              amount: 109.10, category: 'pet',                              invoiceId: 'inv-2026-05' },

  // ── 04 MAI ──
  { id: id(), date: '2026-05-04', description: 'Petlove',                    amount: 141.35, category: 'pet',                              invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-05-04', description: 'VIVO',                       amount: 106.53, category: 'contas',                           invoiceId: 'inv-2026-05' },

  // ── 06 MAI ──
  { id: id(), date: '2026-05-06', description: 'Limite → Conta Nubank',      amount:  51.38, category: 'financeiro',                       invoiceId: 'inv-2026-05' },

  // ── 07 MAI ──
  { id: id(), date: '2026-05-07', description: 'Uber',                       amount:  19.98, category: 'transporte',                       invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-05-07', description: 'Vend Perto Machines',        amount:  32.96, category: 'outros',                           invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-05-07', description: 'Gêmeos Esfiha',              amount:  57.50, category: 'alimentacao',                      invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-05-07', description: 'Uber',                       amount:  43.26, category: 'transporte',                       invoiceId: 'inv-2026-05' },

  // ── 08 MAI ──
  { id: id(), date: '2026-05-08', description: 'Nu Seguro Lar',              amount:  13.63, category: 'seguros',                          invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-05-08', description: 'Raia (Farmácia)',             amount:  41.25, category: 'saude',                            invoiceId: 'inv-2026-05' },

  // ── 10 MAI ──
  { id: id(), date: '2026-05-10', description: 'Kiwify – SPE',               amount:  72.15, category: 'educacao',    installment: '1/12', invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-05-10', description: 'Uber',                       amount:  14.97, category: 'transporte',                       invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-05-10', description: 'Raia (Farmácia)',             amount:  10.99, category: 'saude',                            invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-05-10', description: 'Mooca Shopping',              amount: 167.23, category: 'vestuario',                        invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-05-10', description: 'Casa do Ovo',                 amount:  36.00, category: 'supermercado',                     invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-05-10', description: 'Loja de Calçados Flex',       amount: 166.66, category: 'vestuario',   installment: '1/3',  invoiceId: 'inv-2026-05' },

  // ── 11 MAI ──
  { id: id(), date: '2026-05-11', description: 'Criminal Player',             amount:  97.00, category: 'assinaturas',                      invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-05-11', description: 'Gêmeos Esfiha',               amount:  77.90, category: 'alimentacao',                      invoiceId: 'inv-2026-05' },

  // ── 12 MAI ──
  { id: id(), date: '2026-05-12', description: 'Uber',                        amount:  32.97, category: 'transporte',                       invoiceId: 'inv-2026-05' },

  // ── 13 MAI ──
  { id: id(), date: '2026-05-13', description: 'Uber',                        amount:  34.98, category: 'transporte',                       invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-05-13', description: 'Fabiano Alves de Souza',      amount:  61.19, category: 'outros',                           invoiceId: 'inv-2026-05' },

  // ── 14 MAI ──
  { id: id(), date: '2026-05-14', description: 'Netflix',                     amount:  44.90, category: 'assinaturas',                      invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-05-14', description: 'Raia (Farmácia)',              amount:  99.58, category: 'saude',                            invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-05-14', description: 'Plano NuCel',                  amount:  45.00, category: 'contas',                           invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-05-14', description: 'Granno Doces e Pães',          amount:  37.10, category: 'alimentacao',                      invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-05-14', description: 'Supermercado Yamauchi',        amount:  40.79, category: 'supermercado',                     invoiceId: 'inv-2026-05' },

  // ── 15 MAI ──
  { id: id(), date: '2026-05-15', description: 'iFood',                        amount: 100.99, category: 'delivery',                         invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-05-15', description: 'Vend Perto Machines',          amount:  17.29, category: 'outros',                           invoiceId: 'inv-2026-05' },

  // ── 16 MAI ──
  { id: id(), date: '2026-05-16', description: 'Uber',                         amount: 132.95, category: 'transporte',                       invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-05-16', description: 'Breeds Petshop',               amount:  90.99, category: 'pet',         installment: '1/2',  invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-05-16', description: 'Uber',                         amount:  49.99, category: 'transporte',                       invoiceId: 'inv-2026-05' },

  // ── 17 MAI ──
  { id: id(), date: '2026-05-17', description: 'Shopping Mooca',               amount:  75.00, category: 'vestuario',                        invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-05-17', description: 'LJV Calçados',                 amount: 193.28, category: 'vestuario',   installment: '1/3',  invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-05-17', description: 'Petlove',                      amount: 164.42, category: 'pet',                              invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-05-17', description: 'iFood',                        amount:  78.81, category: 'delivery',                         invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-05-17', description: 'Lojas Renner',                 amount: 172.61, category: 'vestuario',   installment: '1/3',  invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-05-17', description: 'Uber',                         amount:  13.97, category: 'transporte',                       invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-05-17', description: '367 Park Bar',                 amount: 231.86, category: 'alimentacao',                      invoiceId: 'inv-2026-05' },

  // ── 18 MAI ──
  { id: id(), date: '2026-05-18', description: 'Petlove',                      amount: 100.56, category: 'pet',                              invoiceId: 'inv-2026-05' },

  // ── 19 MAI ──
  { id: id(), date: '2026-05-19', description: 'iFood',                        amount:  84.10, category: 'delivery',                         invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-05-19', description: 'Estorno – iFood',              amount:  -0.04, category: 'delivery',                         invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-05-19', description: 'Vend Perto Machines',          amount:  59.93, category: 'outros',                           invoiceId: 'inv-2026-05' },

  // ── 20 MAI ──
  { id: id(), date: '2026-05-20', description: 'iFood',                        amount: 121.99, category: 'delivery',                         invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-05-20', description: 'COMGÁS',                       amount: 130.28, category: 'contas',                           invoiceId: 'inv-2026-05' },
  { id: id(), date: '2026-05-20', description: 'Eletropaulo / ENEL',           amount:  59.56, category: 'contas',                           invoiceId: 'inv-2026-05' },
]

export const INITIAL_SETTINGS = {
  cardName: 'Nubank',
  ownerName: 'Leandro',
  creditLimit: 29750.00,
  closeDay: 21,
  dueDay: 28,
}
