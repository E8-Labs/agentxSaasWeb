'use client'

import { ThemeProvider, createTheme } from '@mui/material/styles'

/**
 * MUI theme that allows focus to leave modals so the Agentation annotation
 * toolbar can receive focus when a modal is open (enables annotating modals/popups).
 * disableEnforceFocus: true is applied to all MUI Modal/Drawer by default.
 */
const agentationFriendlyModalTheme = createTheme({
  components: {
    MuiModal: {
      defaultProps: {
        disableEnforceFocus: true,
        disableAutoFocus: true,
        BackdropProps: {
          'data-agentation-backdrop': true,
          'aria-label': 'Backdrop',
        },
      },
    },
    MuiDrawer: {
      defaultProps: {
        disableEnforceFocus: true,
        disableAutoFocus: true,
      },
    },
    MuiTooltip: {
      defaultProps: {
        placement: 'top',
      },
      styleOverrides: {
        tooltip: {
          borderRadius: 8,
          border: '1px solid #eaeaea',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.15)',
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          border: '1px solid #eaeaea',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.15)',
          borderRadius: 12,
          animation: 'mui-menu-entry 0.2s ease-out forwards',
        },
        list: {
          fontSize: 14,
          gap: '2px',
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
          fontStyle: 'normal',
          backgroundColor: 'transparent',
          '&:hover': {
            backgroundColor: 'transparent',
          },
        },
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
