import React, { createContext, useContext, useReducer } from 'react'
import { SEED_EXPENSES, SEED_REVENUES } from '../data/seedData'

const FinanceContext = createContext(null)
const STORAGE_KEY = 'financas_pessoais_v1'

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return null
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

const initialState = loadState() || {
  expenses: SEED_EXPENSES,
  revenues: SEED_REVENUES,
}

function slugify(name) {
  return name
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_VALUE': {
      const { kind, id, monthKey, value } = action.payload
      const next = {
        ...state,
        [kind]: state[kind].map(acc => {
          if (acc.id !== id) return acc
          const values = { ...acc.values }
          if (value === null) delete values[monthKey]
          else values[monthKey] = value
          return { ...acc, values }
        }),
      }
      saveState(next); return next
    }
    case 'ADD_ACCOUNT': {
      const { kind, name } = action.payload
      const id = `${slugify(name) || 'conta'}-${Date.now().toString(36)}`
      const next = { ...state, [kind]: [...state[kind], { id, name, values: {} }] }
      saveState(next); return next
    }
    case 'RENAME_ACCOUNT': {
      const { kind, id, name } = action.payload
      const next = { ...state, [kind]: state[kind].map(acc => acc.id === id ? { ...acc, name } : acc) }
      saveState(next); return next
    }
    case 'DELETE_ACCOUNT': {
      const { kind, id } = action.payload
      const next = { ...state, [kind]: state[kind].filter(acc => acc.id !== id) }
      saveState(next); return next
    }
    case 'RESET': {
      const fresh = { expenses: SEED_EXPENSES, revenues: SEED_REVENUES }
      saveState(fresh); return fresh
    }
    default:
      return state
  }
}

export function FinanceProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  return <FinanceContext.Provider value={{ state, dispatch }}>{children}</FinanceContext.Provider>
}

export function useFinance() {
  return useContext(FinanceContext)
}
