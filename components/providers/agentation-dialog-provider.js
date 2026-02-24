'use client'

import { createContext } from 'react'

/**
 * When true, Radix Dialog uses modal={false} so focus can escape to the
 * Agentation toolbar, allowing users to type annotation comments while a modal is open.
 * Only enabled in development when NEXT_PUBLIC_DESIGN_FRIENDLY_DEBUG is set.
 */
export const AgentationDialogContext = createContext(false)

export function AgentationDialogProvider({ children }) {
  const useModalFalse =
    process.env.NODE_ENV === 'development' &&
    process.env.NEXT_PUBLIC_DESIGN_FRIENDLY_DEBUG === 'true'

  return (
    <AgentationDialogContext.Provider value={useModalFalse}>
      {children}
    </AgentationDialogContext.Provider>
  )
}
