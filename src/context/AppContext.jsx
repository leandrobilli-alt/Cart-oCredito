import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { INITIAL_TRANSACTIONS, INITIAL_INVOICE, INITIAL_SETTINGS } from '../data/sampleData'

const AppContext = createContext(null)

function loadState() {
  try {
    const raw = localStorage.getItem('cc_dashboard_v2')
    if (raw) return JSON.parse(raw)
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
}

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_TRANSACTION': {
      const next = { ...state, transactions: [action.payload, ...state.transactions] }
      saveState(next)
      return next
    }
    case 'UPDATE_TRANSACTION': {
      const next = {
        ...state,
        transactions: state.transactions.map(t =>
          t.id === action.payload.id ? { ...t, ...action.payload } : t
        ),
      }
      saveState(next)
      return next
    }
    case 'DELETE_TRANSACTION': {
      const next = { ...state, transactions: state.transactions.filter(t => t.id !== action.id) }
      saveState(next)
      return next
    }
    case 'UPDATE_SETTINGS': {
      const next = { ...state, settings: { ...state.settings, ...action.payload } }
      saveState(next)
      return next
    }
    case 'ADD_INVOICE': {
      const next = { ...state, invoices: [action.payload, ...state.invoices] }
      saveState(next)
      return next
    }
    case 'DELETE_INVOICE': {
      const next = {
        ...state,
        invoices: state.invoices.filter(i => i.id !== action.id),
        // Remove também os lançamentos vinculados se solicitado
        transactions: action.deleteTransactions
          ? state.transactions.filter(t => t.invoiceId !== action.id)
          : state.transactions,
      }
      saveState(next)
      return next
    }
    // Cria todas as parcelas de uma vez + auto-cria as faturas necessárias
    case 'ADD_INSTALLMENTS': {
      const { newInvoices, newTransactions } = action.payload
      const existingIds = new Set(state.invoices.map(i => i.id))
      const invoicesToAdd = newInvoices.filter(i => !existingIds.has(i.id))
      const next = {
        ...state,
        invoices: [...invoicesToAdd, ...state.invoices],
        transactions: [...newTransactions, ...state.transactions],
      }
      saveState(next)
      return next
    }
    case 'RESET': {
      const fresh = {
        transactions: INITIAL_TRANSACTIONS,
        invoices: [INITIAL_INVOICE],
        settings: INITIAL_SETTINGS,
      }
      saveState(fresh)
      return fresh
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
