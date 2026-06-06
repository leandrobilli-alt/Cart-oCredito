import { useState, useRef, useCallback } from 'react'
import { X, Upload, FileText, Check, AlertCircle, ChevronDown } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { CATEGORIES, getCategoryById } from '../data/categories'

const PT_MONTHS = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
]
const YEARS = [2024, 2025, 2026, 2027, 2028]

// ── Auto-categorização por palavras-chave ──────────────────────────────────
const KEYWORD_MAP = [
  { cat: 'delivery',     kw: ['ifood','rappi','james','delivery'] },
  { cat: 'transporte',   kw: ['uber','uberrides','99taxi','cabify','dl *uber','dl*uber','99app','blablacar'] },
  { cat: 'pet',          kw: ['petlove','petshop','petz','cobasi','vet','breeds','animais','pet love'] },
  { cat: 'assinaturas',  kw: ['netflix','spotify','youtube','amazon prime','disney','hbo','globoplay','deezer','google one','apple','paramount','crunchyroll','kiwify','hotmart'] },
  { cat: 'supermercado', kw: ['supermercado','mercado','carrefour','pao de acucar','extra ','atacadao','walmart','yamauchi','swift','sonda','hortifruti','bergamini','zaffari'] },
  { cat: 'alimentacao',  kw: ['pizzaria','hamburguer','lanchonete','padaria','acougue','esfiha','madero','outback','bar ','restaur','cafe','bakery','subway','mcdonalds','burger','doces','granno','gemeos','padovani','park bar','ifood'] },
  { cat: 'saude',        kw: ['farmacia','drogaria','raia','ultrafarma','pacheco','nissei','droga','hospital','clinica','medic','academia','gym','fitness','treinolapa','alexandra basto'] },
  { cat: 'compras',      kw: ['amazon','shopee','mercado livre','aliexpress','magazine','americanas','casas bahia','submarino'] },
  { cat: 'educacao',     kw: ['escola','universidade','ibmec','anhanguera','curso','livraria','editora','estrategia','kiwify','estudo','enem','concurso','desafioedv'] },
  { cat: 'contas',       kw: ['comgas','enel','eletropaulo','sabesp','vivo','tim','claro','oi ','internet','nucell','nucel','dlknet','light ','cemig','copel','cpfl','telefon'] },
  { cat: 'vestuario',    kw: ['renner','zara','inditex','centauro','c&a','hering','riachuelo','marisa','vivara','arezzo','calcado','calcad','shopping','lojas mel','lojas ren','ljv'] },
  { cat: 'trabalho',     kw: ['coworking','oab','advogado','escritorio','odptech','smart cowork','ordem dos'] },
  { cat: 'seguros',      kw: ['seguro','nu seguro'] },
  { cat: 'financeiro',   kw: ['iof','juros','rotativo','parcelamento de fatura'] },
  { cat: 'casa',         kw: ['suvinil','leroy','telha','material de constru','armarinhos','monopoly','ecoassist','casa do'] },
]

function guessCategory(description) {
  const lower = description.toLowerCase()
  for (const { cat, kw } of KEYWORD_MAP) {
    if (kw.some(k => lower.includes(k))) return cat
  }
  return 'outros'
}

// ── Parser de CSV flexível ─────────────────────────────────────────────────
function parseCSVLine(line) {
  const result = []
  let cur = ''
  let inQuote = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') { inQuote = !inQuote; continue }
    if (ch === ',' && !inQuote) { result.push(cur.trim()); cur = ''; continue }
    cur += ch
  }
  result.push(cur.trim())
  return result
}

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim() && !l.startsWith('#'))
  if (lines.length < 2) return { error: 'Arquivo sem dados.' }

  const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''))

  // Detecta índices das colunas
  const dateIdx   = headers.findIndex(h => /^dat/.test(h) || h === 'date')
  const descIdx   = headers.findIndex(h => /titulo|descri|title|nome|estabelecimento/.test(h))
  const amountIdx = headers.findIndex(h => /valor|amount|preco/.test(h))
  const catIdx    = headers.findIndex(h => /categ/.test(h))

  if (dateIdx === -1 || amountIdx === -1) {
    return { error: 'Não encontrei as colunas "Data" e "Valor". Verifique o formato do arquivo.' }
  }

  const transactions = []
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i])
    if (cols.length < 2) continue

    const rawDate   = cols[dateIdx]?.replace(/\//g, '-').trim() || ''
    const rawDesc   = (descIdx >= 0 ? cols[descIdx] : cols[1])?.trim() || `Lançamento ${i}`
    const rawAmount = cols[amountIdx]?.trim().replace(/\s/g, '').replace(',', '.') || '0'
    const nuCat     = catIdx >= 0 ? cols[catIdx]?.trim() : ''

    // Normaliza data para YYYY-MM-DD
    let date = rawDate
    const parts = rawDate.split('-')
    if (parts.length === 3 && parts[0].length === 2) {
      // dd-MM-yyyy → yyyy-MM-dd
      date = `${parts[2]}-${parts[1]}-${parts[0]}`
    }

    const amount = parseFloat(rawAmount)
    if (isNaN(amount) || !date) continue

    // No Nubank: negativos = compras, positivos = pagamentos/estornos
    // Em outros formatos pode ser o contrário — inferimos pelo sinal
    const isRefund = amount > 0 && /estorno|pagamento|reembolso|credito/i.test(rawDesc)

    transactions.push({
      _id:        `imp-${Date.now()}-${i}`,
      date,
      description: rawDesc,
      amount:      Math.abs(amount),
      isRefund:    amount > 0 && !isRefund,
      category:    guessCategory(rawDesc),
      nuCategory:  nuCat,
    })
  }

  if (transactions.length === 0) return { error: 'Nenhuma transação válida encontrada.' }
  return { transactions }
}

