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
    if (!isActive) setBackgroundColor('transparent')
  }, [isActive])

  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-3 h-8 text-sm font-medium rounded-lg
        transition-all duration-200
        ${isActive 
          ? (label === 'Messenger' ? 'text-black bg-black/[0.05]' : 'text-brand-primary bg-black/[0.05]')
          : 'text-[#6c757d] hover:text-[#5C646B] hover:bg-gray-100'
        }
      `}
      style={isActive ? undefined : { backgroundColor }}
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

