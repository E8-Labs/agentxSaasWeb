'use client'

import { ThemeProvider, createTheme } from '@mui/material/styles'

/**
 * Base theme: Menu/Select dropdowns use an invisible backdrop so they behave
 * like dropdowns (no fullscreen overlay). Applied for all MUI usage.
 */
const baseTheme = createTheme({
  components: {
    MuiMenu: {
      defaultProps: {
        BackdropProps: { invisible: true },
      },
    },
  },
})

/**
 * When Agentation (design-friendly annotation) is active, MUI Modal's focus trap
 * prevents the annotation popup's textarea from receiving focus. This theme adds
 * Modal/Backdrop overrides and keeps Menu dropdown behavior.
 */
const designFriendlyTheme = createTheme(baseTheme, {
  components: {
    MuiModal: {
      defaultProps: {
        disableEnforceFocus: true,
        disableAutoFocus: true,
      },
    },
    MuiBackdrop: {
      styleOverrides: {
        root: ({ ownerState }) => ({
          ...(ownerState?.invisible !== true && {
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
          }),
        }),
      },
    },
  },
})

export function MuiAgentationThemeProvider({ children }) {
  const isDesignFriendly =
    process.env.NODE_ENV === 'development' &&
    process.env.NEXT_PUBLIC_DESIGN_FRIENDLY_DEBUG === 'true'

  const theme = isDesignFriendly ? designFriendlyTheme : baseTheme
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>
}
