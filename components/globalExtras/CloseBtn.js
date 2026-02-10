import Image from 'next/image'
import React from 'react'

const CloseBtn = ({ onClick, showWhiteCross, className = '', iconSize = 10, ...props }) => {
  return (
    <div>
      <button
        className={`cursor-pointer w-5 h-5 rounded-full bg-[#00000010] flex items-center justify-center ${className}`}
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
