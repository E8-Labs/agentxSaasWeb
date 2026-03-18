import { X } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

const CloseBtn = ({ onClick, showWhiteCross, className = '', iconSize = 14, ...props }) => {
  return (
    <button
      type="button"
      className={`inline-flex h-8 w-8 items-center justify-center gap-2 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer ${className}`}
      onClick={onClick}
      aria-label="Close"
      {...props}
    >
      <X
        size={iconSize}
        className={`shrink-0 ${showWhiteCross ? 'text-white' : 'text-foreground'}`}
        strokeWidth={2.5}
        aria-hidden
      />
    </button>
  )
}

export default CloseBtn

export const CloseBtn2 = ({ onClick }) => {
  return (
    <div>
      <button className="outline-none" onClick={onClick}>
        <Image
          src={'/assets/blackBgCross.png'}
          height={20}
          width={20}
          alt="*"
        />
      </button>
    </div>
  )
}
