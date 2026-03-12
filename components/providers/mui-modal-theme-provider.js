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
          backgroundColor: 'hsl(0 0% 9%)',
          color: 'hsl(0 0% 98%)',
          fontSize: '12px',
          fontWeight: 500,
          padding: '6px 12px',
          borderRadius: 8,
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.15)',
          border: '1px solid #eaeaea',
        },
        arrow: {
          color: 'hsl(0 0% 9%)',
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          border: '1px solid #eaeaea',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
          borderRadius: 12,
          padding: '6px',
          minWidth: 160,
          animation: 'mui-menu-entry 0.2s ease-out forwards',
        },
        list: {
          padding: 0,
          fontSize: 14,
          gap: '2px',
        },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          border: '1px solid #eaeaea',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
          borderRadius: 12,
          padding: '6px',
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
          fontWeight: 400,
          padding: '8px 12px',
          borderRadius: 8,
          backgroundColor: 'transparent',
          transition: 'background-color 0.15s ease-out',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
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
