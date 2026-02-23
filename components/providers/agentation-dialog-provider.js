'use client'

import { createContext, useContext } from 'react'

/**
 * When Agentation toolbar is active, dialogs should not trap focus so the
 * annotation field can receive focus (see process-agentation skill).
 * This context provides trapFocus: false for Radix DialogContent.
 */
const AgentationDialogContext = createContext({ trapFocus: false })

export function AgentationDialogProvider({ children }) {
  return (
    <AgentationDialogContext.Provider value={{ trapFocus: false }}>
      {children}
    </AgentationDialogContext.Provider>
  )
}

export function useAgentationDialog() {
  return useContext(AgentationDialogContext)
}
