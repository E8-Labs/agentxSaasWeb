'use client'

import Lottie from 'lottie-react'
import { CopyPlus } from 'lucide-react'

// Function to render Lucide icon with branding color (same logic as NotificationsDrawer.js)
const renderBrandedLucideIcon = (IconComponent, size = 18) => {
  if (typeof window === 'undefined') {
    return <IconComponent size={size} />
  }

  // Get brand color from CSS variable
  const root = document.documentElement
  const brandColor = getComputedStyle(root).getPropertyValue('--brand-primary')?.trim()

  // Use brand color or fallback to default purple
  const iconColor = brandColor && brandColor.trim() && brandColor.length >= 3
    ? `hsl(${brandColor.trim()})`
    : 'hsl(270 75% 50%)' // Default purple

  return (
    <IconComponent
      size={size}
      style={{
        color: iconColor,
        stroke: iconColor,
        flexShrink: 0,
        transition: 'color 0.2s ease-in-out, stroke 0.2s ease-in-out',
      }}
    />
  )
}

export default function DuplicateButton({ handleDuplicate, loading = false }) {
  return (
    <button className="relative w-[24px] h-[24px] flex items-center justify-center" onClick={handleDuplicate}>
      {loading ? (
        <Lottie
          animationData={require('../../public/assets/animation/duplicateAnimation.json')}
          loop
          style={{ width: 18, height: 18 }}
        />
      ) : (
        renderBrandedLucideIcon(CopyPlus, 18)
      )}
    </button>
  )
}
