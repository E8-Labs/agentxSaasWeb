import Image from 'next/image'
import React from 'react'

const CloseBtn = ({ onClick, showWhiteCross, className = '', iconSize = 10, ...props }) => {
  return (
    <div>
      <button
        className={`cursor-pointer w-6 h-6 min-w-[24px] min-h-[24px] rounded-full bg-transparent hover:bg-[#00000010] flex items-center justify-center transition-colors ${className}`}
        onClick={onClick}
        {...props}
      >
        <Image
          alt="close"
          src="/assets/cross.png"
          width={iconSize}
          height={iconSize}
          style={{ filter: showWhiteCross ? 'invert(1)' : 'invert(0)' }}
        />
      </button>
    </div>
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
