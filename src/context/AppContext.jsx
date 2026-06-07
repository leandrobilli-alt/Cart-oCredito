import React, { createContext, useContext, useReducer } from 'react'
import { INITIAL_TRANSACTIONS, INITIAL_INVOICE, INITIAL_SETTINGS } from '../data/sampleData'
import { CATEGORIES } from '../data/categories'
import { INITIAL_FINANCES } from '../data/financeData'

const AppContext = createContext(null)

function loadState() {
  try {
    const raw = localStorage.getItem('cc_dashboard_v2')
    if (raw) {
      const parsed = JSON.parse(raw)
      let migrated = false
      if (!parsed.finances) {
        parsed.finances = INITIAL_FINANCES
        migrated = true
      }
      if (!parsed.categories) {
        parsed.categories = CATEGORIES
      } else {
        // migração: adiciona novas categorias padrão que ainda não existem
        const existingIds = new Set(parsed.categories.map(c => c.id))
        const newDefaults = CATEGORIES.filter(c => !existingIds.has(c.id))
        if (newDefaults.length > 0) {
          const outrosIdx = parsed.categories.findIndex(c => c.id === 'outros')
          if (outrosIdx >= 0) parsed.categories.splice(outrosIdx, 0, ...newDefaults)
          else parsed.categories.push(...newDefaults)
        }
      }

      // migração: corrige lançamentos de pagamento/estorno importados com o sinal
      // trocado por uma versão antiga do importador — eles ficaram salvos como
      // compra positiva e por isso aparecem como o maior gasto da fatura
      if (parsed.transactions) {
        const REFUND_RE = /^(pagamento|pag\.?\s*antecip|estorno|reembolso|fatura paga)/i
        parsed.transactions = parsed.transactions.map(t => {
          if (t.amount > 0 && REFUND_RE.test(t.description || '')) {
            migrated = true
            return { ...t, amount: -t.amount, isRefund: true }
          }
          return t
        })
      }

      if (migrated) saveState(parsed)
      return parsed
    }
  } catch {}
  return null
}

function saveState(state) {
  localStorage.setItem('cc_dashboard_v2', JSON.stringify(state))
}

const initialState = loadState() || {
  transactions: INITIAL_TRANSACTIONS,
  invoices: [INITIAL_INVOICE],
  settings: INITIAL_SETTINGS,
  categories: CATEGORIES,
  finances: INITIAL_FINANCES,
}

const FINANCE_KEY = { expense: 'expenses', revenue: 'revenues' }

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_TRANSACTION': {
      const next = { ...state, transactions: [action.payload, ...state.transactions] }
      saveState(next); return next
    }
    case 'UPDATE_TRANSACTION': {
      const next = { ...state, transactions: state.transactions.map(t => t.id === action.payload.id ? { ...t, ...action.payload } : t) }
      saveState(next); return next
    }
    case 'DELETE_TRANSACTION': {
      const next = { ...state, transactions: state.transactions.filter(t => t.id !== action.id) }
      saveState(next); return next
    }
    case 'UPDATE_SETTINGS': {
      const next = { ...state, settings: { ...state.settings, ...action.payload } }
      saveState(next); return next
    }
    case 'ADD_INVOICE': {
      const next = { ...state, invoices: [action.payload, ...state.invoices] }
      saveState(next); return next
    }
    case 'DELETE_INVOICE': {
      const next = {
        ...state,
        invoices: state.invoices.filter(i => i.id !== action.id),
        transactions: action.deleteTransactions
          ? state.transactions.filter(t => t.invoiceId !== action.id)
          : state.transactions,
      }
      saveState(next); return next
    }
    case 'ADD_INSTALLMENTS': {
      const { newInvoices, newTransactions } = action.payload
      const existingIds = new Set(state.invoices.map(i => i.id))
      const next = {
        ...state,
        invoices: [...newInvoices.filter(i => !existingIds.has(i.id)), ...state.invoices],
        transactions: [...newTransactions, ...state.transactions],
      }
      saveState(next); return next
    }
    case 'ADD_CATEGORY': {
      const next = { ...state, categories: [...state.categories, action.payload] }
      saveState(next); return next
    }
    case 'DELETE_CATEGORY': {
      const next = { ...state, categories: state.categories.filter(c => c.id !== action.id) }
      saveState(next); return next
    }
    case 'ADD_FINANCE_ACCOUNT': {
      const { kind, account } = action.payload
      const key = FINANCE_KEY[kind]
      const next = { ...state, finances: { ...state.finances, [key]: [...state.finances[key], account] } }
      saveState(next); return next
    }
    case 'RENAME_FINANCE_ACCOUNT': {
      const { kind, id, name } = action.payload
      const key = FINANCE_KEY[kind]
      const next = {
        ...state,
        finances: { ...state.finances, [key]: state.finances[key].map(a => a.id === id ? { ...a, name } : a) },
      }
      saveState(next); return next
    }
    case 'DELETE_FINANCE_ACCOUNT': {
      const { kind, id } = action.payload
      const key = FINANCE_KEY[kind]
      const next = { ...state, finances: { ...state.finances, [key]: state.finances[key].filter(a => a.id !== id) } }
      saveState(next); return next
    }
    case 'SET_FINANCE_VALUE': {
      const { kind, id, month, value } = action.payload
      const key = FINANCE_KEY[kind]
      const next = {
        ...state,
        finances: {
          ...state.finances,
          [key]: state.finances[key].map(a => {
            if (a.id !== id) return a
            const values = { ...a.values }
            if (value === null || value === undefined) delete values[month]
            else values[month] = value
            return { ...a, values }
          }),
        },
      }
      saveState(next); return next
    }
    case 'RESET': {
      const fresh = { transactions: INITIAL_TRANSACTIONS, invoices: [INITIAL_INVOICE], settings: INITIAL_SETTINGS, categories: CATEGORIES, finances: INITIAL_FINANCES }
      saveState(fresh); return fresh
    }
    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>
}

export function useApp() {
  return useContext(AppContext)
}

// Hook conveniente: retorna categorias do estado + helper getCat
export function useCategories() {
  const { state } = useApp()
  const categories = state.categories || CATEGORIES
  const getCat = (id) => categories.find(c => c.id === id) || { id: 'outros', name: 'Outros', icon: '❓', color: '#94a3b8' }
  return { categories, getCat }
}

