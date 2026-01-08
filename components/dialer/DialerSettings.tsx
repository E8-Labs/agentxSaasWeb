'use client'

import { Button as ButtonBase } from '../ui/button'

// Type assertions for components from .jsx files
const Button = ButtonBase as any

interface DialerSettingsProps {
  onTriggerDropdown?: () => void
}

export default function DialerSettings({ onTriggerDropdown }: DialerSettingsProps) {
  const handleConfigureClick = () => {
    if (onTriggerDropdown) {
      onTriggerDropdown()
    }
  }

  return (
    <Button variant="outline" onClick={handleConfigureClick}>
      Configure Dialer
    </Button>
  )
}
