import Image from 'next/image'
import React from 'react'

const CloseBtn = ({ onClick, showWhiteCross, className = '', iconSize = 16, ...props }) => {
  return (
    <button
      type="button"
      className={`inline-flex h-8 w-8 items-center justify-center gap-2 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer ${className}`}
      onClick={onClick}
      aria-label="Close"
      {...props}
    >
      <Image
        alt=""
        aria-hidden
        src="/assets/cross.png"
        width={iconSize}
        height={iconSize}
        className="pointer-events-none shrink-0"
        style={{ opacity: 0.8, filter: showWhiteCross ? 'invert(1)' : 'invert(0)' }}
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
