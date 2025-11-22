'use client'

import {
  CheckCircle2,
  InfoIcon,
  Loader2Icon,
  TriangleAlertIcon,
  XCircle,
} from 'lucide-react'
import { Toaster as Sonner } from 'sonner'

const Toaster = ({ ...props }) => {
  return (
    <Sonner
      theme="light"
      position="top-center"
      className="toaster group"
      icons={{
        success: <CheckCircle2 className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <XCircle className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={{
        '--normal-bg': 'hsl(var(--popover))',
        '--normal-text': 'hsl(var(--popover-foreground))',
        '--normal-border': 'hsl(var(--border))',
        '--border-radius': 'calc(var(--radius) - 2px)',
      }}
      {...props}
    />
  )
}

export { Toaster }
