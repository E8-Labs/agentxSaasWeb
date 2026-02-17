'use client'

import { ThemeProvider, createTheme } from '@mui/material/styles'

/**
 * MUI theme that allows focus to leave modals so the Agentation annotation
 * toolbar can receive focus when a modal is open (enables annotating modals/popups).
 * disableEnforceFocus: true is applied to all MUI Modal/Dialog by default.
 */
const agentationFriendlyModalTheme = createTheme({
  components: {
    MuiModal: {
      defaultProps: {
        disableEnforceFocus: true,
      },
    },
  },
})

export function MuiModalThemeProvider({ children }) {
  return (
    <ThemeProvider theme={agentationFriendlyModalTheme}>
      {children}
    </ThemeProvider>
  )
}
