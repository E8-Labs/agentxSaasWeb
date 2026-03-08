'use client'

import Lottie from 'lottie-react'
import { CopyPlus } from 'lucide-react'

// Function to render Lucide icon with branding color or black
const renderBrandedLucideIcon = (IconComponent, size = 18, useBlack = false) => {
  let iconColor = 'hsl(270 75% 50%)'
  if (useBlack) {
    iconColor = '#000'
  } else if (typeof window !== 'undefined') {
    const root = document.documentElement
    const brandColor = getComputedStyle(root).getPropertyValue('--brand-primary')?.trim()
    if (brandColor && brandColor.trim() && brandColor.length >= 3) {
      iconColor = `hsl(${brandColor.trim()})`
    }
  }

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

export default function DuplicateButton({ handleDuplicate, loading = false, size = 18, useBlack = false }) {
  return (
    <button className="relative flex items-center justify-center" style={{ width: size + 8, height: size + 8, minWidth: size + 8, minHeight: size + 8 }} onClick={handleDuplicate}>
      {loading ? (
        <Lottie
          animationData={require('../../public/assets/animation/duplicateAnimation.json')}
          loop
          style={{ width: size, height: size }}
        />
      ) : (
        renderBrandedLucideIcon(CopyPlus, size, useBlack)
      )}
    </button>
  )
}
