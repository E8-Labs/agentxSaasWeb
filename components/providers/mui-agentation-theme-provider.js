'use client'

import { ThemeProvider, createTheme } from '@mui/material/styles'

/**
 * Base theme: Menu/Select dropdowns use an invisible backdrop and consistent
 * styling (animation, hover, sizing, padding, shadow) for all combo boxes.
 */
const baseTheme = createTheme({
  components: {
    MuiMenu: {
      defaultProps: {
        BackdropProps: { invisible: true },
      },
      styleOverrides: {
        paper: {
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          padding: '8px 0',
          minWidth: 120,
        },
        list: {
          padding: '4px',
        },
      },
    },
    MuiMenuItem: {
      defaultProps: {
        disableRipple: true,
      },
      styleOverrides: {
        root: {
          fontSize: 14,
          borderRadius: '6px',
          margin: '0 4px',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.02)',
          },
        },
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