// ── Componente principal ───────────────────────────────────────────────────
let nextId = Date.now()

export default function ImportInvoiceModal({ onClose }) {
  const { dispatch, state } = useApp()
  const fileRef = useRef()
  const [step, setStep] = useState('upload') // upload | preview | done
  const [drag, setDrag] = useState(false)
  const [error, setError] = useState('')
  const [rows, setRows] = useState([])
  const [invoiceMonth, setInvoiceMonth] = useState(new Date().getMonth() + 1)
  const [invoiceYear, setInvoiceYear]   = useState(new Date().getFullYear())
  const [editCat, setEditCat] = useState(null) // id da linha com dropdown aberto

  function handleFile(file) {
    if (!file) return
    if (!file.name.endsWith('.csv')) { setError('Selecione um arquivo .csv'); return }
    const reader = new FileReader()
    reader.onload = e => {
      const { transactions, error: err } = parseCSV(e.target.result)
      if (err) { setError(err); return }
      setRows(transactions)
      setStep('preview')
      setError('')
    }
    reader.readAsText(file, 'UTF-8')
  }

  function onDrop(e) {
    e.preventDefault(); setDrag(false)
    handleFile(e.dataTransfer.files[0])
  }

  function updateRowCat(id, cat) {
    setRows(r => r.map(row => row._id === id ? { ...row, category: cat } : row))
    setEditCat(null)
  }

  function doImport() {
    const invoiceId  = `inv-${invoiceYear}-${String(invoiceMonth).padStart(2, '0')}`
    const monthKey   = `${invoiceYear}-${String(invoiceMonth).padStart(2, '0')}`
    const closeDay   = String(state.settings.closeDay).padStart(2, '0')
    const nextMon    = invoiceMonth === 12 ? 1 : invoiceMonth + 1
    const nextYear   = invoiceMonth === 12 ? invoiceYear + 1 : invoiceYear
    const dueDay     = String(state.settings.dueDay).padStart(2, '0')

    const exists = state.invoices.some(i => i.id === invoiceId)
    if (!exists) {
      dispatch({
        type: 'ADD_INVOICE',
        payload: {
          id: invoiceId,
          month: monthKey,
          label: `${PT_MONTHS[invoiceMonth - 1]} ${invoiceYear}`,
          closeDate: `${monthKey}-${closeDay}`,
          dueDate:   `${nextYear}-${String(nextMon).padStart(2, '0')}-${dueDay}`,
          totalAmount: 0, totalPurchases: 0,
          creditLimit: state.settings.creditLimit,
          status: 'open',
        },
      })
    }

    const newTransactions = rows.map(row => ({
      id:          String(nextId++),
      date:        row.date,
      description: row.description,
      amount:      row.isRefund ? -row.amount : row.amount,
      category:    row.category,
      invoiceId,
    }))

    dispatch({ type: 'ADD_INSTALLMENTS', payload: { newInvoices: [], newTransactions } })
    setStep('done')
  }

  const totalImport = rows.filter(r => !r.isRefund).reduce((s, r) => s + r.amount, 0)
  const fmt = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Importar fatura</h2>
            <p className="text-xs text-gray-400 mt-0.5">CSV exportado pelo app do Nubank</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <div className="overflow-y-auto flex-1 p-5">

          {/* ── STEP: UPLOAD ── */}
          {step === 'upload' && (
            <div className="space-y-4">
              {/* Instruções */}
              <div className="bg-nu-light rounded-xl p-4 space-y-1.5">
                <p className="text-xs font-semibold text-nu-dark">Como exportar do Nubank:</p>
                <ol className="text-xs text-nu-dark space-y-1 list-decimal list-inside">
                  <li>Abra o app Nubank → Cartão de crédito</li>
                  <li>Toque na fatura desejada</li>
                  <li>Toque em <strong>"Exportar"</strong> ou nos três pontinhos (⋯)</li>
                  <li>Selecione <strong>"Exportar extrato (.csv)"</strong></li>
                  <li>Salve o arquivo e importe aqui</li>
                </ol>
              </div>

              {/* Drop zone */}
              <div
                onDragOver={e => { e.preventDefault(); setDrag(true) }}
                onDragLeave={() => setDrag(false)}
                onDrop={onDrop}
                onClick={() => fileRef.current.click()}
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-colors ${
                  drag ? 'border-nu-purple bg-nu-light' : 'border-gray-200 hover:border-nu-purple hover:bg-gray-50'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-nu-light flex items-center justify-center">
                  <Upload size={22} className="text-nu-purple" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700">Arraste o arquivo CSV aqui</p>
                  <p className="text-xs text-gray-400 mt-1">ou clique para selecionar</p>
                </div>
                <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={e => handleFile(e.target.files[0])} />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
                  <AlertCircle size={15} /> {error}
                </div>
              )}
            </div>
          )}

          {/* ── STEP: PREVIEW ── */}
          {step === 'preview' && (
            <div className="space-y-4">
              {/* Fatura destino */}
              <div>
                <label className="text-xs text-gray-500 block mb-1">Importar para a fatura de</label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nu-purple/30"
                    value={invoiceMonth} onChange={e => setInvoiceMonth(Number(e.target.value))}
                  >
                    {PT_MONTHS.map((name, i) => <option key={i + 1} value={i + 1}>{name}</option>)}
                  </select>
                  <select
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nu-purple/30"
                    value={invoiceYear} onChange={e => setInvoiceYear(Number(e.target.value))}
                  >
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              {/* Resumo */}
              <div className="flex items-center justify-between text-sm bg-gray-50 rounded-xl px-4 py-3">
                <span className="text-gray-500">{rows.length} lançamentos encontrados</span>
                <span className="font-bold text-gray-900">{fmt(totalImport)}</span>
              </div>

              {/* Tabela de preview */}
              <div className="text-xs text-gray-400 mb-1">Toque na categoria para alterar</div>
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                <div className="grid grid-cols-[80px_1fr_120px_70px] bg-gray-50 px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-100">
                  <span>Data</span><span>Descrição</span><span>Categoria</span><span className="text-right">Valor</span>
                </div>
                <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
                  {rows.map(row => {
                    const cat = getCategoryById(row.category)
                    return (
                      <div key={row._id} className="grid grid-cols-[80px_1fr_120px_70px] px-3 py-2 items-center text-xs">
                        <span className="text-gray-400">{row.date.slice(5).replace('-', '/')}</span>
                        <span className="text-gray-700 truncate pr-2">{row.description}</span>
                        <div className="relative">
                          <button
                            onClick={() => setEditCat(editCat === row._id ? null : row._id)}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors max-w-full"
                            style={{ color: cat.color }}
                          >
                            <span>{cat.icon}</span>
                            <span className="truncate text-xs">{cat.name}</span>
                            <ChevronDown size={10} />
                          </button>
                          {editCat === row._id && (
                            <div className="absolute left-0 top-full mt-1 z-10 bg-white border border-gray-200 rounded-xl shadow-lg w-44 max-h-52 overflow-y-auto">
                              {CATEGORIES.map(c => (
                                <button
                                  key={c.id}
                                  onClick={() => updateRowCat(row._id, c.id)}
                                  className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 text-xs text-left"
                                  style={{ color: c.color }}
                                >
                                  <span>{c.icon}</span><span>{c.name}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <span className={`text-right font-medium ${row.isRefund ? 'text-green-600' : 'text-gray-800'}`}>
                          {row.isRefund ? '-' : ''}{fmt(row.amount)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP: DONE ── */}
          {step === 'done' && (
            <div className="flex flex-col items-center justify-center py-10 gap-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <Check size={32} className="text-green-600" />
              </div>
              <div className="text-center">
                <p className="text-base font-semibold text-gray-900">Importação concluída!</p>
                <p className="text-sm text-gray-500 mt-1">{rows.length} lançamentos adicionados à fatura de {PT_MONTHS[invoiceMonth - 1]} {invoiceYear}</p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 pb-5 pt-3 border-t border-gray-100 flex-shrink-0 flex gap-2">
          {step === 'upload' && (
            <button onClick={onClose} className="btn-ghost flex-1 border border-gray-200">Cancelar</button>
          )}
          {step === 'preview' && (
            <>
              <button onClick={() => setStep('upload')} className="btn-ghost flex-1 border border-gray-200">Voltar</button>
              <button onClick={doImport} className="btn-primary flex-1">
                Importar {rows.length} lançamentos
              </button>
            </>
          )}
          {step === 'done' && (
            <button onClick={onClose} className="btn-primary flex-1">Fechar</button>
          )}
        </div>
      </div>
    </div>
  )
}
