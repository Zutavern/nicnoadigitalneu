'use client'

import { useState, useCallback, useRef } from 'react'

interface HistoryState<T> {
  past: T[]
  present: T
  future: T[]
}

interface UseHistoryReturn<T> {
  state: T
  setState: (newState: T | ((prev: T) => T)) => void
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  reset: (newPresent: T) => void
  historyLength: number
}

const MAX_HISTORY_LENGTH = 50

export function useHistory<T>(initialState: T): UseHistoryReturn<T> {
  const [history, setHistory] = useState<HistoryState<T>>({
    past: [],
    present: initialState,
    future: [],
  })
  
  // Ref um Batching zu verhindern bei schnellen Änderungen
  const lastUpdateRef = useRef<number>(0)
  const DEBOUNCE_MS = 100

  const setState = useCallback((newState: T | ((prev: T) => T)) => {
    const now = Date.now()
    const shouldDebounce = now - lastUpdateRef.current < DEBOUNCE_MS
    lastUpdateRef.current = now

    setHistory((prev) => {
      const resolvedState = typeof newState === 'function' 
        ? (newState as (prev: T) => T)(prev.present)
        : newState
      
      // Wenn der State gleich ist, nichts ändern
      if (JSON.stringify(resolvedState) === JSON.stringify(prev.present)) {
        return prev
      }

      // Bei schnellen Änderungen: letzten past-Eintrag überschreiben
      if (shouldDebounce && prev.past.length > 0) {
        return {
          past: prev.past,
          present: resolvedState,
          future: [],
        }
      }

      // Normaler Fall: neuen Eintrag zur History hinzufügen
      const newPast = [...prev.past, prev.present].slice(-MAX_HISTORY_LENGTH)
      
      return {
        past: newPast,
        present: resolvedState,
        future: [],
      }
    })
  }, [])

  const undo = useCallback(() => {
    setHistory((prev) => {
      if (prev.past.length === 0) return prev

      const previous = prev.past[prev.past.length - 1]
      const newPast = prev.past.slice(0, prev.past.length - 1)

      return {
        past: newPast,
        present: previous,
        future: [prev.present, ...prev.future],
      }
    })
  }, [])

  const redo = useCallback(() => {
    setHistory((prev) => {
      if (prev.future.length === 0) return prev

      const next = prev.future[0]
      const newFuture = prev.future.slice(1)

      return {
        past: [...prev.past, prev.present],
        present: next,
        future: newFuture,
      }
    })
  }, [])

  const reset = useCallback((newPresent: T) => {
    setHistory({
      past: [],
      present: newPresent,
      future: [],
    })
  }, [])

  return {
    state: history.present,
    setState,
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    reset,
    historyLength: history.past.length,
  }
}

