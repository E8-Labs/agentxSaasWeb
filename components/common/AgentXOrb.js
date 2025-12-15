'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'

/**
 * Reusable AgentX Orb Component
 *
 * Wraps the animated /agentXOrb.gif with the `unoptimized` prop
 * to prevent Next.js Image optimization warnings for animated GIFs.
 *
 * @param {number} size - Width and height of the orb (default: 42)
 * @param {number} width - Custom width (overrides size)
 * @param {number} height - Custom height (overrides size)
 * @param {string} className - Additional CSS classes
 * @param {string} alt - Alt text for accessibility (default: 'AgentX')
 * @param {object} style - Inline styles to apply
 * @param {string} sizes - Responsive sizes hint for fill mode
 * @param {object} props - Additional props passed to Image component
 */
export function AgentXOrb({
  size = 42,
  width,
  height,
  className,
  alt = 'AgentX',
  style,
  sizes,
  ...props
}) {
  // Build image props - include sizes if provided (required for fill mode)
  const imageProps = {
    src: '/agentXOrb.gif',
    alt,
    unoptimized: true,
    className: cn('rounded-full', className),
    style,
    ...props,
  }

  // Add sizes if provided (for fill mode)
  if (sizes) {
    imageProps.sizes = sizes
  }

  // Only add width/height if not using fill mode
  if (!props.fill) {
    imageProps.width = width || size
    imageProps.height = height || size
  }

  return <Image {...imageProps} />
}

export default AgentXOrb
