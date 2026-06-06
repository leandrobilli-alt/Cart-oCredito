import React, { createContext, useContext, useReducer } from 'react'
import { INITIAL_TRANSACTIONS, INITIAL_INVOICE, INITIAL_SETTINGS } from '../data/sampleData'
import { CATEGORIES } from '../data/categories'

const AppContext = createContext(null)

function loadState() {
  try {
    const raw = localStorage.getItem('cc_dashboard_v2')
    if (raw) {
      const parsed = JSON.parse(raw)
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
}

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
    case 'RESET': {
      const fresh = { transactions: INITIAL_TRANSACTIONS, invoices: [INITIAL_INVOICE], settings: INITIAL_SETTINGS, categories: CATEGORIES }
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

