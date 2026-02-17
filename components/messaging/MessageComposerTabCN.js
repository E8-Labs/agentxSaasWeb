'use client'

import React, { useState, useEffect } from 'react'

/**
 * MessageComposerTabCN - A reusable tab component for message composer
 * Features capsule/pill design for selected state with brand-primary background
 * 
 * @param {Object} props
 * @param {React.Component} props.icon - Lucide icon component
 * @param {string} props.label - Tab label text
 * @param {boolean} props.isActive - Whether this tab is currently selected
 * @param {Function} props.onClick - Click handler function
 * @param {number} [props.iconSize=20] - Size of the icon
 */
const MessageComposerTabCN = ({ 
  icon: IconComponent, 
  label, 
  isActive, 
  onClick,
  iconSize = 20 
}) => {
  // Get brand color for icon when active
  const getIconColor = () => {
    if (typeof window === 'undefined') return "#6c757d"//'hsl(0 0% 60%)'
    
    if (isActive) {
      const root = document.documentElement
      const brandColor = getComputedStyle(root).getPropertyValue('--brand-primary')
      if (brandColor && brandColor.trim()) {
        return `hsl(${brandColor.trim()})`
      }
      return 'hsl(var(--brand-primary))'
    }
    return "#6c757d" // Muted gray for inactive
  }

  const iconColor = getIconColor()
  const [backgroundColor, setBackgroundColor] = useState('transparent')

  useEffect(() => {
    if (isActive && typeof window !== 'undefined') {
      const root = document.documentElement
      const brandColor = getComputedStyle(root).getPropertyValue('--brand-primary')
      
      if (brandColor && brandColor.trim()) {
        // The CSS variable is in format "270 75% 50%" (space-separated, without hsl())
        // Convert to hsla with opacity - add commas for hsla() function
        const parts = brandColor.trim().split(/\s+/)
        if (parts.length >= 3) {
          const [h, s, l] = parts
          setBackgroundColor(`hsla(${h}, ${s}, ${l}, 0.1)`)
        } else {
          // If format is unexpected, try using it as-is
          setBackgroundColor(`hsla(${brandColor.trim()}, 0.1)`)
        }
      } else {
        // Fallback: use default purple with opacity
        setBackgroundColor('hsla(270, 75%, 50%, 0.1)')
      }
    } else {
      setBackgroundColor('transparent')
    }
  }, [isActive])

  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-full
        transition-all duration-200
        ${isActive 
          ? 'text-brand-primary' 
          : 'text-[#6c757d] hover:text-[#5C646B] hover:bg-gray-100'
        }
      `}
      style={{ backgroundColor }}
      aria-label={label}
      aria-selected={isActive}
    >
      <IconComponent
        size={iconSize}
        style={{
          color: iconColor,
          stroke: iconColor,
          flexShrink: 0,
          transition: 'color 0.2s ease-in-out, stroke 0.2s ease-in-out',
        }}
      />
      <span>{label}</span>
    </button>
  )
}

export default MessageComposerTabCN

