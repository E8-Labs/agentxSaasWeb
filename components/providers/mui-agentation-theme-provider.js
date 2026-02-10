'use client'

import { ThemeProvider, createTheme } from '@mui/material/styles'

/**
 * When Agentation (design-friendly annotation) is active, MUI Modal's focus trap
 * prevents the annotation popup's textarea from receiving focus, so the input
 * appears disabled. This provider sets Modal (and Dialog) to not enforce focus
 * so the user can type in the annotation popup when annotating modal content.
 * Only applied when NEXT_PUBLIC_DESIGN_FRIENDLY_DEBUG is true.
 */
const designFriendlyTheme = createTheme({
  components: {
    MuiModal: {
      defaultProps: {
        disableEnforceFocus: true,
        disableAutoFocus: true,
      },
    },
  },
})

export function MuiAgentationThemeProvider({ children }) {
  const isDesignFriendly =
    process.env.NODE_ENV === 'development' &&
    process.env.NEXT_PUBLIC_DESIGN_FRIENDLY_DEBUG === 'true'

  if (!isDesignFriendly) {
    return children
  }

  return <ThemeProvider theme={designFriendlyTheme}>{children}</ThemeProvider>
}
