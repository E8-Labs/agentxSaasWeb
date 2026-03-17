'use client'

import { createContext } from 'react'

/**
 * When set, DropdownMenu and Popover content that render in a portal use this z-index
 * so they appear above high-z-index overlays (e.g. MUI Drawer at 5000).
 * Use PortalZIndexProvider with value 5010 (or higher than the overlay) when rendering
 * TaskCards or other dropdown/popover content inside TeamMemberActivityDrawer.
 */
export const PortalZIndexContext = createContext(null)

/**
 * @param {React.ReactNode} children
 * @param {number} value - Z-index for portaled dropdown/popover content (e.g. 5010)
 */
export function PortalZIndexProvider({ children, value }) {
  return (
    <PortalZIndexContext.Provider value={value ?? null}>
      {children}
    </PortalZIndexContext.Provider>
  )
}
